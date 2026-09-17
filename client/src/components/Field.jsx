import { User } from 'lucide-react';

/**
 * Boxed field with the label sitting on the border, matching the existing
 * HRMS employee form controls.
 */
export default function Field({ label, value, name, type = 'text', readOnly, hint, onChange }) {
  const id = `field-${name || label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`field${readOnly ? ' field--readonly' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {readOnly ? (
        <div className="field__control" id={id}>
          {value || '--'}
        </div>
      ) : (
        <input
          id={id}
          className="field__control"
          type={type}
          name={name}
          value={value ?? ''}
          placeholder={hint}
          onChange={onChange}
        />
      )}
    </div>
  );
}

export function ReadOnlyFieldWithIcon({ label, value, icon: Icon = User }) {
  return (
    <div className="field field--readonly">
      <span className="field__label">{label}</span>
      <div className="field__control row">
        <Icon size={17} strokeWidth={1.8} className="muted" />
        <span>{value || '--'}</span>
      </div>
    </div>
  );
}
