import { CheckCircle2, CreditCard, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import Modal from '../../components/Modal.jsx';
import { api } from '../../api.js';
import { formatDate, inr, paymentLabel, termLabel } from '../../format.js';

const TITLES = {
  renew: (planName) => `Renew the ${planName} plan`,
  upgrade: (planName) => `Upgrade to ${planName}`,
  addons: () => 'Add modules to your plan',
};

/**
 * One dialog for every order: pick how long, review the exact amount, then pay.
 * The quote comes from the server, so what is charged is what is shown.
 */
export default function OrderDialog({ request, catalog, customer, onClose, onPaid }) {
  const [termMonths, setTermMonths] = useState(12);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(catalog.paymentMethods[0]?.id || 'upi');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const requestKey = `${request.mode}|${request.planId}|${[...request.addonModuleIds].sort().join(',')}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .quote({
        mode: request.mode,
        planId: request.planId,
        addonModuleIds: request.addonModuleIds,
        termMonths,
      })
      .then((next) => {
        if (cancelled) return;
        setQuote(next);
        setError('');
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, termMonths]);

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await api.checkout({
        mode: request.mode,
        planId: request.planId,
        addonModuleIds: request.addonModuleIds,
        termMonths,
        paymentMethod,
      });
      setReceipt(result.invoice);
      onPaid?.(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (receipt) window.open(api.invoicePdfUrl(receipt.id), '_blank', 'noopener');
  };

  if (receipt) {
    return (
      <Modal
        title="Payment successful"
        onClose={onClose}
        footer={
          <div className="modal__foot-actions">
            <button type="button" className="btn btn--secondary" onClick={download}>
              <Download size={17} strokeWidth={2} />
              Download invoice
            </button>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              Done
            </button>
          </div>
        }
      >
        <div className="receipt">
          <span className="receipt__icon">
            <CheckCircle2 size={30} strokeWidth={2} />
          </span>
          <p className="receipt__title">{receipt.typeLabel} complete</p>
          <p className="receipt__amount">{inr(receipt.total)}</p>
          <p className="receipt__meta">
            Invoice {receipt.number} {'\u00B7'} {formatDate(receipt.date)}
          </p>
          <p className="receipt__meta">
            {receipt.type === 'addons'
              ? `Your new modules are active till ${formatDate(receipt.periodEnd)}`
              : `${receipt.planName} plan is active till ${formatDate(receipt.periodEnd)}`}
          </p>
        </div>

        <div className="confirm-list mt-20">
          {receipt.lines.map((line) => (
            <div className="confirm-list__row" key={`${line.kind}-${line.moduleId || line.planId}`}>
              <span>{line.label}</span>
              <span className="mono">{inr(line.amount)}</span>
            </div>
          ))}
          <div className="confirm-list__row">
            <span>GST @ {Math.round(receipt.gstRate * 100)}%</span>
            <span className="mono">{inr(receipt.tax)}</span>
          </div>
          <div className="confirm-list__row confirm-list__row--total">
            <span>Total paid</span>
            <span className="mono">{inr(receipt.total)}</span>
          </div>
        </div>
      </Modal>
    );
  }

  const blocked = loading || !quote || quote.errors.length > 0 || Boolean(error);
  const title = (TITLES[request.mode] || TITLES.addons)(quote?.planName || customer.companyName);

  return (
    <Modal
      title={title}
      subtitle={customer.companyName}
      wide
      onClose={busy ? undefined : onClose}
      footer={
        <>
          <span className="muted text-sm">
            {quote && !blocked ? `You will be charged ${inr(quote.total)} including GST` : 'Complete the order to continue'}
          </span>
          <div className="modal__foot-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={pay} disabled={busy || blocked}>
              <CreditCard size={17} strokeWidth={2} />
              {busy ? 'Processing...' : quote ? `Pay ${inr(quote.total)}` : 'Pay'}
            </button>
          </div>
        </>
      }
    >
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="danger" title="This order could not be priced">
            {error}
          </Alert>
        </div>
      )}

      <p className="section-hint">How long do you want to pay for?</p>
      <div className="term-grid">
        {catalog.terms.map((term) => (
          <button
            key={term.months}
            type="button"
            className={`term-option${term.months === termMonths ? ' is-active' : ''}`}
            onClick={() => setTermMonths(term.months)}
          >
            {term.label}
          </button>
        ))}
      </div>

      {quote && (
        <>
          <div className="confirm-list mt-20">
            {quote.lines.map((line) => (
              <div className="confirm-list__row" key={`${line.kind}-${line.moduleId || line.planId}`}>
                <div>
                  <p className="table__strong">{line.label}</p>
                  <p className="muted text-sm">
                    {inr(line.monthly)} / month x {line.months}
                  </p>
                </div>
                <span className="mono">{inr(line.amount)}</span>
              </div>
            ))}
            <div className="confirm-list__row">
              <span>Subtotal</span>
              <span className="mono">{inr(quote.subtotal)}</span>
            </div>
            {quote.credit > 0 && (
              <div className="confirm-list__row" style={{ color: 'var(--green-700)' }}>
                <span>{quote.creditNote || 'Credit for unused balance'}</span>
                <span className="mono">- {inr(quote.credit)}</span>
              </div>
            )}
            <div className="confirm-list__row">
              <span>GST @ {Math.round(quote.gstRate * 100)}%</span>
              <span className="mono">{inr(quote.tax)}</span>
            </div>
            <div className="confirm-list__row confirm-list__row--total">
              <span>Total payable</span>
              <span className="mono">{inr(quote.total)}</span>
            </div>
          </div>

          {quote.notes?.length > 0 && (
            <div className="mt-16">
              {quote.notes.map((note) => (
                <p className="summary__note" key={note}>
                  {note}
                </p>
              ))}
            </div>
          )}

          {quote.errors.length > 0 && (
            <div className="mt-16">
              <Alert tone="warning" title="Almost there">
                {quote.errors.join(' ')}
              </Alert>
            </div>
          )}
        </>
      )}

      <div className="mt-20">
        <p className="section-hint">Payment method</p>
        <div className="pay-methods">
          {catalog.paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              className={`pay-method${paymentMethod === method.id ? ' is-active' : ''}`}
              onClick={() => setPaymentMethod(method.id)}
            >
              <span className="radio" aria-hidden="true" />
              <span>
                <span className="pay-method__label">{method.label}</span>
                <span className="pay-method__hint" style={{ display: 'block' }}>
                  {method.hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="summary__note mt-16">
        {quote
          ? `${termLabel(quote.termMonths)} \u00B7 ${
              quote.mode === 'renew' ? 'renews until' : 'active until'
            } ${formatDate(quote.newExpiry)} \u00B7 paid via ${paymentLabel(paymentMethod)}`
          : 'Pricing this order...'}
      </p>
    </Modal>
  );
}
