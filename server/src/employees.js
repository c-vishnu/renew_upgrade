/**
 * Employee directory data for the Employees list and the employee profile.
 *
 * The dataset is generated from a fixed seed so every restart returns the same
 * people, ids and dates. Swap this module for your real employment master.
 */

import { addDaysIso, addMonthsIso, today, toUTC } from './pricing.js';

const DAY = 86400000;

export const AVATAR_COLORS = ['#2563eb', '#0e9384', '#f97316', '#f04438', '#12b76a', '#7c3aed', '#0ba5ec'];

const SHIFTS = ['9:00 AM - 6:00 PM', '10:00 AM - 7:00 PM', '11:00 AM - 8:00 PM', '8:00 AM - 5:00 PM'];

const DEPARTMENTS = {
  'Human Resources': ['HR Executive', 'HR Manager', 'Talent Acquisition Specialist', 'HR Business Partner'],
  Design: ['UI/UX Designer', 'Product Designer', 'Visual Designer', 'Design Lead'],
  Sales: ['Sales Executive', 'Key Account Manager', 'Inside Sales Lead', 'Sales Manager'],
  Marketing: ['Marketing Executive', 'Content Strategist', 'Performance Marketer', 'Brand Manager'],
  Finance: ['Finance Executive', 'Accounts Manager', 'Payroll Analyst', 'Financial Controller'],
  Operations: ['Operations Executive', 'Operations Manager', 'Process Analyst', 'Operations Lead'],
  Support: ['Support Engineer', 'Customer Success Executive', 'Helpdesk Analyst', 'Support Lead'],
  Development: ['Software Engineer', 'Senior Software Engineer', 'QA Engineer', 'Engineering Manager'],
  Administration: ['Admin Executive', 'Front Office Executive', 'Facilities Manager', 'Admin Lead'],
};

const EMPLOYMENT_TYPES = ['Full Time', 'Full Time', 'Full Time', 'Contract', 'Intern'];
const HIGHEST_QUALIFICATIONS = ['MBA', 'B.Com', 'M.Com', 'PGDM', 'B.Des', 'BBA', 'B.Tech', 'MCA', 'B.Sc', 'M.Sc'];
const RELEVANT_QUALIFICATIONS = ['MBA (HR)', 'B.Des (UI/UX)', 'B.Com', 'MBA (Marketing)', 'M.Com (Finance)', 'MBA',
  'B.Des', 'B.Com (Accounting)', 'BBA (Sales)', 'B.Tech (CSE)', 'MCA', 'B.Sc (Statistics)'];
const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB+'];
const MARITAL_STATUS = ['Single', 'Single', 'Married'];
const MANAGERS = ['Rahul Sharma', 'Shiv Nadar', 'Meera Krishnan', 'Anil Kumar', 'Deepa Menon', 'Vikram Rathore', 'Sneha Kapoor'];
const EMERGENCY_RELATIONS = ['Father', 'Mother', 'Spouse', 'Sibling'];
const LOCATIONS = [
  { address: 'Flat 4B, Green Valley Apartments, Kowdiar', country: 'India', state: 'Kerala', postalCode: '695003' },
  { address: '12/3 Rose Villa, Panampilly Nagar', country: 'India', state: 'Kerala', postalCode: '682036' },
  { address: 'Tower 2, Prestige Shantiniketan, Whitefield', country: 'India', state: 'Karnataka', postalCode: '560066' },
  { address: 'B-704, Lodha Amara, Kolshet Road', country: 'India', state: 'Maharashtra', postalCode: '400607' },
  { address: '3rd Cross, Anna Nagar West Extension', country: 'India', state: 'Tamil Nadu', postalCode: '600101' },
  { address: '22, Sector 45, Golf Course Road', country: 'India', state: 'Haryana', postalCode: '122003' },
];

const FIRST_NAMES = ['Aarav', 'Aanya', 'Aarohi', 'Aditi', 'Ananya', 'Arjun', 'Bhavya', 'Chirag', 'Devika', 'Dhruv',
  'Esha', 'Gaurav', 'Harini', 'Ishaan', 'Jhanvi', 'Kabir', 'Kavya', 'Lakshmi', 'Manav', 'Meera', 'Naveen', 'Nithya',
  'Omkar', 'Pooja', 'Riya', 'Rohan', 'Saanvi', 'Sanjay', 'Shreya', 'Siddharth', 'Sneha', 'Tanvi', 'Tarun', 'Uma',
  'Varun', 'Vidya', 'Yash', 'Zara', 'Neha', 'Kiran', 'Priya', 'Aniket', 'Rakesh', 'Nikhil', 'Divya'];

const LAST_NAMES = ['Das', 'Sinha', 'Acharya', 'Mehta', 'Nair', 'Menon', 'Khurana', 'Rao', 'Sharma', 'Iyer', 'Gupta',
  'Reddy', 'Patel', 'Joshi', 'Verma', 'Kulkarni', 'Bose', 'Chopra', 'Desai', 'Fernandes', 'Kapoor', 'Malhotra', 'Pillai'];

/** First rows reproduce the existing Employees screen, so the list looks identical. */
const FEATURED = [
  { name: 'Aahana Das', shift: '9:00 AM - 6:00 PM', totalMonths: 74, tenureMonths: 14, relevantMonths: 60,
    highest: 'MBA', relevant: 'BBA (HR)', department: 'Human Resources', designation: 'HR Executive', color: '#2563eb' },
  { name: 'Aadhya Sinha', shift: '10:00 AM - 7:00 PM', totalMonths: 68, tenureMonths: 20, relevantMonths: 48,
    highest: 'MBA', relevant: 'B.Des (UI/UX)', department: 'Design', designation: 'UI/UX Designer', color: '#0e9384' },
  { name: 'Aanya Acharya', shift: '9:00 AM - 6:00 PM', totalMonths: 98, tenureMonths: 26, relevantMonths: 72,
    highest: 'B.Com', relevant: 'B.Com', department: 'Sales', designation: 'Sales Executive', color: '#f97316' },
  { name: 'Aarav Mehta', shift: '10:00 AM - 7:00 PM', totalMonths: 65, tenureMonths: 29, relevantMonths: 36,
    highest: 'MBA', relevant: 'MBA (Marketing)', department: 'Marketing', designation: 'Performance Marketer', color: '#f04438' },
  { name: 'Aarohi Nair', shift: '9:00 AM - 6:00 PM', totalMonths: 117, tenureMonths: 33, relevantMonths: 84,
    highest: 'MBA', relevant: 'MBA (HR)', department: 'Human Resources', designation: 'HR Manager', color: '#f97316' },
  { name: 'Aditi Menon', shift: '9:00 AM - 6:00 PM', totalMonths: 86, tenureMonths: 38, relevantMonths: 48,
    highest: 'M.Com', relevant: 'M.Com (Finance)', department: 'Finance', designation: 'Finance Executive', color: '#12b76a' },
  { name: 'Aarav Khurana', shift: '10:00 AM - 7:00 PM', totalMonths: 103, tenureMonths: 43, relevantMonths: 60,
    highest: 'MBA', relevant: 'MBA', department: 'Operations', designation: 'Operations Manager', color: '#f97316' },
  { name: 'Ananya Rao', shift: '9:00 AM - 6:00 PM', totalMonths: 83, tenureMonths: 47, relevantMonths: 36,
    highest: 'PGDM', relevant: 'B.Des', department: 'Support', designation: 'Support Lead', color: '#2563eb' },
  { name: 'Aarav Sharma', shift: '9:00 AM - 6:00 PM', totalMonths: 123, tenureMonths: 51, relevantMonths: 72,
    highest: 'B.Com', relevant: 'B.Com (Accounting)', department: 'Development', designation: 'QA Engineer', color: '#2563eb' },
];

const TOTAL_EMPLOYEES = 161;

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (random, list) => list[Math.floor(random() * list.length) % list.length];
const between = (random, min, max) => min + Math.floor(random() * (max - min + 1));

const departmentNames = Object.keys(DEPARTMENTS);

/** "6 yrs 2 mos" / "11 mos" / "18 days" - the format used in the Employees table. */
export function formatDuration(months, days = 0) {
  if (months <= 0 && days < 31) return `${Math.max(days, 0)} day${days === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} yr${years === 1 ? '' : 's'}`);
  if (rest > 0) parts.push(`${rest} mo${rest === 1 ? '' : 's'}`);
  return parts.join(' ') || '0 mos';
}

/** "4Y 7M 2D" - the format used on the employee profile. */
export function yearsOfService(joinedAt, date = today()) {
  const start = new Date(toUTC(joinedAt));
  const end = new Date(toUTC(date));
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years}Y ${months}M ${days}D`;
}

export const initial = (name) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

export const maskPhone = (phone) => `+91 XXXXXX${phone.slice(-4)}`;
export const maskEmail = (email) => {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 3)}***@${domain}`;
};

function build() {
  const date = today();
  const dayOfMonth = Number(date.slice(8, 10));
  const used = new Set();
  const list = [];

  FEATURED.forEach((person, index) => {
    used.add(person.name);
    list.push(makeEmployee({
      index,
      date,
      name: person.name,
      shift: person.shift,
      totalMonths: person.totalMonths,
      tenureMonths: person.tenureMonths,
      relevantMonths: person.relevantMonths,
      highest: person.highest,
      relevant: person.relevant,
      department: person.department,
      designation: person.designation,
      color: person.color,
      random: mulberry32(9000 + index),
      status: 'Active',
    }));
  });

  for (let index = list.length; index < TOTAL_EMPLOYEES; index += 1) {
    const random = mulberry32(1200 + index * 37);
    let name = '';
    do {
      name = `${pick(random, FIRST_NAMES)} ${pick(random, LAST_NAMES)}`;
    } while (used.has(name));
    used.add(name);

    // Every so often somebody joined in the current month, so the
    // "Joined This Month" filter has something to show.
    const fresh = index % 19 === 0;
    const tenureDays = fresh ? 1 + (index % Math.max(dayOfMonth - 1, 1)) : 0;
    const tenureMonths = fresh ? 0 : between(random, 1, 96);
    const totalMonths = fresh ? between(random, 0, 9) : tenureMonths + between(random, 6, 84);
    const department = pick(random, departmentNames);
    const designations = DEPARTMENTS[department];

    list.push(makeEmployee({
      index,
      date,
      name,
      shift: pick(random, SHIFTS),
      totalMonths,
      tenureMonths,
      tenureDays,
      relevantMonths: Math.max(0, totalMonths - between(random, 0, 24)),
      highest: pick(random, HIGHEST_QUALIFICATIONS),
      relevant: pick(random, RELEVANT_QUALIFICATIONS),
      department,
      designation: pick(random, designations),
      color: AVATAR_COLORS[index % AVATAR_COLORS.length],
      random,
      status: fresh ? pick(random, ['Probation', 'Active']) : pick(random, ['Active', 'Active', 'Active', 'On notice', 'Inactive']),
    }));
  }

  return list;
}

function makeEmployee(options) {
  const {
    index, date, name, shift, totalMonths, tenureMonths, tenureDays = 0, relevantMonths, highest, relevant,
    department, designation, color, random, status,
  } = options;

  const joinedAt = tenureMonths > 0
    ? addDaysIso(addMonthsIso(date, -tenureMonths), -between(random, 0, 25))
    : addDaysIso(date, -tenureDays);

  const employeeId = `WAY${String(index + 1).padStart(4, '0')}`;
  const [first, last] = name.toLowerCase().split(' ');
  const email = `${first}.${last}@wayvida.com`;
  const phone = `98${String(1000000 + Math.floor(random() * 8999999)).slice(0, 8)}`;
  const age = between(random, 23, 48);
  const location = pick(random, LOCATIONS);
  const emergency = pick(random, MANAGERS);
  const primaryManager = pick(random, MANAGERS);
  const secondaryManager = pick(random, MANAGERS.filter((name) => name !== primaryManager));

  return {
    id: employeeId,
    employeeId,
    name,
    initials: initial(name),
    avatarColor: color,
    department,
    designation,
    shift,
    status,
    email,
    phone,
    whatsapp: phone,
    joinedAt,
    tenureMonths,
    totalExperienceMonths: totalMonths,
    relevantExperienceMonths: relevantMonths,
    highestQualification: highest,
    relevantQualification: relevant,
    employmentType: pick(random, EMPLOYMENT_TYPES),
    employmentStatus: status === 'Probation' ? 'Probation' : status === 'On notice' ? 'Notice Period' : 'Confirmed',
    role: designation,
    gender: pick(random, ['Female', 'Male']),
    ageYears: age,
    maritalStatus: pick(random, MARITAL_STATUS),
    bloodGroup: pick(random, BLOOD_GROUPS),
    primaryManager,
    secondaryManager,
    ...location,
    emergencyContact: emergency,
    emergencyRelationship: pick(random, EMERGENCY_RELATIONS),
    emergencyNumber: `95${String(1000000 + Math.floor(random() * 8999999)).slice(0, 8)}`,
    lastWorkingDay: null,
  };
}

export const EMPLOYEES = build();

export function employeeFilters() {
  return {
    departments: [...new Set(EMPLOYEES.map((employee) => employee.department))].sort(),
    designations: [...new Set(EMPLOYEES.map((employee) => employee.designation))].sort(),
    statuses: [...new Set(EMPLOYEES.map((employee) => employee.status))].sort(),
    shifts: SHIFTS,
  };
}

export function employeeRow(employee) {
  return {
    id: employee.id,
    employeeId: employee.employeeId,
    name: employee.name,
    initials: employee.initials,
    avatarColor: employee.avatarColor,
    department: employee.department,
    designation: employee.designation,
    status: employee.status,
    joinedAt: employee.joinedAt,
    email: employee.email,
    phone: employee.phone,
    shift: employee.shift,
    totalExperience: formatDuration(employee.totalExperienceMonths),
    totalExperienceMonths: employee.totalExperienceMonths,
    tenure: formatDuration(employee.tenureMonths, daysSince(employee.joinedAt)),
    tenureMonths: employee.tenureMonths,
    relevantExperience: formatDuration(employee.relevantExperienceMonths),
    relevantExperienceMonths: employee.relevantExperienceMonths,
    highestQualification: employee.highestQualification,
    relevantQualification: employee.relevantQualification,
  };
}

function daysSince(iso) {
  return Math.round((toUTC(today()) - toUTC(iso)) / DAY);
}

export function employeeDetail(employee) {
  return {
    ...employee,
    ...employeeRow(employee),
    yearsOfService: yearsOfService(employee.joinedAt),
    maskedPhone: maskPhone(employee.phone),
    maskedWhatsapp: maskPhone(employee.whatsapp),
    maskedEmail: maskEmail(employee.email),
    age: `${employee.ageYears}Y ${employee.ageYears % 12}M`,
    workExperience: workExperience(employee),
  };
}

function workExperience(employee) {
  const ctc = (lakhs) => `\u20B9${(lakhs * 100000).toLocaleString('en-IN')}`;
  const current = {
    title: employee.designation,
    from: employee.joinedAt,
    to: 'Present',
    duration: formatDuration(employee.tenureMonths, daysSince(employee.joinedAt)),
    company: 'Wayvida Technologies',
    exitReason: '--',
    ctc: ctc(6 + (employee.totalExperienceMonths % 9)),
  };

  const previousMonths = Math.max(0, employee.totalExperienceMonths - employee.tenureMonths);
  if (previousMonths <= 0) return [current];

  const start = addMonthsIso(employee.joinedAt, -previousMonths);
  return [
    current,
    {
      title: previousTitles(employee.designation),
      from: start,
      to: addDaysIso(employee.joinedAt, -1),
      duration: formatDuration(previousMonths),
      company: 'Nexa Soft Labs',
      exitReason: 'Better opportunity',
      ctc: ctc(4 + (previousMonths % 5)),
    },
  ];
}

const SENIOR_PREFIX = { 'HR Manager': 'HR Executive', 'Sales Manager': 'Sales Executive', 'Operations Manager': 'Operations Executive',
  'Brand Manager': 'Marketing Executive', 'Accounts Manager': 'Accounts Executive', 'Design Lead': 'UI/UX Designer',
  'Support Lead': 'Support Engineer', 'Engineering Manager': 'Software Engineer', 'Admin Lead': 'Admin Executive',
  'Financial Controller': 'Finance Executive', 'HR Business Partner': 'HR Executive', 'Talent Acquisition Specialist': 'HR Associate',
  'Product Designer': 'Visual Designer', 'Senior Software Engineer': 'Software Engineer', 'Key Account Manager': 'Sales Executive',
  'Inside Sales Lead': 'Sales Executive', 'Content Strategist': 'Marketing Associate', 'Performance Marketer': 'Marketing Associate',
  'Payroll Analyst': 'Accounts Executive', 'Process Analyst': 'Operations Executive', 'Customer Success Executive': 'Support Associate',
  'Helpdesk Analyst': 'Support Associate', 'QA Engineer': 'QA Trainee', 'Front Office Executive': 'Admin Associate',
  'Facilities Manager': 'Admin Executive', 'Visual Designer': 'Design Intern', 'Product Manager': 'Business Analyst' };

const previousTitles = (designation) =>
  SENIOR_PREFIX[designation] || `${designation.split(' ')[0]} Associate`;
