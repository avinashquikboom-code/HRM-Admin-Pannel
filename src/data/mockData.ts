export const mockCompanies = [
  { id: 1, name: 'TechVibe Inc.', employees: 450, plan: 'Enterprise', status: 'Active', joiningDate: '12 Jan 2024', logo: 'TV' },
  { id: 2, name: 'Global Logistics', employees: 1200, plan: 'Pro', status: 'Suspended', joiningDate: '24 Feb 2024', logo: 'GL' },
  { id: 3, name: 'EcoWare Solutions', employees: 85, plan: 'Basic', status: 'Pending', joiningDate: '05 Mar 2024', logo: 'EW' },
  { id: 4, name: 'Innovate Digital', employees: 320, plan: 'Enterprise', status: 'Active', joiningDate: '18 Mar 2024', logo: 'ID' },
  { id: 5, name: 'Blue Sky Media', employees: 150, plan: 'Pro', status: 'Active', joiningDate: '02 Apr 2024', logo: 'BS' },
];

export const mockEmployees = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    email: 'sarah.j@techvibe.com',
    company: 'TechVibe Inc.',
    role: 'Senior Developer',
    salary: '₹8,500',
    status: 'Active', 
    joiningDate: '12 Jan 2023',
    avatar: 'SJ'
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    email: 'm.chen@globallogistics.com',
    company: 'Global Logistics',
    role: 'Operations Manager',
    salary: '₹6,200',
    status: 'Active', 
    joiningDate: '24 Feb 2023',
    avatar: 'MC'
  },
  { 
    id: 3, 
    name: 'Emma Wilson', 
    email: 'emma.w@ecoware.com',
    company: 'EcoWare Solutions',
    role: 'Product Designer',
    salary: '₹7,800',
    status: 'On Leave', 
    joiningDate: '05 Mar 2023',
    avatar: 'EW'
  },
  { 
    id: 4, 
    name: 'David Miller', 
    email: 'd.miller@innovate.com',
    company: 'Innovate Digital',
    role: 'Marketing Lead',
    salary: '₹5,500',
    status: 'Active', 
    joiningDate: '18 Mar 2023',
    avatar: 'DM'
  },
  { 
    id: 5, 
    name: 'Lisa Anderson', 
    email: 'lisa.a@bluesky.com',
    company: 'Blue Sky Media',
    role: 'HR Manager',
    salary: '₹6,800',
    status: 'Terminated', 
    joiningDate: '02 Apr 2023',
    avatar: 'LA'
  },
];

export const mockLeaveBalances = [
  { employeeId: 1, name: 'Sarah Johnson', casual: 8, sick: 5, earned: 12, paid: 15 },
  { employeeId: 2, name: 'Michael Chen', casual: 10, sick: 4, earned: 14, paid: 12 },
  { employeeId: 3, name: 'Emma Wilson', casual: 6, sick: 7, earned: 8, paid: 10 },
  { employeeId: 4, name: 'David Miller', casual: 12, sick: 3, earned: 16, paid: 8 },
  { employeeId: 5, name: 'Lisa Anderson', casual: 9, sick: 6, earned: 10, paid: 11 },
];

export const mockLeaveRequests = [
  { id: 'LR-101', employeeName: 'Sarah Johnson', type: 'Sick Leave', startDate: '2026-05-24', endDate: '2026-05-25', reason: 'Dental appointment & recovery', status: 'Pending' },
  { id: 'LR-102', employeeName: 'Michael Chen', type: 'Casual Leave', startDate: '2026-06-01', endDate: '2026-06-03', reason: 'Attending family wedding', status: 'Approved' },
  { id: 'LR-103', employeeName: 'Emma Wilson', type: 'Paid Leave', startDate: '2026-05-18', endDate: '2026-05-20', reason: 'Short summer getaway', status: 'Rejected' },
];

export const mockHolidays = [
  { name: 'Independence Day', date: '15 Aug 2026', type: 'National' },
  { name: 'Gandhi Jayanti', date: '02 Oct 2026', type: 'National' },
  { name: 'Diwali Festival', date: '08 Nov 2026', type: 'Gazetted' },
  { name: 'Christmas Day', date: '25 Dec 2026', type: 'Restricted' },
];

export const mockTasks = [
  { id: 'TSK-201', title: 'Optimize Database Queries', description: 'Address slow query speeds on company ledger summaries.', assignee: 'Sarah Johnson', priority: 'High', status: 'In Progress', deadline: '2026-05-28', progress: 65 },
  { id: 'TSK-202', title: 'Redesign Login Screen', description: 'Implement modern glassmorphic theme to improve page conversion.', assignee: 'Emma Wilson', priority: 'Medium', status: 'To Do', deadline: '2026-06-02', progress: 0 },
  { id: 'TSK-203', title: 'Geofence Breach Webhooks', description: 'Configure endpoint triggers for outside geofence alerts.', assignee: 'Michael Chen', priority: 'High', status: 'Under Review', deadline: '2026-05-25', progress: 90 },
  { id: 'TSK-204', title: 'Export Payroll Reports', description: 'Develop PDF generation for monthly payslip disbursements.', assignee: 'David Miller', priority: 'Low', status: 'Completed', deadline: '2026-05-20', progress: 100 },
];

export const mockLiveLocations = [
  { employeeId: 1, name: 'Sarah Johnson', role: 'Senior Developer', lat: 19.0760, lng: 72.8777, status: 'In Office', speed: '0 km/h', battery: '92%' },
  { employeeId: 2, name: 'Michael Chen', role: 'Operations Manager', lat: 19.0820, lng: 72.8820, status: 'In Office', speed: '0 km/h', battery: '85%' },
  { employeeId: 3, name: 'Emma Wilson', role: 'Product Designer', lat: 19.0900, lng: 72.8900, status: 'On Leave', speed: '0 km/h', battery: '95%' },
  { employeeId: 4, name: 'David Miller', role: 'Marketing Lead', lat: 19.0650, lng: 72.8600, status: 'Outside Geofence', speed: '12 km/h', battery: '42%' },
];

export const mockLocationLogs = [
  { id: 'LOG-401', employeeName: 'David Miller', event: 'Geofence Breach', description: 'Crossed outer boundary of Office Geofence Zone', timestamp: '22 May 2026 10:14 PM', coordinates: '19.0650, 72.8600' },
  { id: 'LOG-402', employeeName: 'Sarah Johnson', event: 'Office Check-In', description: 'Checked in at Main Entrance Gate', timestamp: '22 May 2026 09:02 AM', coordinates: '19.0760, 72.8777' },
  { id: 'LOG-403', employeeName: 'Michael Chen', event: 'GPS Reconnected', description: 'Satellite signal restored successfully', timestamp: '22 May 2026 08:45 AM', coordinates: '19.0820, 72.8820' },
];

