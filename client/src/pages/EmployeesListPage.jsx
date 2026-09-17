import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  Eye,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  SquarePen,
  UserRoundPlus,
  MoreVertical,
  Rows3,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import Checkbox from '../components/Checkbox.jsx';
import Toast from '../components/Toast.jsx';

const SORT_ACCESSORS = {
  employeeId: (row) => row.employeeId,
  name: (row) => row.name,
  shift: (row) => row.shift,
  totalExperience: (row) => row.totalExperienceMonths,
  tenure: (row) => row.tenureMonths,
  relevantExperience: (row) => row.relevantExperienceMonths,
  highestQualification: (row) => row.highestQualification,
  relevantQualification: (row) => row.relevantQualification,
  department: (row) => row.department,
  designation: (row) => row.designation,
  status: (row) => row.status,
};

const COLUMNS = [
  { key: 'name', label: 'Employee' },
  { key: 'shift', label: 'Shift Time' },
  { key: 'totalExperience', label: 'Total Experience' },
  { key: 'tenure', label: 'Tenure at Company' },
  { key: 'relevantExperience', label: 'Relevant Experience' },
  { key: 'highestQualification', label: 'Highest Qualification' },
  { key: 'relevantQualification', label: 'Relevant Qualification' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'status', label: 'Status' },
];

const STATUS_TONE = { Active: 'success', Probation: 'info', 'On notice': 'warning', Inactive: 'neutral' };

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const shiftMonth = (key, delta) => {
  const [year, month] = key.split('-').map(Number);
  return monthKey(new Date(year, month - 1 + delta, 1));
};

const monthLabel = (key) => {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

export default function EmployeesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState('');
  const [joinedMonth, setJoinedMonth] = useState(() => monthKey(new Date()));
  const [joinedActive, setJoinedActive] = useState(false);
  // The directory opens in employee-id order, which is how the HRMS lists staff.
  const [sort, setSort] = useState({ key: 'employeeId', dir: 'asc' });
  const [selected, setSelected] = useState([]);
  const [density, setDensity] = useState('comfortable');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .employees()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((requestError) => setError(requestError.message));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!rowMenu && !settingsOpen) return undefined;
    const close = () => {
      setRowMenu(null);
      setSettingsOpen(false);
    };
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [rowMenu, settingsOpen]);

  const thisMonth = monthKey(new Date());
  const joinedLabel = joinedMonth === thisMonth ? 'Joined This Month' : `Joined ${monthLabel(joinedMonth)}`;

  const rows = useMemo(() => {
    const all = data?.employees || [];
    const needle = search.trim().toLowerCase();

    const filtered = all.filter((row) => {
      if (department && row.department !== department) return false;
      if (designation && row.designation !== designation) return false;
      if (status && row.status !== status) return false;
      if (joinedActive && row.joinedAt.slice(0, 7) !== joinedMonth) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        row.employeeId.toLowerCase().includes(needle) ||
        row.email.toLowerCase().includes(needle) ||
        row.phone.includes(needle)
      );
    });

    const accessor = SORT_ACCESSORS[sort.key] || SORT_ACCESSORS.name;
    const direction = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [data, search, department, designation, status, joinedActive, joinedMonth, sort]);

  const filters = data?.filters;
  const activeFilterCount =
    (department ? 1 : 0) + (designation ? 1 : 0) + (status ? 1 : 0) + (joinedActive ? 1 : 0) + (search ? 1 : 0);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row.id));

  const toggleRow = (id) =>
    setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

  const openProfile = (row) => navigate(`/employees/${row.id}`);

  const resetFilters = () => {
    setSearch('');
    setSearchParams({}, { replace: true });
    setDepartment('');
    setDesignation('');
    setStatus('');
    setJoinedActive(false);
    setJoinedMonth(thisMonth);
    setSelected([]);
  };

  const sortBy = (key) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    );

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3800);
  };

  const renderSortHeader = ({ key, label }) => {
    const sorted = sort.key === key || (key === 'name' && sort.key === 'employeeId');
    const Icon = sorted ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ChevronDown;
    return (
      <th key={key}>
        <button
          type="button"
          className={`sort-header${sorted ? ' is-sorted' : ''}`}
          onClick={() => sortBy(key)}
        >
          {label}
          <Icon size={15} strokeWidth={2} />
        </button>
      </th>
    );
  };

  return (
    <>
      <div className="list-head">
        <h1 className="list-head__title">Employees ({data ? rows.length : '...'})</h1>

        <div className="list-toolbar">
          <div className="search">
            <Search size={18} strokeWidth={2} />
            <input
              className="search__input"
              placeholder="Search by name, employee ID, email or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <label className={`filter-chip${department ? ' is-active' : ''}`}>
            <select value={department} onChange={(event) => setDepartment(event.target.value)}>
              <option value="">Department</option>
              {filters?.departments.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown size={16} strokeWidth={2} />
          </label>

          <label className={`filter-chip${designation ? ' is-active' : ''}`}>
            <select value={designation} onChange={(event) => setDesignation(event.target.value)}>
              <option value="">Designation</option>
              {filters?.designations.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown size={16} strokeWidth={2} />
          </label>

          <label className={`filter-chip${status ? ' is-active' : ''}`}>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Status</option>
              {filters?.statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown size={16} strokeWidth={2} />
          </label>

          <div className={`date-chip${joinedActive ? ' is-active' : ''}`}>
            <button
              type="button"
              className="date-chip__label"
              title="Filter employees who joined in this month"
              onClick={() => setJoinedActive((value) => !value)}
            >
              {joinedLabel}
            </button>
            <button
              type="button"
              className="date-chip__nav"
              aria-label="Previous month"
              onClick={() => setJoinedMonth((key) => shiftMonth(key, -1))}
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="date-chip__nav"
              aria-label="Next month"
              onClick={() => setJoinedMonth((key) => shiftMonth(key, 1))}
            >
              <ArrowRight size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="date-chip__nav"
              aria-label="Back to this month"
              onClick={() => {
                setJoinedMonth(thisMonth);
                setJoinedActive(true);
              }}
            >
              <CalendarDays size={16} strokeWidth={2} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => showToast('Employee onboarding lives in the existing HRMS build', 'error')}
          >
            <Plus size={18} strokeWidth={2.2} />
            Employee
          </button>

          <button
            type="button"
            className="icon-btn icon-btn--square"
            aria-label="Reset filters"
            title="Reset filters"
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
          >
            <SlidersHorizontal size={19} strokeWidth={1.9} />
          </button>

          <div className="settings-wrap" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="icon-btn icon-btn--square"
              aria-label="Table settings"
              title="Table settings"
              onClick={() => setSettingsOpen((value) => !value)}
            >
              <Settings2 size={19} strokeWidth={1.9} />
            </button>
            {settingsOpen && (
              <div className="settings-popover">
                <p className="settings-popover__title">Rows</p>
                <button
                  type="button"
                  className={`settings-option${density === 'comfortable' ? ' is-active' : ''}`}
                  onClick={() => setDensity('comfortable')}
                >
                  <Rows3 size={16} strokeWidth={1.9} />
                  Comfortable
                </button>
                <button
                  type="button"
                  className={`settings-option${density === 'compact' ? ' is-active' : ''}`}
                  onClick={() => setDensity('compact')}
                >
                  <Rows3 size={16} strokeWidth={1.9} />
                  Compact
                </button>
                <div className="divider" style={{ margin: '10px 0' }} />
                <button type="button" className="settings-option" onClick={resetFilters}>
                  <SlidersHorizontal size={16} strokeWidth={1.9} />
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="selection-bar">
          <span>{selected.length} selected</span>
          <button type="button" className="btn btn--ghost btn--sm ml-auto" onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
      )}

      <div className="employees-table">
        <table className={`table table--employees is-${density}`}>
          <thead>
            <tr>
              <th className="col-check">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  label="Select all employees"
                  onChange={toggleAll}
                />
              </th>
              {COLUMNS.map(renderSortHeader)}
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                onClick={() => openProfile(row)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProfile(row);
                  }
                }}
              >
                <td className="col-check" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selected.includes(row.id)}
                    label={`Select ${row.name}`}
                    onChange={() => toggleRow(row.id)}
                  />
                </td>
                <td>
                  <div className="employee-cell">
                    <span className="avatar" style={{ background: row.avatarColor }}>
                      {row.initials}
                    </span>
                    <span className="employee-cell__name">{row.name}</span>
                  </div>
                </td>
                <td>{row.shift}</td>
                <td>{row.totalExperience}</td>
                <td>{row.tenure}</td>
                <td>{row.relevantExperience}</td>
                <td>{row.highestQualification}</td>
                <td>{row.relevantQualification}</td>
                <td>{row.department}</td>
                <td>{row.designation}</td>
                <td>
                  <span className={`pill pill--${STATUS_TONE[row.status] || 'neutral'}`}>{row.status}</span>
                </td>
                <td className="col-actions" onClick={(event) => event.stopPropagation()}>
                  <span className="row-menu-wrap">
                    <button
                      type="button"
                      className="row-menu-btn"
                      aria-label={`Actions for ${row.name}`}
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setRowMenu((current) =>
                          current?.id === row.id
                            ? null
                            : { id: row.id, top: rect.bottom + 6, left: Math.max(12, rect.right - 190) },
                        );
                      }}
                    >
                      <MoreVertical size={18} strokeWidth={2} />
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length > 0 && (
          <div className="pager">
            <span>
              Showing {rows.length} of {data?.total ?? 0} employees
            </span>
            <span>Click any row to open the employee profile</span>
          </div>
        )}

        {!rows.length && (
          <div className="empty">
            <span className="empty__icon">
              <Search size={20} strokeWidth={1.9} />
            </span>
            <p className="table__strong">No employees match these filters</p>
            <p className="mt-6">
              Try a different search term{joinedActive ? `, or clear the ${joinedLabel.toLowerCase()} filter` : ''}.
            </p>
            <button type="button" className="btn btn--secondary mt-16" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}

        {error && (
          <div className="empty">
            <p className="table__strong">Could not load employees</p>
            <p className="mt-6">{error} Make sure the API is running on port 4004.</p>
          </div>
        )}
      </div>

      {rowMenu && (
        <div
          className="row-menu row-menu--floating"
          style={{ top: rowMenu.top, left: rowMenu.left }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="row-menu__item"
            onClick={() => {
              setRowMenu(null);
              navigate(`/employees/${rowMenu.id}`);
            }}
          >
            <Eye size={16} strokeWidth={1.9} />
            View profile
          </button>
          <button
            type="button"
            className="row-menu__item"
            onClick={() => {
              setRowMenu(null);
              showToast('Editing employee records belongs to the existing HRMS', 'error');
            }}
          >
            <SquarePen size={16} strokeWidth={1.9} />
            Edit details
          </button>
          <button
            type="button"
            className="row-menu__item"
            onClick={() => {
              setRowMenu(null);
              showToast('The exit workflow belongs to the existing HRMS', 'error');
            }}
          >
            <UserRoundPlus size={16} strokeWidth={1.9} />
            Mark exit
          </button>
        </div>
      )}

      <Toast message={toast?.message} tone={toast?.tone} />
    </>
  );
}
