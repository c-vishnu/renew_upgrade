import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import EmployeeProfilePage from './pages/EmployeeProfilePage.jsx';
import EmployeesListPage from './pages/EmployeesListPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeesListPage />} />
        <Route path="/employees/:employeeId" element={<EmployeeProfilePage />} />
        <Route path="/settings/subscription" element={<SubscriptionPage />} />
        <Route path="*" element={<PlaceholderPage />} />
      </Route>
    </Routes>
  );
}
