import * as XLSX from 'xlsx';

interface EmployeeDetail {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  designation: string;
  officeName: string;
  breakType?: string;
  startAt?: string;
}

interface LiveStats {
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  breaks: {
    lunch: number;
    tea: number;
    personal: number;
    meeting: number;
  };
  pendingLeaves: number;
  pendingShiftRequests: number;
  branchWise: {
    branch: string;
    present: number;
    absent: number;
    onBreak: number;
  }[];
  details: {
    present: EmployeeDetail[];
    absent: EmployeeDetail[];
    onLeave: EmployeeDetail[];
    late: EmployeeDetail[];
    breaks: {
      lunch: EmployeeDetail[];
      tea: EmployeeDetail[];
      personal: EmployeeDetail[];
      meeting: EmployeeDetail[];
    };
  };
}

export function exportLiveDashboardToExcel(stats: LiveStats, upcomingLeaves: any[] = []) {
  const wb = XLSX.utils.book_new();

  // 1. Overall Summary Sheet
  const summaryData = [
    { Metric: 'Report Date & Time', Value: new Date().toLocaleString() },
    { Metric: 'Checked In / Present', Value: stats.present },
    { Metric: 'Absent Today', Value: stats.absent },
    { Metric: 'On Approved Leave', Value: stats.onLeave },
    { Metric: 'Late Arrivals', Value: stats.late },
    { Metric: 'Lunch Break Active', Value: stats.breaks.lunch },
    { Metric: 'Tea Break Active', Value: stats.breaks.tea },
    { Metric: 'Personal Break Active', Value: stats.breaks.personal },
    { Metric: 'Meeting / Client Active', Value: stats.breaks.meeting },
    { Metric: 'Pending Leave Approvals', Value: stats.pendingLeaves },
    { Metric: 'Pending Shift Change Requests', Value: stats.pendingShiftRequests },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Executive Summary');

  // 2. Branch-Wise Telemetry Sheet
  const branchData = stats.branchWise.map((b) => ({
    'Office Branch': b.branch,
    'Present Count': b.present,
    'Absent Count': b.absent,
    'On Break Count': b.onBreak,
  }));
  const branchSheet = XLSX.utils.json_to_sheet(branchData.length > 0 ? branchData : [{ 'Office Branch': 'No data', 'Present Count': 0, 'Absent Count': 0, 'On Break Count': 0 }]);
  XLSX.utils.book_append_sheet(wb, branchSheet, 'Branch Telemetry');

  // Helper for employee list sheets
  const formatEmpList = (list: EmployeeDetail[], extraColName?: string) => {
    if (!list || list.length === 0) {
      return [{ 'Employee Code': 'N/A', Name: 'No records found', Designation: '-', Branch: '-' }];
    }
    return list.map((emp) => {
      const base: Record<string, any> = {
        'Employee Code': emp.employeeCode || '-',
        Name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        Designation: emp.designation || 'Staff',
        Branch: emp.officeName || 'General',
      };
      if (extraColName && emp.startAt) {
        base[extraColName] = new Date(emp.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return base;
    });
  };

  // 3. Checked In Employees
  const presentSheet = XLSX.utils.json_to_sheet(formatEmpList(stats.details.present));
  XLSX.utils.book_append_sheet(wb, presentSheet, 'Checked In');

  // 4. Absent Employees
  const absentSheet = XLSX.utils.json_to_sheet(formatEmpList(stats.details.absent));
  XLSX.utils.book_append_sheet(wb, absentSheet, 'Absent');

  // 5. On Leave Employees
  const onLeaveSheet = XLSX.utils.json_to_sheet(formatEmpList(stats.details.onLeave));
  XLSX.utils.book_append_sheet(wb, onLeaveSheet, 'On Leave');

  // 6. Late Arrivals
  const lateSheet = XLSX.utils.json_to_sheet(formatEmpList(stats.details.late));
  XLSX.utils.book_append_sheet(wb, lateSheet, 'Late Arrivals');

  // 7. Active Breaks
  const allBreaks = [
    ...(stats.details.breaks.lunch || []).map((e) => ({ ...e, breakType: 'Lunch' })),
    ...(stats.details.breaks.tea || []).map((e) => ({ ...e, breakType: 'Tea' })),
    ...(stats.details.breaks.personal || []).map((e) => ({ ...e, breakType: 'Personal' })),
    ...(stats.details.breaks.meeting || []).map((e) => ({ ...e, breakType: 'Meeting' })),
  ];
  const breaksData = allBreaks.length > 0
    ? allBreaks.map((b) => ({
        'Employee Code': b.employeeCode,
        Name: `${b.firstName} ${b.lastName}`.trim(),
        Designation: b.designation || 'Staff',
        Branch: b.officeName,
        'Break Type': b.breakType,
        'Started At': b.startAt ? new Date(b.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      }))
    : [{ 'Employee Code': 'N/A', Name: 'No active breaks', Designation: '-', Branch: '-', 'Break Type': '-', 'Started At': '-' }];
  const breaksSheet = XLSX.utils.json_to_sheet(breaksData);
  XLSX.utils.book_append_sheet(wb, breaksSheet, 'Active Breaks');

  // 8. Upcoming Leaves
  const leavesData = upcomingLeaves.length > 0
    ? upcomingLeaves.map((l) => ({
        'Employee Name': l.employeeName || '-',
        'Leave Type': l.type || '-',
        Branch: l.branch || '-',
        Dates: l.dates || '-',
      }))
    : [{ 'Employee Name': 'No upcoming leaves', 'Leave Type': '-', Branch: '-', Dates: '-' }];
  const leavesSheet = XLSX.utils.json_to_sheet(leavesData);
  XLSX.utils.book_append_sheet(wb, leavesSheet, 'Upcoming Leaves');

  // Generate filename with timestamp
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const fileName = `Live_Dashboard_Report_${dateStr}_${timeStr}.xlsx`;

  // Save File
  XLSX.writeFile(wb, fileName);
}
