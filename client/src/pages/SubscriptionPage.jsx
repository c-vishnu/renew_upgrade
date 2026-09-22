import { HelpCircle, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import Alert from '../components/Alert.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Toast from '../components/Toast.jsx';
import AddModulesCard from '../features/subscription/AddModulesCard.jsx';
import InvoicesCard from '../features/subscription/InvoicesCard.jsx';
import OrderDialog from '../features/subscription/OrderDialog.jsx';
import UpgradePlansCard from '../features/subscription/UpgradePlansCard.jsx';

/**
 * Billing screen: what the customer owns, what they can upgrade to, and the
 * modules they can add. Term selection and payment live in one shared dialog so
 * nothing is repeated on the page.
 */
export default function SubscriptionPage() {
  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const loadSession = useCallback(async () => {
    const next = await api.session();
    setSession(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadSession()
      .then(() => {
        if (!cancelled) setLoadError('');
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [loadSession]);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4200);
  };

  const download = (invoice) => {
    window.open(api.invoicePdfUrl(invoice.id), '_blank', 'noopener');
  };

  const toggleModule = (moduleId) => {
    setSelectedModules((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId],
    );
  };

  const handlePaid = async (result) => {
    await loadSession();
    setSelectedModules([]);
    showToast(`${result.invoice.typeLabel} successful \u2014 ${result.invoice.number}`);
  };

  const resetDemo = async () => {
    await api.reset();
    await loadSession();
    setSelectedModules([]);
    showToast('Demo data reset');
  };

  const headerActions = (
    <>
      <button type="button" className="icon-btn" aria-label="Billing help">
        <HelpCircle size={19} strokeWidth={1.8} />
      </button>
      <button type="button" className="icon-btn" aria-label="Reset demo data" onClick={resetDemo}>
        <RotateCcw size={18} strokeWidth={1.8} />
      </button>
    </>
  );

  if (!session) {
    return (
      <>
        <PageHeader title="Subscription and billing" />
        {loadError ? (
          <Alert tone="danger" title="Could not load your subscription">
            {loadError} Make sure the API is running on http://localhost:4004.
          </Alert>
        ) : (
          <div className="stack gap-14">
            <div className="skeleton" style={{ height: 220 }} />
            <div className="skeleton" style={{ height: 320 }} />
          </div>
        )}
      </>
    );
  }

  const { subscription, catalog, customer, invoices } = session;

  return (
    <>
      <PageHeader title="Subscription and billing" actions={headerActions} />

      <InvoicesCard
        invoices={invoices}
        onDownload={download}
        onRenew={() => setOrder({ mode: 'renew', planId: subscription.planId, addonModuleIds: [] })}
      />

      <UpgradePlansCard
        catalog={catalog}
        subscription={subscription}
        onUpgrade={(planId) => setOrder({ mode: 'upgrade', planId, addonModuleIds: [] })}
      />

      <AddModulesCard
        catalog={catalog}
        subscription={subscription}
        selectedIds={selectedModules}
        onToggle={toggleModule}
        onBuy={() =>
          setOrder({ mode: 'addons', planId: subscription.planId, addonModuleIds: selectedModules })
        }
      />

      {order && (
        <OrderDialog
          request={order}
          catalog={catalog}
          customer={customer}
          onClose={() => setOrder(null)}
          onPaid={handlePaid}
        />
      )}

      <Toast message={toast?.message} tone={toast?.tone} />
    </>
  );
}
