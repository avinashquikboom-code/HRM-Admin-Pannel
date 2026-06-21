'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, UserPlus, Loader2, RotateCcw, Building, User } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import { registerUser, type RegisterRole } from '@/services/authService';
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
  const [departments, setDepartments] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
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

  useEffect(() => {
    loadDepartments();
    loadOffices();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = await registerUser({
        email: normalizedEmail,
        password,
        role: selectedRole,
        departmentId,
        officeId,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });

      setSuccess(
        `${result.user.email} registered as ${selectedRole} successfully.`
      );

      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setDepartmentId(undefined);
      setOfficeId(undefined);
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
