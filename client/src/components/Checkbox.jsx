import { useEffect, useRef } from 'react';

export default function Checkbox({ checked, indeterminate, disabled, onChange, label }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = Boolean(indeterminate) && !checked;
  }, [indeterminate, checked]);

  return (
    <span className="checkbox">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="checkbox__box" aria-hidden="true" />
    </span>
  );
}
