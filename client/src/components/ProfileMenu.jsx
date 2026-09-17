import { CreditCard, LogOut, Lock, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ITEMS = [
  { id: 'profile', label: 'Profile', icon: User, to: '/employees/WAY0001' },
  { id: 'subscription', label: 'Membership', icon: CreditCard, to: '/settings/subscription' },
  { id: 'password', label: 'Change Password', icon: Lock, to: '/change-password' },
  { id: 'logout', label: 'Logout', icon: LogOut, to: '/logout' },
];

export default function ProfileMenu({ name = 'Aahana Das', email = 'aahana.das@wayvida.com', company = 'Wayvida Technologies' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSelect = (item) => {
    setOpen(false);
    if (item.to) navigate(item.to);
  };

  return (
    <div className="profile-menu" ref={wrapRef}>
      <button
        type="button"
        className="profile-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
      >
        {name.split(' ').slice(-1)[0]?.[0] || 'W'}
      </button>

      {open && (
        <div className="profile-menu__panel" role="menu">
          <div className="profile-menu__header">
            <p className="profile-menu__name">{name}</p>
            <p className="profile-menu__email">{email}</p>
          </div>
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.to && location.pathname === item.to;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={`profile-menu__item${isActive ? ' is-active' : ''}`}
                onClick={() => handleSelect(item)}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <p className="muted text-sm" style={{ padding: '10px 10px 4px' }}>
            {company}
          </p>
        </div>
      )}
    </div>
  );
}
