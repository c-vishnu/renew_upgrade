const BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      /* keep the default message */
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  session: () => request('/session'),
  quote: (payload) => request('/quote', { method: 'POST', body: JSON.stringify(payload) }),
  checkout: (payload) => request('/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  invoices: () => request('/invoices'),
  employees: () => request('/employees'),
  employee: (id) => request(`/employees/${encodeURIComponent(id)}`),
  reset: () => request('/dev/reset', { method: 'POST' }),
  invoicePdfUrl: (id) => `${BASE}/invoices/${encodeURIComponent(id)}/pdf`,
};
