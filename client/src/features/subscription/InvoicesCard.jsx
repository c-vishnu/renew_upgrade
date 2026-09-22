import { Download, FileText, RefreshCw } from 'lucide-react';
import Pill from '../../components/Pill.jsx';
import { formatDate, inr, invoiceTypeLabel, paymentLabel, termLabel } from '../../format.js';

export default function InvoicesCard({ invoices, onDownload, onRenew }) {
  return (
    <div className="card">
      <div className="card__head">
        <FileText size={16} strokeWidth={1.8} className="muted" />
        <span className="card__title">Invoices</span>
        <div className="card__head-actions">
          <span className="muted text-sm">{invoices.length} on record</span>
        </div>
      </div>

      <div className="card__body card__body--flush">
        {invoices.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">
              <FileText size={20} strokeWidth={1.8} />
            </span>
            No invoices yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Plan</th>
                  <th>Term</th>
                  <th>Paid via</th>
                  <th className="table__right">Amount</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="table__strong">
                      <span className="invoice-number">
                        {invoice.number}
                        <button
                          type="button"
                          className="invoice-number__download"
                          onClick={() => onDownload(invoice)}
                          aria-label={`Download invoice ${invoice.number}`}
                          title={`Download invoice ${invoice.number}`}
                        >
                          <Download size={16} strokeWidth={2} />
                        </button>
                      </span>
                    </td>
                    <td className="table__muted">{formatDate(invoice.date)}</td>
                    <td>{invoiceTypeLabel(invoice)}</td>
                    <td>{invoice.planName}</td>
                    <td className="table__muted">{termLabel(invoice.termMonths)}</td>
                    <td className="table__muted">{paymentLabel(invoice.paymentMethod)}</td>
                    <td className="table__right table__strong mono">{inr(invoice.total)}</td>
                    <td>
                      <Pill tone="success">{invoice.status}</Pill>
                    </td>
                    <td className="table__right">
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={onRenew}
                      >
                        <RefreshCw size={15} strokeWidth={2} />
                        Renew
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
