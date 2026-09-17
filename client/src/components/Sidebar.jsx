import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  CreditCard,
  FileText,
  FolderClosed,
  Headphones,
  LayoutGrid,
  ListChecks,
  MessageCircle,
  Network,
  PanelLeftClose,
  Plane,
  ShieldCheck,
  UserSearch,
  Users,
  Wallet,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const WORKSPACE_NAV = [
  { label: 'Dashboard', icon: LayoutGrid, to: '/dashboard' },
  { label: 'Employees', icon: Users, to: '/employees' },
  { label: 'Departments', icon: Network, to: '/departments' },
  { label: 'Designations', icon: Briefcase, to: '/designations' },
  { label: 'Attendance', icon: CalendarCheck, to: '/attendance' },
  { label: 'Leave', icon: Plane, to: '/leave' },
  { label: 'Tasks', icon: ListChecks, to: '/tasks' },
  { label: 'Connect', icon: MessageCircle, to: '/connect' },
  { label: 'Documents', icon: FolderClosed, to: '/documents' },
  { label: 'Payroll', icon: Wallet, to: '/payroll' },
  { label: 'Recruitment', icon: UserSearch, to: '/recruitment' },
  { label: 'Performance', icon: BarChart3, to: '/performance' },
  { label: 'Helpdesk', icon: Headphones, to: '/helpdesk' },
  { label: 'Reports', icon: FileText, to: '/reports' },
  { label: 'Role & Access', icon: ShieldCheck, to: '/role-access' },
];

const BILLING_NAV = [{ label: 'Membership', icon: CreditCard, to: '/settings/subscription' }];

export default function Sidebar() {
  const renderLink = ({ label, icon: Icon, to }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
    >
      <Icon size={20} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">
          <CreditCard size={16} strokeWidth={2.2} />
        </span>
        <span className="sidebar__title">HRMS</span>
        <button type="button" className="sidebar__collapse" aria-label="Collapse sidebar">
          <PanelLeftClose size={18} strokeWidth={1.8} />
        </button>
      </div>

      <nav className="sidebar__scroll">
        <p className="sidebar__heading">Workspace</p>
        {WORKSPACE_NAV.map(renderLink)}
        <p className="sidebar__heading">Billing</p>
        {BILLING_NAV.map(renderLink)}
      </nav>
    </aside>
  );
}
