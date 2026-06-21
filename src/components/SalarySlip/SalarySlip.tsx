import React from 'react';
import { Wallet } from 'lucide-react';

export interface SalarySlipProps {
  selectedSlip: any;
  slipAttendance: any;
  slipData: any;
  monthLabel: string;
  monthShort: string;
}

export const SalarySlip: React.FC<SalarySlipProps> = ({
  selectedSlip,
  slipAttendance,
  slipData,
  monthLabel,
  monthShort,
}) => {
  if (!selectedSlip || !slipData) return null;

  const {
    basic = 0,
    hra = 0,
    ta = 0,
    special = 0,
    grossEarnings = 0,
    pf = 0,
    pt = 0,
    tds = 0,
    totalDeductions = 0,
    netPay = 0,
    yr = 0,
    mo = 0,
    netInWords = ''
  } = slipData;

  return (
    <div className="border border-white/10 rounded-sm overflow-hidden bg-slate-950/60 shadow-2xl print-bg-white print-border">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          /* Print specific style resets */
          .print-bg-white {
            background-color: #ffffff !important;
            background-image: none !important;
          }
          .print-text-dark {
            color: #0f172a !important;
          }
          .print-text-muted {
            color: #475569 !important;
          }
          .print-border {
            border-color: #cbd5e1 !important;
          }
          .print-divide > * + * {
            border-color: #cbd5e1 !important;
          }
          .print-bg-emerald {
            background-color: #f0fdf4 !important;
            border-color: #bbf7d0 !important;
          }
          .print-text-emerald {
            color: #15803d !important;
          }
          .print-bg-rose {
            background-color: #fff1f2 !important;
            border-color: #fecdd3 !important;
          }
          .print-text-rose {
            color: #b91c1c !important;
          }
          .print-bg-primary {
            background-color: #f8fafc !important;
            border-color: #cbd5e1 !important;
          }
          .print-text-primary {
            color: #0d9488 !important;
          }
        }
      `}</style>

      {/* Company Header */}
      <div className="bg-gradient-to-r from-primary/25 via-teal-500/15 to-emerald-500/10 border-b border-white/10 px-8 py-6 flex items-center justify-between print-bg-white print-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight print-text-dark">HRM</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest print-text-muted">Human Resources · Payroll Division</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest print-text-muted">Salary Slip</p>
          <p className="text-sm font-black text-primary mt-0.5 print-text-primary">{monthLabel}</p>
          <p className="text-[10px] font-mono text-slate-500 mt-1 print-text-muted">
            DOC: QB-PAY-{selectedSlip.employeeCode}-{yr}{String(mo).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-6">

        {/* Info & Attendance Row side-by-side in landscape */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Employee Info Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 border border-white/8 rounded-sm p-6 print-border">
            {([
              ['Employee Name',   selectedSlip.name],
              ['Employee Code',   selectedSlip.employeeCode],
              ['Designation',     selectedSlip.designation],
              ['Department',      selectedSlip.department],
              ['Office / Branch', selectedSlip.office],
              ['Pay Period',      monthLabel],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest print-text-muted">{label}</span>
                <span className="text-sm font-bold text-white print-text-dark">{value}</span>
              </div>
            ))}
          </div>

          {/* Attendance Details Summary */}
          <div className="border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between p-5 bg-white/3 print-border print-bg-white">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 print-text-muted">Attendance Summary</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Working Days', value: slipAttendance?.workingDays ?? 0, numColor: 'text-slate-100 print-text-dark' },
                  { label: 'Present',      value: slipAttendance?.present     ?? 0, numColor: 'text-emerald-400 print-text-emerald' },
                  { label: 'Absent',       value: slipAttendance?.absent      ?? 0, numColor: 'text-rose-400 print-text-rose' },
                  { label: 'Half Day',     value: slipAttendance?.halfDay     ?? 0, numColor: 'text-blue-400 print-text-dark' },
                  { label: 'Late',         value: slipAttendance?.late        ?? 0, numColor: 'text-amber-400 print-text-dark' },
                  { label: 'Leave',        value: slipAttendance?.leave       ?? 0, numColor: 'text-purple-400 print-text-dark' },
                ].map(({ label, value, numColor }) => (
                  <div key={label} className="flex flex-col items-center justify-center p-2 rounded bg-white/5 border border-white/5 print-border print-bg-white">
                    <span className={`text-lg font-black font-mono leading-none ${numColor}`}>{value}</span>
                    <span className="text-[8px] font-bold text-slate-500 mt-1 text-center tracking-tight print-text-muted">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Earnings */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-sm overflow-hidden print-bg-emerald print-border">
            <div className="bg-emerald-500/10 px-5 py-3 border-b border-emerald-500/15 print-bg-emerald print-border">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest print-text-emerald">Earnings</h4>
            </div>
            <div className="divide-y divide-white/5 print-divide">
              {([
                ['Basic Salary',              basic],
                ['House Rent Allowance (HRA)', hra],
                ['Transport Allowance (TA)',   ta],
                ['Special Allowance',          special],
              ] as [string, number][]).map(([label, amt]) => (
                <div key={label} className="flex justify-between items-center px-5 py-3">
                  <span className="text-xs font-medium text-slate-400 print-text-muted">{label}</span>
                  <span className="text-xs font-black text-white font-mono print-text-dark">₹ {amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-5 py-3 bg-emerald-500/10 print-bg-emerald print-border">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider print-text-emerald">Gross Earnings</span>
                <span className="text-sm font-black text-emerald-400 font-mono print-text-emerald">₹ {grossEarnings.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-rose-500/5 border border-rose-500/15 rounded-sm overflow-hidden print-bg-rose print-border">
            <div className="bg-rose-500/10 px-5 py-3 border-b border-rose-500/15 print-bg-rose print-border">
              <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest print-text-rose">Deductions</h4>
            </div>
            <div className="divide-y divide-white/5 print-divide">
              {([
                ['Provident Fund (EPF 12%)', pf],
                ['Professional Tax (PT)',    pt],
                ['TDS / Income Tax',         tds],
              ] as [string, number][]).map(([label, amt]) => (
                <div key={label} className="flex justify-between items-center px-5 py-3">
                  <span className="text-xs font-medium text-slate-400 print-text-muted">{label}</span>
                  <span className="text-xs font-black text-white font-mono print-text-dark">₹ {amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-5 py-3 bg-rose-500/10 print-bg-rose print-border">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider print-text-rose">Total Deductions</span>
                <span className="text-sm font-black text-rose-400 font-mono print-text-rose">₹ {totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Banner */}
        <div className="bg-gradient-to-r from-primary/20 to-teal-500/10 border border-primary/25 rounded-sm px-7 py-5 flex items-center justify-between print-bg-primary print-border">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest print-text-muted">Net Payable Amount</p>
            <p className="text-3xl font-black text-primary mt-1 font-mono print-text-primary">₹ {netPay.toLocaleString('en-IN')}</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1 italic print-text-muted">{netInWords}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1.5 bg-success/15 text-success text-[10px] font-black rounded-full uppercase border border-success/25 print-bg-emerald print-text-emerald print-border">Approved</span>
            <p className="text-[10px] font-mono text-slate-500 mt-2 print-text-muted">Paid via: Bank Transfer</p>
          </div>
        </div>

        {/* Signature lines */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5 print-border">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest print-text-muted">Employee Acknowledgement</p>
            <div className="h-8 border-b border-dashed border-white/10 print-border" />
            <p className="text-[10px] text-slate-600 print-text-dark">{selectedSlip.name} · {selectedSlip.employeeCode}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest print-text-muted">Authorised Signatory</p>
            <div className="h-8 border-b border-dashed border-white/10 print-border" />
            <p className="text-[10px] text-slate-600 print-text-dark">HR Department · HRM</p>
          </div>
        </div>

        <p className="text-center text-[9px] text-slate-600 pt-2 print-text-muted">
          This is a computer-generated salary slip and does not require a physical signature. · {monthLabel}
        </p>
      </div>
    </div>
  );
};
