export const inr = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN')}`;

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso) {
  if (!iso) return '--';
  const [year, month, day] = String(iso).slice(0, 10).split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${year}`;
}

export function formatDateTime(iso) {
  if (!iso) return '--';
  return `${formatDate(iso)}, 10:24 AM`;
}

export function formatDateTimeLocal(iso) {
  if (!iso) return '--';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--';
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hour12}:${minutes} ${ampm}`;
}

export function termLabel(months) {
  const value = Number(months);
  if (value === 12) return '1 year';
  if (value === 24) return '2 years';
  if (value === 36) return '3 years';
  return `${value} month${value === 1 ? '' : 's'}`;
}

export function renewalPhrase(daysRemaining) {
  if (daysRemaining < 0) return `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago`;
  if (daysRemaining === 0) return 'Expires today';
  return `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
}

export const statusLabel = (status) =>
  ({ active: 'Active', expiring: 'Expiring soon', expired: 'Expired' })[status] || 'Active';

export const statusTone = (status) =>
  ({ active: 'success', expiring: 'warning', expired: 'danger' })[status] || 'success';

export const invoiceTypeLabel = (invoice) =>
  invoice.typeLabel || { purchase: 'New subscription', renew: 'Renewal', upgrade: 'Upgrade', addons: 'Module purchase' }[invoice.type] || 'Payment';

export const paymentLabel = (id) =>
  ({ upi: 'UPI', card: 'Card', netbanking: 'Net banking' })[id] || id || '--';

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';
