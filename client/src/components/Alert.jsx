import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const ICONS = { warning: AlertTriangle, danger: XCircle, info: Info, success: CheckCircle2 };

export default function Alert({ tone = 'info', title, children, actions }) {
  const Icon = ICONS[tone] || Info;

  return (
    <div className={`alert alert--${tone}`} role="status">
      <Icon size={19} strokeWidth={1.9} />
      <div>
        {title && <p className="alert__title">{title}</p>}
        {children && <div className="alert__body">{children}</div>}
      </div>
      {actions && <div className="alert__actions">{actions}</div>}
    </div>
  );
}
