/**
 * Wayvida HRMS - subscription and billing API.
 *
 *   GET  /api/session             customer + current subscription + catalog + invoices
 *   POST /api/quote               price a renew / upgrade / add-modules order
 *   POST /api/checkout            pay for a quoted order (creates the tax invoice)
 *   GET  /api/invoices            invoice history
 *   GET  /api/invoices/:id/pdf    downloadable PDF invoice
 *   POST /api/dev/reset           reset the demo data
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { CURRENCY, GST_RATE, MODULES, PAYMENT_METHODS, PLANS, RENEWAL_WINDOW_DAYS, TERMS } from './catalog.js';
import { EMPLOYEES, employeeDetail, employeeFilters, employeeRow } from './employees.js';
import { renderInvoicePdf } from './invoice.js';
import { applyCheckout, buildQuote, planMonthlyTotal, presentSubscription, toUTC } from './pricing.js';
import { db, reset, save } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '../../client/dist');

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const catalog = () => ({
  currency: CURRENCY,
  gstRate: GST_RATE,
  renewalWindowDays: RENEWAL_WINDOW_DAYS,
  plans: PLANS.map((plan) => ({ ...plan, monthlyTotal: planMonthlyTotal(plan) })),
  modules: [...MODULES].sort((a, b) => a.order - b.order),
  terms: TERMS,
  paymentMethods: PAYMENT_METHODS,
});

const invoicesNewestFirst = (data) =>
  [...data.invoices].sort((a, b) => toUTC(b.date) - toUTC(a.date) || b.number.localeCompare(a.number));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/session', (_req, res) => {
  const data = db();
  res.json({
    customer: data.customer,
    subscription: presentSubscription(data.subscription),
    catalog: catalog(),
    invoices: invoicesNewestFirst(data),
  });
});

app.post('/api/quote', (req, res) => {
  const data = db();
  const { mode, planId, addonModuleIds, termMonths } = req.body || {};
  const quote = buildQuote({
    mode,
    planId,
    addonModuleIds,
    termMonths,
    subscription: data.subscription,
  });
  res.json(quote);
});

app.post('/api/checkout', (req, res) => {
  const data = db();
  try {
    const { mode, planId, addonModuleIds, termMonths, paymentMethod } = req.body || {};
    const { invoice, quote } = applyCheckout(data, {
      mode,
      planId,
      addonModuleIds,
      termMonths,
      paymentMethod,
    });
    save();
    res.status(201).json({
      invoice,
      quote,
      subscription: presentSubscription(data.subscription),
      invoices: invoicesNewestFirst(data),
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message, details: error.details || [] });
  }
});

app.get('/api/invoices', (_req, res) => {
  res.json({ invoices: invoicesNewestFirst(db()) });
});

app.get('/api/employees', (_req, res) => {
  res.json({
    total: EMPLOYEES.length,
    filters: employeeFilters(),
    employees: EMPLOYEES.map(employeeRow),
  });
});

app.get('/api/employees/:id', (req, res) => {
  const needle = req.params.id.toLowerCase();
  const employee = EMPLOYEES.find(
    (item) => item.id.toLowerCase() === needle || item.name.toLowerCase() === needle,
  );
  if (!employee) {
    res.status(404).json({ message: 'Employee not found.' });
    return;
  }
  res.json({ employee: employeeDetail(employee) });
});

app.get('/api/invoices/:id/pdf', (req, res) => {
  const invoice = db().invoices.find((item) => item.id === req.params.id || item.number === req.params.id);
  if (!invoice) {
    res.status(404).json({ message: 'Invoice not found.' });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.number}.pdf"`);
  renderInvoicePdf(invoice, res);
});

app.post('/api/dev/reset', (_req, res) => {
  reset();
  res.json({ ok: true });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
  });
}

app.listen(PORT, () => {
  console.log(`Wayvida subscription API listening on http://localhost:${PORT}`);
});
