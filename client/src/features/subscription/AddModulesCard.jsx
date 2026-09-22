import { Plus } from 'lucide-react';
import Checkbox from '../../components/Checkbox.jsx';
import { formatDate, inr } from '../../format.js';

/**
 * Every module that is not part of the customer plan, priced per module per month.
 * Modules already bought as add-ons stay listed so the customer can see their expiry,
 * but they cannot be selected twice.
 */
export default function AddModulesCard({ catalog, subscription, selectedIds, onToggle, onBuy }) {
  const plans = [...catalog.plans].sort((a, b) => a.order - b.order);
  const current = plans.find((plan) => plan.id === subscription.planId) || plans[0];
  const available = catalog.modules.filter((module) => !current.moduleIds.includes(module.id));
  const activeAddons = new Map(subscription.addonModules.map((module) => [module.id, module]));

  const selected = available.filter((module) => !module.externalUrl && selectedIds.includes(module.id));
  const monthly = selected.reduce((sum, module) => sum + module.price, 0);

  return (
    <section className="card" id="add-modules">
      <div className="card__head">
        <span className="card__title">Add modules</span>
        <div className="card__head-actions">
          <span className="muted text-sm">
            Not included in {current.name} {'\u00B7'} flexible add-ons
          </span>
        </div>
      </div>

      <ul className="module-list">
        {available.map((module) => {
          const activeAddon = activeAddons.get(module.id);
          return (
            <li className={`module-row${activeAddon ? ' is-active' : ''}`} key={module.id}>
              {module.externalUrl ? (
                <span className="module-row__select-spacer" aria-hidden="true" />
              ) : (
                <Checkbox
                  checked={Boolean(activeAddon) || selectedIds.includes(module.id)}
                  disabled={Boolean(activeAddon)}
                  label={module.name}
                  onChange={() => onToggle(module.id)}
                />
              )}
              <div className="module-row__main">
                <p className="module-row__name">
                  {module.name}
                  {activeAddon && (
                    <span className="pill pill--success">
                      Active till {formatDate(activeAddon.expiresAt)}
                    </span>
                  )}
                </p>
                <p className="module-row__desc">{module.summary}</p>
              </div>
              <div className="module-row__aside">
                {module.externalUrl ? (
                  <a className="btn btn--secondary btn--sm" href={module.externalUrl}>
                    Subscribe
                  </a>
                ) : (
                  <p className="module-row__price">
                    {inr(module.price)}
                    <span className="muted"> / month</span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="module-list__foot">
        <p className="text-sm">
          {selected.length > 0 ? (
            <>
              <strong>{selected.length}</strong> module{selected.length === 1 ? '' : 's'} selected {'\u00B7'}{' '}
              <strong>{inr(monthly)}</strong> / month
            </>
          ) : (
            <span className="muted">Select the modules you want to add to {current.name}.</span>
          )}
        </p>
        <button type="button" className="btn btn--primary" disabled={selected.length === 0} onClick={onBuy}>
          <Plus size={17} strokeWidth={2.2} />
          Buy now
        </button>
      </div>
    </section>
  );
}
