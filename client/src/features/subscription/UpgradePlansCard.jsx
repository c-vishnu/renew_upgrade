import { ArrowUpRight, Check } from 'lucide-react';
import { inr } from '../../format.js';

const lowerFirst = (text = '') => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');

/**
 * The plans above the one the customer owns, rendered as pricing cards.
 * Everything shown (modules, price, GST, employee allowance) comes from the catalog.
 */
export default function UpgradePlansCard({ catalog, subscription, onUpgrade }) {
  const plans = [...catalog.plans].sort((a, b) => a.order - b.order);
  const current = plans.find((plan) => plan.id === subscription.planId) || plans[0];
  const upgrades = plans.filter((plan) => plan.order > current.order);
  const gstPercent = Math.round(catalog.gstRate * 100);

  return (
    <section className="card">
      <div className="card__head">
        <span className="card__title">Upgrade your plan</span>
        <div className="card__head-actions">
          <span className="muted text-sm">
            {upgrades.length
              ? `Move up from ${current.name} whenever you are ready \u2014 the unused balance is credited`
              : `You are on ${current.name}, our highest plan`}
          </span>
        </div>
      </div>

      <div className="card__body">
        {upgrades.length === 0 ? (
          <p className="muted text-sm">
            Every module is already available to you. Add anything extra from the modules section below.
          </p>
        ) : (
          <div className="plan-cards">
            {upgrades.map((plan) => {
              const lower = plans.find((item) => item.order === plan.order - 1);
              const extraModules = plan.moduleIds
                .filter((id) => !lower.moduleIds.includes(id))
                .map((id) => catalog.modules.find((module) => module.id === id))
                .filter(Boolean);
              const gstMonthly = Math.round(plan.price * (1 + catalog.gstRate));
              const gstYearly = Math.round(plan.price * 12 * (1 + catalog.gstRate));

              return (
                <article className="plan-card" key={plan.id}>
                  <h3 className="plan-card__name">{plan.name}</h3>

                  <p className="plan-card__price">
                    <span className="plan-card__amount">{inr(plan.price)}</span>
                    <span className="plan-card__per">/month billed annually</span>
                  </p>

                  <p className="plan-card__gst">
                    Incl. {gstPercent}% GST: {inr(gstMonthly)}/month {'\u00B7'} {inr(gstYearly)}/year
                  </p>

                  {plan.includedEmployees ? (
                    <p className="plan-card__employees">
                      For {plan.includedEmployees} employees ({inr(plan.extraEmployeePrice)} per additional
                      employee)
                    </p>
                  ) : null}

                  <p className="plan-card__desc">{plan.description}</p>

                  <ul className="plan-card__features">
                    <li>
                      <span className="plan-card__tick" aria-hidden="true">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      <span>Everything in {lower.name}</span>
                    </li>
                    {extraModules.map((module) => (
                      <li key={module.id}>
                        <span className="plan-card__tick" aria-hidden="true">
                          <Check size={13} strokeWidth={3} />
                        </span>
                        <span>
                          <strong>{module.name}</strong> {'\u2014'} {lowerFirst(module.summary)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.bestFor && (
                    <p className="plan-card__best">
                      <strong>Best for</strong>
                      {plan.bestFor}
                    </p>
                  )}

                  <button
                    type="button"
                    className="btn btn--primary btn--block plan-card__cta"
                    onClick={() => onUpgrade(plan.id)}
                  >
                    <ArrowUpRight size={17} strokeWidth={2} />
                    Upgrade to {plan.name}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
