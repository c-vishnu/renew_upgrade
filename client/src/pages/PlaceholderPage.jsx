import { LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/departments': 'Departments',
  '/designations': 'Designations',
  '/attendance': 'Attendance',
  '/leave': 'Leave',
  '/tasks': 'Tasks',
  '/connect': 'Connect',
  '/documents': 'Documents',
  '/payroll': 'Payroll',
  '/recruitment': 'Recruitment',
  '/performance': 'Performance',
  '/helpdesk': 'Helpdesk',
  '/reports': 'Reports',
  '/role-access': 'Role & Access',
  '/change-password': 'Change Password',
  '/logout': 'Logout',
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Screen';

  return (
    <>
      <PageHeader title={title} backTo="/employees" />
      <div className="card">
        <div className="card__body">
          <div className="empty">
            <span className="empty__icon">
              <LayoutGrid size={22} strokeWidth={1.8} />
            </span>
            <p className="table__strong">{title} belongs to the existing HRMS.</p>
            <p className="mt-6">
              This build only contains the subscription, renewal, upgrade and module purchase screens.
            </p>
            <p className="mt-16">
              <Link className="btn btn--primary" to="/settings/subscription">
                Go to Subscription and billing
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
