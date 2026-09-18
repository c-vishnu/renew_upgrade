import { Download, FileText, Plus, RefreshCw } from 'lucide-react';
import Pill from '../../components/Pill.jsx';
import { formatDate, inr, paymentLabel, renewalPhrase, statusLabel, statusTone, termLabel } from '../../format.js';

/**
 * What the customer owns right now.
 *
 * Left: the plan itself - name, price, what it includes, and the two things a
 * customer does from here (renew, add a module).
 * Right: one panel with everything about time and money, so the plan name, the
 * price and the billing cycle are each written exactly once on the card.
 */
export default function CurrentSubscriptionCard({ subscription, invoices, onRenew, onAddModules, onDownload }) {
  const latestInvoice = invoices?.[0];
  const expiring = subscription.status !== 'active';

  return (
    <section className="card">
      <div className="card__head">
        <span className="card__title">Current subscription</span>
        <div className="card__head-actions">
          <Pill tone={statusTone(subscription.status)} dot>
            {statusLabel(subscription.status)}
          </Pill>
        </div>
      </div>

      <div className="card__body">
        <div className="sub-hero">
          <div className="sub-hero__main">
            <h2 className="sub-hero__name">{subscription.planName}</h2>

            <p className="sub-hero__price">
              <span className="sub-hero__amount">{inr(subscription.monthlyTotal)}</span>
              <span className="sub-hero__per">/ month</span>
              <span className="sub-hero__cycle">billed {termLabel(subscription.termMonths)}</span>
            </p>

            <div className="sub-hero__group">
              <p className="sub-hero__label">Included modules</p>
              <div className="chip-row">
                {subscription.includedModules.map((module) => (
                  <span className="chip" key={module.id}>
                    {module.name}
                  </span>
                ))}
              </div>
            </div>

            {subscription.addonModules.length > 0 && (
              <div className="sub-hero__group">
                <p className="sub-hero__label">Add-on modules</p>
                <div className="chip-row">
                  {subscription.addonModules.map((module) => (
                    <span className="chip chip--muted" key={module.id}>
                      {module.name}
                      <span className="muted">
                        {module.daysRemaining < 0 ? 'expired' : `till ${formatDate(module.expiresAt)}`}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="btn-row mt-20">
              <button type="button" className="btn btn--primary" onClick={onRenew}>
                <RefreshCw size={17} strokeWidth={2} />
                Renew plan
              </button>
              <button type="button" className="btn btn--secondary" onClick={onAddModules}>
                <Plus size={17} strokeWidth={2} />
                Add modules
              </button>
            </div>
          </div>

          <aside className="renew-panel">
            <p className="renew-panel__label">Next renewal</p>
            <p className="renew-panel__date">{formatDate(subscription.expiresAt)}</p>
            <p className={`renew-panel__when${expiring ? ' is-warning' : ''}`}>
              {renewalPhrase(subscription.daysRemaining)}
            </p>

            {latestInvoice && (
              <>
                <div className="renew-panel__divider" />
                <p className="renew-panel__label">Last payment</p>
                <p className="renew-panel__paid">
                  {inr(latestInvoice.total)}
                  <span className="renew-panel__method"> via {paymentLabel(latestInvoice.paymentMethod)}</span>
                </p>
                <p className="renew-panel__meta">Paid on {formatDate(latestInvoice.date)}</p>

                <button
                  type="button"
                  className="renew-panel__file"
                  onClick={() => onDownload(latestInvoice)}
                  title={`Download invoice ${latestInvoice.number}`}
                >
                  <FileText size={15} strokeWidth={1.8} />
                  <span className="mono">{latestInvoice.number}</span>
                  <span className="renew-panel__file-cta">
                    <Download size={14} strokeWidth={2} />
                    PDF
                  </span>
                </button>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
