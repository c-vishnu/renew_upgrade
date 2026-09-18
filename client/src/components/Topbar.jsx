import { Bell, CirclePlay } from 'lucide-react';
import ProfileMenu from './ProfileMenu.jsx';

export default function Topbar({ customer }) {
  const company = customer?.companyName || 'Wayvida Technologies Pvt Ltd';

  return (
    <header className="topbar">
      <span className="topbar__spacer" />

      <button type="button" className="topbar__icon-btn topbar__icon-btn--play" aria-label="Product tour">
        <CirclePlay size={22} strokeWidth={1.9} />
      </button>

      <button type="button" className="topbar__icon-btn" aria-label="Notifications">
        <Bell size={21} strokeWidth={1.8} />
        <span className="topbar__badge">4</span>
      </button>

      <ProfileMenu name={customer?.contactName || 'Aahana Das'} email={customer?.email} company={company} />
    </header>
  );
}
