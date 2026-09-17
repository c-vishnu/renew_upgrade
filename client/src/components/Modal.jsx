import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ title, subtitle, onClose, footer, children, wide }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal__card${wide ? ' modal__card--wide' : ''}`}>
        <div className="modal__head">
          <div>
            <p className="modal__title">{title}</p>
            {subtitle && <p className="muted text-sm">{subtitle}</p>}
          </div>
          <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}
