# Wayvida HRMS — Project Knowledge

Last verified: 2026-09-19

This is the durable handoff document for developers and AI models working on this repository. Read it before making changes and update it whenever the implementation changes materially.

## Product purpose

This project is a Wayvida HRMS interface focused on:

- employee directory and employee profiles;
- subscription status and invoice history;
- renewing the current plan;
- upgrading to a higher plan;
- purchasing optional modules.

The application is a demo/full-stack prototype. The server persists demo state in a local JSON file rather than a production database.

## Technology and structure

- Frontend: React 18, React Router 6, Vite 6, Lucide icons.
- Backend: Node.js, Express 4, PDFKit.
- Root scripts orchestrate the client and server with `concurrently`.
- Client source: `client/src/`.
- Server source: `server/src/`.
- Commercial catalog: `server/src/catalog.js`.
- Demo data store: `server/src/store.js`; runtime data is written to `server/data/db.json`.
- Pricing calculations and validation: `server/src/pricing.js`.
- Invoice PDF generation: `server/src/invoice.js`.

## Running and verification

```bash
npm run install:all
npm run dev
```

Default development addresses:

- Web: `http://localhost:5173` (Vite chooses the next free port if occupied).
- API: `http://localhost:4004`.
- Health check: `GET /api/health`.
- Reset demo billing data: `POST /api/dev/reset`.

Useful commands:

```bash
npm run dev:api
npm run dev:web
npm run build
npm start
```

After frontend changes, run `npm --prefix client run build`. After catalog changes, call `POST /api/dev/reset` while the API is running so the current demo invoice reflects the new prices.

## Routes and screens

Routes are declared in `client/src/App.jsx` inside the shared `AppShell`.

| Route | Screen |
| --- | --- |
| `/` | Redirects to `/employees` |
| `/employees` | Searchable and filterable employee directory |
| `/employees/:employeeId` | Employee profile |
| `/settings/subscription` | Subscription, upgrades, add-ons, and invoices |
| Any other path | Placeholder screen |

The sidebar exposes the HRMS navigation. Routes without a completed screen intentionally use `PlaceholderPage`.

## Current UI decisions

### Application shell

- The dark sidebar is defined in `client/src/components/Sidebar.jsx` and `client/src/styles/shell.css`.
- The sidebar control in the brand row collapses it to a 72 px icon-only rail and expands it back to the full width.
- Collapsed state is stored in `localStorage` under `sidebar-collapsed`.
- Collapsed navigation links use native title tooltips so their names remain discoverable.
- On viewports below 900 px, the sidebar is hidden by the existing responsive rule.
- The top bar no longer displays the former company badge and “All companies” dropdown.
- The profile menu still receives the customer/company information and provides account navigation.

### Current Subscription card

Implemented in `client/src/features/subscription/CurrentSubscriptionCard.jsx`, styled in `client/src/styles/billing.css`.

- The card is no longer rendered on the subscription page; invoice history now occupies the first card position.
- Each invoice row exposes a download icon beside its invoice number and a primary **Renew** action at the far right.
- Uses a compact horizontal information row to avoid large empty areas.
- Shows the plan name, monthly price, term total, next renewal, latest payment/invoice, and action buttons.
- Included-module chips are intentionally not shown in this card.
- The Essential marketing tagline is intentionally not shown in this card.
- Desktop layout is one row with subtle vertical dividers.
- At narrower widths the sections reflow into two columns, then one column on mobile.
- Primary actions are **Renew plan** and **Add modules**.

### Visual language

- Core tokens live in `client/src/styles/tokens.css`.
- Shared shell, cards, buttons, fields, and navigation styles live in `client/src/styles/shell.css`.
- Subscription-specific styles live in `client/src/styles/billing.css`.
- Employee-specific styles live in `client/src/styles/employees.css`.
- Primary blue: `#2563EB`; sidebar: `#101828`; border: `#E4E7EC`.
- Prefer compact, scannable cards with restrained borders and spacing. Avoid large decorative whitespace.

## Current commercial catalog

`server/src/catalog.js` is the single source of truth. Do not hard-code plan or module prices in React components.

| Plan | Monthly price | Included modules |
| --- | ---: | --- |
| Essential | ₹2,400 | Attendance, Leave, Employee Directory |
| Professional | ₹4,800 | Essential modules, Payroll, Connect, Task Management, Performance, Android app |
| Enterprise | ₹7,200 | Professional modules, Recruitment, Helpdesk, iOS app, LMS |

Purchasable add-ons are priced above ₹1,000/month. LMS has no in-app price or checkout; its **Subscribe** action redirects to `https://www.wayvida.com/plans`.

For the current 12-month Essential demo:

- monthly price: ₹2,400;
- annual pre-tax amount: ₹28,800;
- GST at 18%: ₹5,184;
- total paid: ₹33,984.

Customers enter a whole-number purchase duration in months or years. The UI converts years to months, and the server accepts 1–120 months (up to 10 years).

## Pricing rules

All authoritative calculations belong in `server/src/pricing.js` and are used by both quote and checkout flows.

- Base plan charge = plan monthly price × term months.
- Checkout duration is entered as months or years and repriced immediately; the API validates a 1–120 month range.
- Add-on charge = module monthly price × applicable months.
- GST is 18% of the taxable amount.
- Renewal starts after the existing term so paid days are preserved.
- Upgrade applies credit for the unused current-plan balance.
- Buying an active add-on extends it from its existing expiry.
- The server validates plan direction, terms, modules, and checkout inputs.

The Current Subscription UI derives the displayed term total from `monthlyTotal × termMonths`. Invoice totals include GST and therefore differ from the pre-tax term total.

## API contract

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API availability |
| GET | `/api/session` | Customer, subscription, catalog, and invoices |
| GET | `/api/employees` | Employee list and filters |
| GET | `/api/employees/:id` | Employee detail |
| POST | `/api/quote` | Validate and price an order |
| POST | `/api/checkout` | Complete an order and create an invoice |
| GET | `/api/invoices` | Invoice history |
| GET | `/api/invoices/:id/pdf` | Download invoice PDF |
| POST | `/api/dev/reset` | Rebuild demo data from the current catalog |

The client wrapper is `client/src/api.js`; its base path is `/api`. Vite proxies API calls during development.

## Important implementation constraints

- Keep plan/module catalog data on the server and render it from `/api/session`.
- Do not duplicate billing calculations in the UI beyond presentation-only derived values.
- Preserve responsive behavior when changing cards or navigation.
- Do not commit generated `client/dist` output unless deployment policy explicitly changes.
- Do not store credentials, payment secrets, or customer secrets in the demo JSON store.
- Existing user changes may be uncommitted; inspect `git status` and preserve unrelated work.

## Common change locations

| Change | Primary files |
| --- | --- |
| Sidebar/top bar/shell | `client/src/components/Sidebar.jsx`, `Topbar.jsx`, `AppShell.jsx`, `styles/shell.css` |
| Subscription summary | `client/src/features/subscription/CurrentSubscriptionCard.jsx`, `styles/billing.css` |
| Upgrade cards | `client/src/features/subscription/UpgradePlansCard.jsx` |
| Add-on cards | `client/src/features/subscription/AddModulesCard.jsx` |
| Checkout dialog | `client/src/features/subscription/OrderDialog.jsx` |
| Plans, prices, modules | `server/src/catalog.js` |
| Billing math | `server/src/pricing.js` |
| Seed subscription/invoice | `server/src/store.js` |
| Routes | `client/src/App.jsx` |

## Change log

- 2026-09-21: Made LMS an externally subscribed module with no displayed price, linked its Subscribe action to Wayvida plans, and raised other add-on prices above ₹1,000/month.
- 2026-09-21: Added Connect and LMS to the catalog, expanded Professional and Enterprise module bundles, and aligned plan-card feature content.
- 2026-09-21: Replaced preset checkout terms with a duration input and Months/Years selector; pricing now supports any whole-number term from 1 to 120 months.
- 2026-09-21: Replaced the invoice-row Download text button with a download icon beside the invoice number and added a Renew action at the row end.
- 2026-09-21: Moved invoice history to the top of the subscription page and removed the current-subscription summary from that page.
- 2026-09-19: Added this durable knowledge document and repository instruction requiring future agents to maintain it.
- 2026-09-19: Made the sidebar collapse/expand control functional with persistent icon-only mode.
- 2026-09-18: Removed the company selector from the top bar.
- 2026-09-18: Redesigned Current Subscription as a compact horizontal summary; removed its tagline and included-module chips.
- 2026-09-18: Changed Essential to ₹2,400/month and exposed the ₹28,800 annual pre-tax amount; seeded invoice total is ₹33,984 including GST.
