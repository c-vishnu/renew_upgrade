/**
 * Single source of truth for the commercial catalog.
 *
 * Everything the UI renders (plans, module prices, available billing terms) comes
 * from here, so a price change never requires touching a React component.
 *
 * Module prices are per module, per month, in INR.
 * `order` keeps the grid identical to the existing "HRMS modules" screen.
 */

export const GST_RATE = 0.18;
export const CURRENCY = 'INR';
export const RENEWAL_WINDOW_DAYS = 30;

export const MODULES = [
  { id: 'attendance', name: 'Attendance', price: 100, tier: 'essential', order: 1,
    summary: 'Biometric, web and mobile punch-in with shift, overtime and regularisation rules.' },
  { id: 'leave', name: 'Leave', price: 100, tier: 'essential', order: 2,
    summary: 'Leave types, balances, approval workflows and holiday calendars.' },
  { id: 'employee-directory', name: 'Employee Directory', price: 100, tier: 'essential', order: 3,
    summary: 'One record per employee with documents, reporting lines and org view.' },
  { id: 'payroll', name: 'Payroll', price: 600, tier: 'professional', order: 4,
    summary: 'Salary structures, statutory deductions, payslips and bank disbursal files.' },
  { id: 'task-management', name: 'Task Management', price: 480, tier: 'professional', order: 5,
    summary: 'Assign, track and close work across teams with due-date alerts.' },
  { id: 'recruitment', name: 'Recruitment', price: 600, tier: 'enterprise', order: 6,
    summary: 'Requisitions, candidate pipeline, interview feedback and offers.' },
  { id: 'performance', name: 'Performance', price: 480, tier: 'addon', order: 7,
    summary: 'Goals, review cycles and 360 degree feedback. Can be added to any plan.' },
  { id: 'helpdesk', name: 'Helpdesk', price: 360, tier: 'enterprise', order: 8,
    summary: 'Employee tickets, SLA tracking and a searchable knowledge base.' },
  { id: 'android-app', name: 'Android app', price: 600, tier: 'enterprise', order: 9,
    summary: 'Attendance, leave and approvals on Android phones and tablets.' },
  { id: 'ios-app', name: 'iOS app', price: 600, tier: 'enterprise', order: 10,
    summary: 'Attendance, leave and approvals on iPhone and iPad.' },
];

export const PLANS = [
  { id: 'essential', code: 'ESS', name: 'Essential', order: 1,
    tagline: 'Attendance, leave and the employee directory for small teams.',
    price: 300,
    description: 'For small teams that want the HR basics running in one place.',
    includedEmployees: 50, extraEmployeePrice: 60,
    bestFor: 'Teams of up to 50 people moving off spreadsheets.',
    moduleIds: ['attendance', 'leave', 'employee-directory'] },
  { id: 'professional', code: 'PRO', name: 'Professional', order: 2,
    tagline: 'Everything in Essential, plus Payroll and Task Management.',
    price: 4800,
    description: 'For managers who want HR plus a Jira-like task layer for daily execution.',
    includedEmployees: 50, extraEmployeePrice: 96,
    bestFor: 'Growing companies that run payroll in-house and track daily work.',
    moduleIds: ['attendance', 'leave', 'employee-directory', 'payroll', 'task-management'] },
  { id: 'enterprise', code: 'ENT', name: 'Enterprise', order: 3,
    tagline: 'Every module, including Recruitment, Helpdesk and the mobile apps.',
    price: 7200,
    description: 'For organizations that want HR operations, execution and mobile access in one subscription.',
    includedEmployees: 50, extraEmployeePrice: 144,
    bestFor: 'Companies hiring at scale, with a support desk and staff on the move.',
    moduleIds: ['attendance', 'leave', 'employee-directory', 'payroll', 'task-management',
      'recruitment', 'helpdesk', 'android-app', 'ios-app'] },
];

export const TERMS = [
  { months: 1, label: '1 month' },
  { months: 3, label: '3 months' },
  { months: 6, label: '6 months' },
  { months: 12, label: '1 year', popular: true },
  { months: 24, label: '2 years' },
  { months: 36, label: '3 years' },
];

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / debit card', hint: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net banking', hint: 'All major Indian banks' },
];

export const MODES = {
  addons: { id: 'addons', label: 'Add modules', cta: 'Buy now', invoiceType: 'Module purchase' },
  renew: { id: 'renew', label: 'Renew', cta: 'Renew now', invoiceType: 'Renewal' },
  upgrade: { id: 'upgrade', label: 'Upgrade', cta: 'Upgrade and pay', invoiceType: 'Upgrade' },
};
