/**
 * Tiny JSON-file store.
 *
 * Keeps the demo state (subscription + invoice history) across restarts without
 * pulling in a database. Swap this module for your real HRMS data layer.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GST_RATE, MODULES, PLANS } from './catalog.js';
import { addDaysIso, addMonthsIso, planMonthlyTotal, today } from './pricing.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const CUSTOMER = {
  contactName: 'Aahana Das',
  email: 'aahana.das@wayvida.com',
  phone: '+91 XXXXXX2542',
  companyName: 'Wayvida Technologies Pvt Ltd',
  companyId: 'WAY0012',
  gstin: '32ABCDE1234F1Z5',
  address: 'Flat 4B, Green Valley Apartments, Kowdiar, Kerala 695003, India',
};

/** Demo state: an Essential plan that is inside the renewal window. */
function seed() {
  const start = today();
  const plan = PLANS[0];
  const monthly = planMonthlyTotal(plan);
  const expiresAt = addDaysIso(start, 27);
  const purchasedAt = addMonthsIso(expiresAt, -12);
  const subtotal = monthly * 12;
  const tax = Math.round(subtotal * GST_RATE);

  return {
    counter: 1042,
    customer: CUSTOMER,
    subscription: {
      id: 'sub_1001',
      planId: plan.id,
      planName: plan.name,
      startedAt: purchasedAt,
      termMonths: 12,
      expiresAt,
      autoRenew: false,
      addons: [],
    },
    invoices: [
      {
        id: `inv-${purchasedAt.replaceAll('-', '')}-1042`,
        number: `INV-${purchasedAt.slice(0, 4)}-1042`,
        type: 'purchase',
        typeLabel: 'New subscription',
        date: purchasedAt,
        status: 'Paid',
        paymentMethod: 'upi',
        planId: plan.id,
        planName: plan.name,
        planCode: plan.code,
        termMonths: 12,
        termLabel: '1 year',
        lines: [
          {
            kind: 'plan',
            planId: plan.id,
            label: `${plan.name} plan`,
            detail: plan.moduleIds
              .map((id) => MODULES.find((module) => module.id === id)?.name || id)
              .join(' | '),
            moduleIds: [...plan.moduleIds],
            monthly,
            months: 12,
            amount: subtotal,
          },
        ],
        subtotal,
        credit: 0,
        creditNote: null,
        tax,
        total: subtotal + tax,
        gstRate: GST_RATE,
        currency: 'INR',
        moduleIds: [...plan.moduleIds],
        addonModuleIds: [],
        periodStart: purchasedAt,
        periodEnd: expiresAt,
        customer: CUSTOMER,
      },
    ],
  };
}

function read() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    const db = seed();
    write(db);
    return db;
  }
}

function write(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
  return db;
}

let cache = read();

export const db = () => cache;

export const save = () => write(cache);

export const reset = () => {
  cache = write(seed());
  return cache;
};
