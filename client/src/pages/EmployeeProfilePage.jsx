import { Clock, GripVertical, Link2, Mail, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { formatDate } from '../format.js';

const TABS = ['Profile', 'Overview', 'Calendar', 'Performance', 'Job Information', 'Documents'];

export default function EmployeeProfilePage() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setEmployee(null);
    setError('');
    api
      .employee(employeeId)
      .then((payload) => {
        if (!cancelled) setEmployee(payload.employee);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  if (error) {
    return (
      <>
        <PageHeader title="Employee" backTo="/employees" />
        <Alert tone="danger" title="Could not load this employee">
          {error}
        </Alert>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <PageHeader title="Loading employee..." backTo="/employees" />
        <div className="stack gap-14">
          <div className="skeleton" style={{ height: 260 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={employee.name}
        backTo="/employees"
        tabs={
          <div className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tabs__item${tab === 'Profile' ? ' is-active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
        actions={
          <>
            <button type="button" className="icon-btn" aria-label="Favourite">
              <Star size={18} strokeWidth={1.8} />
            </button>
            <button type="button" className="icon-btn" aria-label="Email">
              <Mail size={18} strokeWidth={1.8} />
            </button>
            <button type="button" className="icon-btn" aria-label="Copy link">
              <Link2 size={18} strokeWidth={1.8} />
            </button>
            <button type="button" className="icon-btn" aria-label="History">
              <Clock size={18} strokeWidth={1.8} />
            </button>
          </>
        }
      />

      <div className="card">
        <div className="card__head">
          <GripVertical size={16} strokeWidth={1.8} className="muted" />
          <span className="card__title">Essential information</span>
        </div>
        <div className="card__body">
          <div className="row gap-18" style={{ alignItems: 'flex-start' }}>
            <div className="avatar avatar--lg" style={{ background: employee.avatarColor, width: 108, height: 118, borderRadius: 10, flexBasis: 108, fontSize: 30 }}>
              {employee.initials}
            </div>

            <div className="field-grid" style={{ flex: 1 }}>
              <Field label="Name" name="name" value={employee.name} readOnly />
              <Field label="Years of Service" name="tenure" value={employee.yearsOfService} readOnly />
              <Field label="Employment Type" name="employmentType" value={employee.employmentType} readOnly />
              <Field label="Designation" name="designation" value={employee.designation} readOnly />
              <Field label="Department" name="department" value={employee.department} readOnly />
              <Field label="Employment Status" name="status" value={employee.employmentStatus} readOnly />
              <Field label="Primary Reporting Manager" name="primaryManager" value={employee.primaryManager} readOnly />
              <Field label="Secondary / Dotted-line Manager" name="secondaryManager" value={employee.secondaryManager} readOnly />
              <Field label="Employee ID" name="employeeId" value={employee.employeeId} readOnly />
              <Field label="Phone Number" name="phone" value={employee.maskedPhone} readOnly />
              <Field label="WhatsApp Number" name="whatsapp" value={employee.maskedWhatsapp} readOnly />
              <Field label="Email address" name="email" value={employee.maskedEmail} readOnly />
              <Field label="Age" name="age" value={employee.age} readOnly />
              <Field label="Gender" name="gender" value={employee.gender} readOnly />
              <Field label="Role" name="role" value={employee.role} readOnly />
              <Field label="Marital Status" name="maritalStatus" value={employee.maritalStatus} readOnly />
              <Field label="Blood Group" name="bloodGroup" value={employee.bloodGroup} readOnly />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <GripVertical size={16} strokeWidth={1.8} className="muted" />
          <span className="card__title">Contact details</span>
          <div className="card__head-actions">
            <span className="pill pill--success">
              <span className="pill__dot" />
              Same as Permanent Address
            </span>
          </div>
        </div>
        <div className="card__body">
          <div className="field-grid">
            <Field label="Present Address" name="presentAddress" value={employee.address} readOnly />
            <Field label="Country" name="country" value={employee.country} readOnly />
            <Field label="State" name="state" value={employee.state} readOnly />
            <Field label="Postal Code" name="postalCode" value={employee.postalCode} readOnly />
            <Field label="Emergency Contact" name="emergencyContact" value={employee.emergencyContact} readOnly />
            <Field label="Relationship" name="relationship" value={employee.emergencyRelationship} readOnly />
            <Field label="Emergency Contact Number" name="emergencyNumber" value={employee.emergencyNumber} readOnly />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <GripVertical size={16} strokeWidth={1.8} className="muted" />
          <span className="card__title">Work experience</span>
          <div className="card__head-actions">
            <span className="pill pill--neutral">
              Total Experience : {Math.round(employee.totalExperienceMonths / 12)}
            </span>
            <span className="pill pill--neutral">
              Relevant Experience : {Math.round(employee.relevantExperienceMonths / 12)}
            </span>
            <span className="muted text-sm">Joined {formatDate(employee.joinedAt)}</span>
          </div>
        </div>
        <div className="card__body card__body--flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Experience</th>
                  <th>Company name</th>
                  <th>Exit Reason</th>
                  <th>Annual CTC</th>
                </tr>
              </thead>
              <tbody>
                {employee.workExperience.map((item) => (
                  <tr key={`${item.title}-${item.from}`}>
                    <td className="table__strong">{item.title}</td>
                    <td>{formatDate(item.from)}</td>
                    <td>{item.to === 'Present' ? 'Present' : formatDate(item.to)}</td>
                    <td>{item.duration}</td>
                    <td>{item.company}</td>
                    <td className="table__muted">{item.exitReason}</td>
                    <td>{item.ctc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
