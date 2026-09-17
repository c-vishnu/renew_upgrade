import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, backTo, onBack, tabs, actions }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <div className="page-head">
      <button type="button" className="page-head__back" aria-label="Go back" onClick={handleBack}>
        <ArrowLeft size={20} strokeWidth={2} />
      </button>
      <h1 className="page-head__title">{title}</h1>
      {tabs}
      {actions && <div className="page-head__actions">{actions}</div>}
    </div>
  );
}
