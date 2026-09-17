import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { api } from '../api.js';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell() {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .session()
      .then((session) => {
        if (!cancelled) setCustomer(session.customer);
      })
      .catch(() => {
        /* the topbar falls back to default labels */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar customer={customer} />
        <main className="content">
          <div className="content__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
