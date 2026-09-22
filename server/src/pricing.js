/**
 * Pricing, proration and subscription mutation rules.
 *
 * The same `buildQuote()` powers both the checkout review screen and the server
 * side checkout, so the amount a customer sees is always the amount charged.
 */

import { CURRENCY, GST_RATE, MODULES, PLANS, MODES, RENEWAL_WINDOW_DAYS } from './catalog.js';

const DAY = 86400000;

export const moduleById = (id) => MODULES.find((module) => module.id === id) || null;
export const planById = (id) => PLANS.find((plan) => plan.id === id) || null;
export const termLabel = (months) => {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years === 1 ? '' : 's'}`;
  }
  return `${months} month${months === 1 ? '' : 's'}`;
};
/** Plans are priced per plan in the catalogue; only add-on modules are priced per module. */
export const planMonthlyTotal = (plan) => plan.price || 0;

export const today = () => new Date().toISOString().slice(0, 10);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** dd Mon yyyy - used wherever a date is shown to the customer. */
export function prettyDate(iso) {
  const [year, month, day] = String(iso).slice(0, 10).split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${MONTH_NAMES[month - 1]} ${year}`;
}

export const toUTC = (iso) => {
  const [year, month, day] = String(iso).slice(0, 10).split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

export const daysRemaining = (expiresAt, from = today()) =>
  Math.round((toUTC(expiresAt) - toUTC(from)) / DAY);

export const addDaysIso = (iso, days) =>
  new Date(toUTC(iso) + days * DAY).toISOString().slice(0, 10);

/** Month-safe date arithmetic: 31 Jan + 1 month = 28/29 Feb. */
export function addMonthsIso(iso, months) {
  const base = new Date(toUTC(iso));
  const day = base.getUTCDate();
  const cursor = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  cursor.setUTCMonth(cursor.getUTCMonth() + Number(months));
  const lastDay = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
  cursor.setUTCDate(Math.min(day, lastDay));
  return cursor.toISOString().slice(0, 10);
}

export function subscriptionStatus(subscription) {
  const left = daysRemaining(subscription.expiresAt);
  if (left < 0) return 'expired';
  if (left <= RENEWAL_WINDOW_DAYS) return 'expiring';
  return 'active';
}

export const activeAddonIds = (subscription) =>
  subscription.addons
    .filter((addon) => daysRemaining(addon.expiresAt) >= 0)
    .map((addon) => addon.moduleId);

const round = (value) => Math.round(value);

/**
 * Builds the payable order for a checkout, in any of the three modes.
 *
 * addons  -> only newly selected modules are billed (active add-ons keep their own term)
 * renew   -> current plan plus every active add-on, billed for the new term
 * upgrade -> target plan plus every add-on, billed for the new term, unused balance credited
 */
export function buildQuote({
  mode = 'addons',
  planId,
  addonModuleIds = [],
  termMonths = 12,
  subscription,
  date = today(),
}) {
  const errors = [];
  const info = MODES[mode];
  if (!info) errors.push('Unknown checkout mode.');

  const requestedMonths = Number(termMonths);
  const validTerm = Number.isInteger(requestedMonths) && requestedMonths >= 1 && requestedMonths <= 120;
  if (!validTerm) errors.push('Choose a whole-number duration between 1 and 120 months.');
  const months = validTerm ? requestedMonths : 12;
  const currentPlan = planById(subscription.planId);
  if (!currentPlan) errors.push('Your current plan could not be found.');

  let targetPlan = currentPlan;
  if (mode === 'upgrade') {
    const requested = planById(planId);
    if (!requested) {
      errors.push('Select a plan to upgrade to.');
    } else if (requested.order <= currentPlan.order) {
      errors.push(`Upgrades must be a higher plan than ${currentPlan.name}. Use Renew or Add modules instead.`);
    } else {
      targetPlan = requested;
    }
  }

  const active = activeAddonIds(subscription);
  const externallySold = addonModuleIds
    .map((id) => moduleById(id))
    .filter((module) => module?.externalUrl);
  if (externallySold.length > 0) {
    errors.push(`${externallySold.map((module) => module.name).join(', ')} must be subscribed separately.`);
  }
  const requestedAddons = Array.from(new Set(addonModuleIds.filter((id) => {
    const module = moduleById(id);
    return module && !module.externalUrl;
  })));
  const addonIds = Array.from(new Set([...active, ...requestedAddons])).filter(
    (id) => !targetPlan.moduleIds.includes(id),
  );
  const billableAddons = mode === 'addons'
    ? addonIds.filter((id) => !active.includes(id))
    : addonIds;

  if (mode === 'addons' && billableAddons.length === 0) {
    errors.push('Select at least one module that is not part of your current plan.');
  }

  const lines = [];
  if (mode !== 'addons') {
    const monthly = planMonthlyTotal(targetPlan);
    lines.push({
      kind: 'plan',
      planId: targetPlan.id,
      label: `${targetPlan.name} plan`,
      detail: targetPlan.moduleIds
        .map((id) => moduleById(id).name)
        .join(' | '),
      moduleIds: [...targetPlan.moduleIds],
      monthly,
      months,
      amount: monthly * months,
    });
  }

  for (const id of billableAddons) {
    const module = moduleById(id);
    lines.push({
      kind: 'addon',
      moduleId: id,
      label: `${module.name} add-on`,
      detail: `${module.price} x ${months} month${months === 1 ? '' : 's'}`,
      monthly: module.price,
      months,
      amount: module.price * months,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);

  let credit = 0;
  let creditNote = null;
  if (mode === 'upgrade') {
    const unusedDays = Math.max(0, daysRemaining(subscription.expiresAt, date));
    const currentMonthly = planMonthlyTotal(currentPlan)
      + active.reduce((sum, id) => sum + (moduleById(id)?.price || 0), 0);
    credit = Math.min(round((currentMonthly / 30) * unusedDays), subtotal);
    if (credit > 0) {
      creditNote = `Unused balance on ${currentPlan.name} (${unusedDays} day${unusedDays === 1 ? '' : 's'} left)`;
    }
  }

  const taxable = Math.max(0, subtotal - credit);
  const tax = round(taxable * GST_RATE);
  const total = taxable + tax;

  const periodStart = mode === 'renew' && daysRemaining(subscription.expiresAt, date) > 0
    ? subscription.expiresAt
    : date;
  const newExpiry = addMonthsIso(periodStart, months);

  if (total <= 0 && errors.length === 0) errors.push('There is nothing to pay for in this order.');

  const notes = [];
  if (mode === 'renew') {
    notes.push(
      daysRemaining(subscription.expiresAt, date) < 0
        ? `Your ${currentPlan.name} plan expired on ${prettyDate(subscription.expiresAt)}. Renewing restarts it from today.`
        : 'Your plan is extended from its current expiry, so the days already paid for are not lost.',
    );
  }
  if (mode === 'upgrade') {
    notes.push(`The upgrade is effective immediately and runs until ${prettyDate(newExpiry)}.`);
  }
  if (mode === 'addons') {
    notes.push(`New modules are active immediately and run until ${prettyDate(newExpiry)}.`);
  }

  return {
    mode,
    modeLabel: info?.label || mode,
    ctaLabel: info?.cta || 'Pay now',
    invoiceType: info?.invoiceType || 'Purchase',
    planId: targetPlan.id,
    planName: targetPlan.name,
    planCode: targetPlan.code,
    planModuleIds: [...targetPlan.moduleIds],
    addonModuleIds: addonIds,
    billableAddonModuleIds: billableAddons,
    termMonths: months,
    termLabel: termLabel(months),
    currency: CURRENCY,
    gstRate: GST_RATE,
    currentExpiry: subscription.expiresAt,
    periodStart,
    newExpiry,
    lines,
    subtotal,
    credit,
    creditNote,
    taxable,
    tax,
    total,
    notes,
    errors,
  };
}

/** Applies a paid checkout to the store and returns the created invoice. */
export function applyCheckout(db, {
  mode,
  planId,
  addonModuleIds = [],
  termMonths = 12,
  paymentMethod = 'upi',
  date = today(),
}) {
  const quote = buildQuote({ mode, planId, addonModuleIds, termMonths, subscription: db.subscription, date });
  if (quote.errors.length) {
    const error = new Error(quote.errors[0]);
    error.status = 400;
    error.details = quote.errors;
    throw error;
  }

  const subscription = db.subscription;
  db.counter += 1;

  const invoice = {
    id: `inv-${date.replaceAll('-', '')}-${db.counter}`,
    number: `INV-${date.slice(0, 4)}-${db.counter}`,
    type: mode,
    typeLabel: quote.invoiceType,
    date,
    status: 'Paid',
    paymentMethod,
    planId: quote.planId,
    planName: quote.planName,
    planCode: quote.planCode,
    termMonths: quote.termMonths,
    termLabel: quote.termLabel,
    lines: quote.lines,
    subtotal: quote.subtotal,
    credit: quote.credit,
    creditNote: quote.creditNote,
    tax: quote.tax,
    total: quote.total,
    gstRate: quote.gstRate,
    currency: quote.currency,
    moduleIds: quote.planModuleIds,
    addonModuleIds: quote.addonModuleIds,
    periodStart: quote.periodStart,
    periodEnd: quote.newExpiry,
    customer: db.customer,
  };

  if (mode === 'upgrade') {
    subscription.planId = quote.planId;
    subscription.planName = quote.planName;
    subscription.startedAt = date;
  }

  if (mode !== 'addons') {
    subscription.termMonths = quote.termMonths;
    subscription.expiresAt = quote.newExpiry;
    const keep = new Set(quote.addonModuleIds);
    subscription.addons = subscription.addons.filter((addon) => keep.has(addon.moduleId));
  }

  for (const moduleId of quote.addonModuleIds) {
    const existing = subscription.addons.find((addon) => addon.moduleId === moduleId);
    let expiresAt;
    if (mode === 'addons') {
      expiresAt = existing && daysRemaining(existing.expiresAt, date) > 0
        ? addMonthsIso(existing.expiresAt, quote.termMonths)
        : addMonthsIso(date, quote.termMonths);
    } else {
      expiresAt = quote.newExpiry;
    }
    if (existing) {
      existing.expiresAt = expiresAt;
      existing.termMonths = quote.termMonths;
      existing.lastPurchasedAt = date;
    } else {
      subscription.addons.push({
        moduleId,
        purchasedAt: date,
        lastPurchasedAt: date,
        termMonths: quote.termMonths,
        expiresAt,
      });
    }
  }

  db.invoices.push(invoice);
  return { invoice, quote };
}

/** Shapes the stored subscription into what the UI needs. */
export function presentSubscription(subscription) {
  const plan = planById(subscription.planId) || PLANS[0];
  const addons = subscription.addons
    .map((addon) => {
      const module = moduleById(addon.moduleId);
      if (!module) return null;
      return {
        id: module.id,
        name: module.name,
        price: module.price,
        purchasedAt: addon.purchasedAt,
        termMonths: addon.termMonths,
        expiresAt: addon.expiresAt,
        daysRemaining: daysRemaining(addon.expiresAt),
      };
    })
    .filter(Boolean);

  return {
    id: subscription.id,
    planId: plan.id,
    planName: plan.name,
    planCode: plan.code,
    tagline: plan.tagline,
    status: subscriptionStatus(subscription),
    startedAt: subscription.startedAt,
    termMonths: subscription.termMonths,
    expiresAt: subscription.expiresAt,
    daysRemaining: daysRemaining(subscription.expiresAt),
    autoRenew: Boolean(subscription.autoRenew),
    monthlyTotal: planMonthlyTotal(plan) + addons.reduce((sum, addon) => sum + addon.price, 0),
    includedModules: plan.moduleIds.map((id) => {
      const module = moduleById(id);
      return { id: module.id, name: module.name, price: module.price };
    }),
    addonModules: addons,
  };
}
