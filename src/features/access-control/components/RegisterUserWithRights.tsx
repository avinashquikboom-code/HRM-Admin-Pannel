'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, UserPlus, Loader2, RotateCcw, Building, User, Phone, Calendar as CalendarIcon, Briefcase, Clock, ShieldCheck } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import { type RegisterRole } from '@/services/authService';
import {
  createEmployee,
  fetchEmployees,
  fetchShifts,
  fetchDesignations
} from '@/services/employeeService';
import { getAuthSession } from '@/lib/authStorage';
import type { PortalType } from '@/lib/portals';
import { cn } from '@/utils/cn';
import { fetchHRDepartments, fetchHROffices } from '@/services/hrService';

interface RegisterUserWithRightsProps {
  managerPortal: 'super_admin' | 'platform_admin';
  /** Fixed role for this registration flow */
  registerRole: RegisterRole;
  /** Which module set to assign */
  targetPortal: PortalType;
  compact?: boolean;
  allowRoleSelection?: boolean;
}

const CONFIG = {
  super_admin: {
    title: 'Register Admin',
    description: 'Create a new HR Admin account.',
    roleLabel: 'HR Admin',
  },
  platform_admin: {
    title: 'Register Employee',
    description: 'Create a new employee account.',
    roleLabel: 'Employee',
  },
};

export default function RegisterUserWithRights({
  managerPortal,
  registerRole,
  targetPortal,
  compact = false,
  allowRoleSelection = false,
}: RegisterUserWithRightsProps) {
  const copy = CONFIG[managerPortal];
  const adminSession = getAuthSession(managerPortal);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState<RegisterRole>(registerRole);
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [officeId, setOfficeId] = useState<number | undefined>();
  
  // New Fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState<number | undefined>();
  const [shiftId, setShiftId] = useState<number | undefined>();
  const [designationId, setDesignationId] = useState<number | undefined>();

  // Salary Structure
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [hra, setHra] = useState<number>(0);
  const [medicalAllowance, setMedicalAllowance] = useState<number>(0);
  const [travelAllowance, setTravelAllowance] = useState<number>(0);
  const [specialAllowance, setSpecialAllowance] = useState<number>(0);
  const [incentive, setIncentive] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);

  const [pfEnabled, setPfEnabled] = useState(false);
  const [employeePfRate, setEmployeePfRate] = useState<number>(12.0);
  const [employerPfRate, setEmployerPfRate] = useState<number>(12.0);

  const [esicEnabled, setEsicEnabled] = useState(false);
  const [employeeEsicRate, setEmployeeEsicRate] = useState<number>(0.75);
  const [employerEsicRate, setEmployerEsicRate] = useState<number>(3.25);

  const [departments, setDepartments] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [shiftsList, setShiftsList] = useState<any[]>([]);
  const [designationsList, setDesignationsList] = useState<any[]>([]);

  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const depts = await fetchHRDepartments();
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const loadOffices = async () => {
    setIsLoadingOffices(true);
    try {
      const HROffices = await fetchHROffices();
      setOffices(HROffices);
    } catch (err) {
      console.error('Failed to load offices:', err);
    } finally {
      setIsLoadingOffices(false);
    }
  };

  const loadAdditionalData = async () => {
    setIsLoadingManagers(true);
    setIsLoadingShifts(true);
    setIsLoadingDesignations(true);
    try {
      const emps = await fetchEmployees();
      setEmployeesList(emps.employees || emps || []);
    } catch (err) {
      console.error('Failed to load employees for managers list:', err);
    } finally {
      setIsLoadingManagers(false);
    }

    try {
      const shifts = await fetchShifts();
      setShiftsList(shifts || []);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setIsLoadingShifts(false);
    }

    try {
      const desigs = await fetchDesignations();
      setDesignationsList(desigs || []);
    } catch (err) {
      console.error('Failed to load designations:', err);
    } finally {
      setIsLoadingDesignations(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadOffices();
    loadAdditionalData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: normalizedEmail,
        password,
        role: selectedRole,
        departmentId,
        officeId,
      };

      if (selectedRole === 'EMPLOYEE') {
        payload.mobileNumber = mobileNumber || undefined;
        payload.joiningDate = joiningDate || undefined;
        payload.reportingManagerId = reportingManagerId || undefined;
        payload.shiftId = shiftId || undefined;
        payload.designationId = designationId || undefined;
        payload.salaryStructure = {
          basicSalary,
          hra,
          medicalAllowance,
          travelAllowance,
          specialAllowance,
          incentive,
          bonus,
          pfEnabled,
          employeePfRate,
          employerPfRate,
          esicEnabled,
          employeeEsicRate,
          employerEsicRate,
        };
      }

      const result = await createEmployee(payload);

      setSuccess(
        `${result.employee?.firstName || firstName} registered successfully as ${selectedRole}.`
      );

      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setDepartmentId(undefined);
      setOfficeId(undefined);
      setMobileNumber('');
      setJoiningDate('');
      setReportingManagerId(undefined);
      setShiftId(undefined);
      setDesignationId(undefined);
      
      setBasicSalary(0);
      setHra(0);
      setMedicalAllowance(0);
      setTravelAllowance(0);
      setSpecialAllowance(0);
      setIncentive(0);
      setBonus(0);
      setPfEnabled(false);
      setEsicEnabled(false);

      // Refresh additional data list to include the newly created employee in manager options
      loadAdditionalData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="register-user-rights" className={cn(!compact && 'scroll-mt-8')}>
      <div className="mb-6">
        <h2 className="text-xl font-black text-text-primary tracking-tight">{copy.title}</h2>
        <p className="text-xs text-text-secondary mt-1.5 font-medium">{copy.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-sm bg-rose-500/10 border border-rose-500/20 px-4 py-3.5 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-4 py-3.5 text-xs font-semibold text-emerald-400">
            {success}
          </div>
        )}

        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
              First Name
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                className="input-dark pl-11 pr-4 py-4 text-xs font-semibold disabled:opacity-60"
                placeholder="John"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
              Last Name
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                className="input-dark pl-11 pr-4 py-4 text-xs font-semibold disabled:opacity-60"
                placeholder="Doe"
              />
            </div>
          </div>
        </div>

        {/* Email & Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
              Email Address *
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="input-dark pl-11 pr-4 py-4 text-xs font-semibold disabled:opacity-60"
                placeholder="newuser@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
              Account Password *
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={8}
              inputClassName="input-dark border-border hover:border-border/80 focus:border-primary/50 shadow-none py-4 text-xs"
              placeholder="Password@123"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Role & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allowRoleSelection && (
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
                User Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as RegisterRole)}
                disabled={isLoading}
                className="input-dark px-4 py-4 text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                {managerPortal === 'super_admin' ? (
                  <>
                    <option value="HR">HR Manager</option>
                    <option value="ADMIN">Admin</option>
                  </>
                ) : (
                  <>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR">HR Manager</option>
                  </>
                )}
              </select>
            </div>
          )}

          <div className={cn(!allowRoleSelection && 'sm:col-span-2')}>
            <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
              Department *
            </label>
            <div className="relative group">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
              <select
                value={departmentId || ''}
                onChange={(e) => setDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={isLoading || isLoadingDepartments}
                required
                className="input-dark pl-11 pr-12 py-4 text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadDepartments}
                disabled={isLoadingDepartments}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh departments"
              >
                <RotateCcw size={14} className={isLoadingDepartments ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Office Assignment (strictly required for Employee role for mobile login) */}
        <div>
          <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
            Office / Branch Allotment {selectedRole === 'EMPLOYEE' ? '*' : '(Optional)'}
          </label>
          <div className="relative group">
            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
            <select
              value={officeId || ''}
              onChange={(e) => setOfficeId(e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={isLoading || isLoadingOffices}
              required={selectedRole === 'EMPLOYEE'}
              className="input-dark pl-11 pr-12 py-4 text-xs font-semibold disabled:opacity-60 cursor-pointer"
            >
              <option value="">Select Office Location</option>
              {offices.map((off) => (
                <option key={off.id} value={off.id}>{off.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadOffices}
              disabled={isLoadingOffices}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh offices"
            >
              <RotateCcw size={14} className={isLoadingOffices ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {selectedRole === 'EMPLOYEE' && (
          <div className="space-y-5 pt-4 border-t border-border/60">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} />
              Employee Details & Assignment
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
                  Mobile Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    disabled={isLoading}
                    className="input-dark pl-11 pr-4 py-4 text-xs font-semibold disabled:opacity-60"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
                  Joining Date
                </label>
                <div className="relative group">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    disabled={isLoading}
                    className="input-dark pl-11 pr-4 py-4 text-xs font-semibold disabled:opacity-60 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Designation */}
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
                  Designation
                </label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
                  <select
                    value={designationId || ''}
                    onChange={(e) => setDesignationId(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading || isLoadingDesignations}
                    className="input-dark pl-11 pr-4 py-4 text-xs font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    <option value="">Select Designation</option>
                    {designationsList.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shift */}
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
                  Shift Allocation
                </label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
                  <select
                    value={shiftId || ''}
                    onChange={(e) => setShiftId(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading || isLoadingShifts}
                    className="input-dark pl-11 pr-4 py-4 text-xs font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    <option value="">Select Shift</option>
                    {shiftsList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reporting Manager */}
              <div>
                <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2.5 ml-1">
                  Reporting Manager
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
                  <select
                    value={reportingManagerId || ''}
                    onChange={(e) => setReportingManagerId(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading || isLoadingManagers}
                    className="input-dark pl-11 pr-4 py-4 text-xs font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    <option value="">Select Reporting Manager</option>
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Salary Structure Section */}
            <div className="space-y-4 pt-4 border-t border-border/40">
              <h3 className="text-xs font-black text-primary uppercase tracking-widest">
                Salary & Deductions Structure
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-2 ml-1">
                    Basic Salary *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={basicSalary || ''}
                    onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className="input-dark px-4 py-4 text-xs font-semibold"
                    placeholder="e.g. 15000"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-2 ml-1">
                    HRA (House Rent Allowance)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={hra || ''}
                    onChange={(e) => setHra(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className="input-dark px-4 py-4 text-xs font-semibold"
                    placeholder="e.g. 5000"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-2 ml-1">
                    Medical Allowance
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={medicalAllowance || ''}
                    onChange={(e) => setMedicalAllowance(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className="input-dark px-4 py-4 text-xs font-semibold"
                    placeholder="e.g. 1250"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-2 ml-1">
                    Travel Allowance
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={travelAllowance || ''}
                    onChange={(e) => setTravelAllowance(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className="input-dark px-4 py-4 text-xs font-semibold"
                    placeholder="e.g. 1600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-2 ml-1">
                    Special Allowance
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={specialAllowance || ''}
                    onChange={(e) => setSpecialAllowance(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className="input-dark px-4 py-4 text-xs font-semibold"
                    placeholder="e.g. 2000"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-2 ml-1">
                    Incentives
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={incentive || ''}
                    onChange={(e) => setIncentive(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className="input-dark px-4 py-4 text-xs font-semibold"
                    placeholder="e.g. 1000"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-2 ml-1">
                    Performance Bonus
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bonus || ''}
                    onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                    className="input-dark px-4 py-4 text-xs font-semibold"
                    placeholder="e.g. 3000"
                  />
                </div>
              </div>

              {/* PF and ESIC Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* PF Group */}
                <div className="p-4 bg-slate-800/40 rounded-sm border border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-primary">Enable Provident Fund (PF)</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 font-medium">Auto-deduct PF from payslip</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPfEnabled(!pfEnabled)}
                      className={cn(
                        'w-10 h-5 rounded-sm transition-all relative shrink-0 cursor-pointer',
                        pfEnabled ? 'bg-primary' : 'bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 w-4 h-4 rounded-sm transition-all bg-white',
                          pfEnabled ? 'left-5.5' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                  {pfEnabled && (
                    <div className="grid grid-cols-2 gap-3 pt-1 animate-fadeIn">
                      <div>
                        <label className="block text-[9px] font-black text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                          Emp Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={employeePfRate}
                          onChange={(e) => setEmployeePfRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-surface-variant rounded-sm outline-none focus:ring-1 focus:ring-primary text-text-primary text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                          Employer Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={employerPfRate}
                          onChange={(e) => setEmployerPfRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-700 rounded-sm outline-none focus:ring-1 focus:ring-primary text-text-primary text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ESIC Group */}
                <div className="p-4 bg-slate-800/40 rounded-sm border border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-primary">Enable ESIC</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 font-medium">Auto-deduct ESIC contributions</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEsicEnabled(!esicEnabled)}
                      className={cn(
                        'w-10 h-5 rounded-sm transition-all relative shrink-0 cursor-pointer',
                        esicEnabled ? 'bg-primary' : 'bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 w-4 h-4 rounded-sm transition-all bg-white',
                          esicEnabled ? 'left-5.5' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                  {esicEnabled && (
                    <div className="grid grid-cols-2 gap-3 pt-1 animate-fadeIn">
                      <div>
                        <label className="block text-[9px] font-black text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                          Emp Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={employeeEsicRate}
                          onChange={(e) => setEmployeeEsicRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-surface-variant rounded-sm outline-none focus:ring-1 focus:ring-primary text-text-primary text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                          Employer Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={employerEsicRate}
                          onChange={(e) => setEmployerEsicRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-700 rounded-sm outline-none focus:ring-1 focus:ring-primary text-text-primary text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-wider text-xs rounded-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Registering Account...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Register User
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
