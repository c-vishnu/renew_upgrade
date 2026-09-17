# Wayvida HRMS - Subscription, Renewal and Module Purchase

Add-on billing module for the existing Wayvida HRMS. It covers the three things a
customer does after signing up:

1. **Add modules** - buy any module that is not part of the current plan (`Buy now`).
2. **Renew** - extend the plan when it is about to expire, choosing how long to renew for.
3. **Upgrade** - move to a higher plan, with the unused balance credited on the invoice.

The UI reuses the HRMS design language (dark sidebar, boxed floating-label fields,
light blue module cards) so it drops into the existing React app without looking foreign.

## Run it

```bash
npm run install:all   # root + server + client
npm run dev           # api on :4004, web on :5173
```

Open http://localhost:5173, then click the avatar in the top-right corner and choose
**Subscription** (it sits directly below **Profile**), or use the **Subscription** link in
the sidebar under *Billing*.

Other scripts: `npm run dev:api`, `npm run dev:web`, `npm run build`, `npm start`.

The API keeps its state in `server/data/db.json`. The round arrow icon next to the page
title (`Reset demo data`) - or `POST /api/dev/reset` - restores the seeded demo.

## Plans and module prices

Everything commercial lives in `server/src/catalog.js`, and the UI renders whatever that
file says.

| Plan | Modules | Price / month |
| --- | --- | --- |
| Essential | Attendance, Leave, Employee Directory | ₹300 |
| Professional | Essential + Payroll, Task Management | ₹4,800 |
| Enterprise | Professional + Recruitment, Helpdesk, Android app, iOS app | ₹7,200 |

Plans are priced per plan; you only pay a plan price, never the sum of its modules. Each plan
also carries the marketing copy the upgrade cards render (`description`, `bestFor`,
`includedEmployees`, `extraEmployeePrice`).

Module prices are per module, per month: Attendance ₹100, Leave ₹100, Employee Directory
₹100, Payroll ₹600, Task Management ₹480, Recruitment ₹600, Performance ₹480,
Helpdesk ₹360, Android app ₹600, iOS app ₹600.

**Performance** is deliberately not part of any plan (`tier: 'addon'`), which demonstrates
the "buy a module that is not in my plan" path on the cheapest plan.

## How the money is calculated

`server/src/pricing.js` is shared by the checkout review screen (`POST /api/quote`) and the
actual checkout (`POST /api/checkout`), so the amount shown is always the amount charged.

- Plan price x term months, plus one line per add-on module (module price x term months).
- **Renew** bills the plan and every active add-on for the new term. The new term starts
  when the current one ends, so paid-for days are never lost.
- **Upgrade** bills the target plan for the new term and credits the unused balance of the
  current plan (`current monthly value / 30 x days remaining`).
- **Add modules** bills only the newly selected modules. Modules already active keep their
  own expiry, and buying one again extends it from its current expiry.
- GST at 18% is added on the taxable amount. Every checkout writes a tax invoice.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/session` | Customer, current subscription, catalog and invoice history |
| GET | `/api/employees` | Employee directory rows, filter options and the total headcount |
| GET | `/api/employees/:id` | One employee with contact details and work experience |
| POST | `/api/quote` | Price an order: `{ mode, planId, addonModuleIds, termMonths }` |
| POST | `/api/checkout` | Pay for the order and create the invoice |
| GET | `/api/invoices` | Invoice history |
| GET | `/api/invoices/:id/pdf` | Downloadable PDF tax invoice |
| POST | `/api/dev/reset` | Reset the demo data |

`mode` is `addons`, `renew` or `upgrade`. The server validates every order, so an invalid
upgrade (same plan or lower, term outside the catalogue) is rejected rather than charged.

## Screens

- **Subscription and billing** (`client/src/pages/SubscriptionPage.jsx`)
  - *Current subscription* - plan, status, expiry countdown, invoice number, date of
    purchase, amount paid, next renewal date, billing cycle, invoice download, and the
    **Renew plan** and **Add modules** buttons. Renewing the same plan is always one click
    from here.
  - *Upgrade your plan* - only the plans above the one you own, as pricing cards: monthly
    price, GST-inclusive price, employee allowance, what the plan adds over your current one
    and an **Upgrade to ...** button per plan.
  - *Add modules* - only the modules your plan does not include, each with its own price and
    a **Buy now**. Modules already bought stay listed with their expiry so they cannot be
    bought twice.
  - *Order dialog* - one place for every order (`client/src/features/subscription/OrderDialog.jsx`):
    billing term, line-by-line breakdown, GST, proration credit, payment method and the
    receipt. Nothing about pricing is repeated on the page itself.
  - *Invoices* - every past invoice with type, term, amount and a PDF download.
- **Employee directory** (`client/src/pages/EmployeesListPage.jsx`) - the HRMS employee list
  (161 seeded staff): search by name, employee ID, email or phone, Department / Designation /
  Status filters, the *Joined This Month* date chip with previous and next month navigation,
  sortable columns, row selection with a bulk action bar, a per-row actions menu, a density
  switcher and a reset-filters button. Clicking any row opens that employee profile.
- **Employee profile** (`client/src/pages/EmployeeProfilePage.jsx`) - reached by clicking a
  directory row or by choosing **Profile** in the account menu. Renders essential
  information, contact details and work experience for `/employees/:employeeId`.

## Design tokens

`client/src/styles/tokens.css` holds the colours, radii, shadows and typography taken from
the existing HRMS screens (sidebar `#101828`, primary `#2563EB`, borders `#E4E7EC`,
canvas `#F9FAFB`, Inter). `shell.css` covers the layout, sidebar, topbar, profile menu and
shared controls; `billing.css` covers the billing screens only.

## Wiring it into the real HRMS

- Replace `server/src/store.js` with your real data access; the routes and `pricing.js`
  stay as they are.
- Point `client/src/api.js` at your API base instead of the Vite `/api` proxy.
- `SubscriptionPage` is a self-contained route: mount it in your router (used here as
  `/settings/subscription`) and keep the `Subscription` entry in the profile menu.
- Swap the payment step in `OrderDialog.jsx` for your gateway (Razorpay, Stripe, ...);
  call `/api/checkout` only after the gateway confirms the payment.
