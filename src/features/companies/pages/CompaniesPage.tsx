"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Building2,
  Users as UsersIcon,
  Globe,
  Mail,
  TrendingUp,
  Download,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import TableSkeleton from '@/components/TableSkeleton';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { useCompanyStats } from '@/hooks/useCompanyStats';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  website: z.string().url('Invalid website URL').or(z.string().length(0)),
  adminEmail: z.string().email('Invalid email address'),
  plan: z.string().min(1, 'Please select a plan'),
  employeeCount: z.number().min(1, 'Count must be greater than 0'),
});

type CompanyFormData = z.infer<typeof companySchema>;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const CompaniesPage = () => {
  const { stats, isLoading: isStatsLoading, error: statsError } = useCompanyStats();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCompany, setDeletingCompany] = useState<any>(null);

  // Live Integration States
  const [companies, setCompanies] = useState<any[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');

  const summaryStats = [
    {
      label: 'Total Entities',
      value: stats ? stats.totalEntities.toLocaleString() : '—',
      icon: Building2,
      color: 'primary',
    },
    {
      label: 'Global Seats',
      value: stats ? stats.globalSeats.toLocaleString() : '—',
      icon: UsersIcon,
      color: 'secondary',
    },
    {
      label: 'Pending Verification',
      value: stats ? stats.pendingVerification.toLocaleString() : '—',
      icon: ShieldAlert,
      color: 'warning',
      trend: stats
        ? stats.pendingVerification > 0
          ? 'Attention'
          : 'Clear'
        : null,
    },
    {
      label: 'System Growth',
      value: stats?.systemGrowth ?? '—',
      icon: TrendingUp,
      color: 'success',
    },
  ];

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { fetchOffices } = await import('@/services/officeService');
      const offices = await fetchOffices();
      const mapped = offices.map((off) => ({
        id: Number(off.id) || Math.floor(Math.random() * 10000),
        name: off.name,
        employees: off._count?.employees ?? 0,
        plan: off.subscriptionPlan || 'Basic',
        status: off.isActive ? 'Active' : 'Suspended',
        joiningDate: new Date(off.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        logo: off.name.substring(0, 2).toUpperCase(),
        website: off.code ? `https://${off.code.toLowerCase()}.quickboom.com` : 'https://quickboom.com',
        adminEmail: `admin@${off.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        address: off.address,
        latitude: off.latitude,
        longitude: off.longitude,
        idealRadiusMeters: off.idealRadiusMeters,
        maxPunchRadiusMeters: off.maxPunchRadiusMeters,
        subscriptionPlan: off.subscriptionPlan,
        billingCycle: off.billingCycle,
        invoiceStatus: off.invoiceStatus,
        code: off.code
      }));
      setCompanies(mapped);
    } catch (err) {
      console.error('Failed to load real companies:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      website: '',
      adminEmail: '',
      plan: '',
      employeeCount: 0,
    }
  });

  useEffect(() => {
    if (editingCompany) {
      setValue('name', editingCompany.name);
      setValue('plan', editingCompany.plan.toLowerCase());
      setValue('employeeCount', editingCompany.employees);
      setValue('website', editingCompany.website || '');
      setValue('adminEmail', editingCompany.adminEmail || '');
    } else {
      reset();
    }
  }, [editingCompany, setValue, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const payload = {
        name: data.name,
        code: data.website ? data.website.replace('https://', '').replace('http://', '').split('.')[0] : data.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        address: editingCompany?.address || 'Primary Business Address',
        latitude: editingCompany?.latitude || 19.0760,
        longitude: editingCompany?.longitude || 72.8777,
        idealRadiusMeters: editingCompany?.idealRadiusMeters || 50,
        maxPunchRadiusMeters: editingCompany?.maxPunchRadiusMeters || 50,
        isActive: editingCompany ? editingCompany.status === 'Active' : true,
        subscriptionPlan: data.plan.charAt(0).toUpperCase() + data.plan.slice(1).toLowerCase(),
        billingCycle: editingCompany?.billingCycle || 'monthly',
        invoiceStatus: editingCompany?.invoiceStatus || 'Paid',
      };

      if (editingCompany) {
        const { updateOffice } = await import('@/services/officeService');
        await updateOffice(editingCompany.id.toString(), payload);
      } else {
        const { createOffice } = await import('@/services/officeService');
        await createOffice(payload);
      }
      await loadCompanies();

      setIsModalOpen(false);
      setEditingCompany(null);
      reset();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleToggleStatus = async (company: any) => {
    try {
      const newStatus = company.status === 'Active' ? 'Suspended' : 'Active';
      const { updateOffice } = await import('@/services/officeService');
      await updateOffice(company.id.toString(), {
        name: company.name,
        code: company.code || undefined,
        address: company.address || 'Primary Business Address',
        latitude: company.latitude || 19.0760,
        longitude: company.longitude || 72.8777,
        idealRadiusMeters: company.idealRadiusMeters || 50,
        maxPunchRadiusMeters: company.maxPunchRadiusMeters || 50,
        isActive: newStatus === 'Active',
        subscriptionPlan: company.subscriptionPlan,
        billingCycle: company.billingCycle,
        invoiceStatus: company.invoiceStatus,
      });
      await loadCompanies();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const confirmDelete = (company: any) => {
    setDeletingCompany(company);
  };

  const executeDelete = async () => {
    if (!deletingCompany) return;
    try {
      const { deleteOffice } = await import('@/services/officeService');
      await deleteOffice(deletingCompany.id.toString());
      await loadCompanies();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      searchQuery === '' ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.id.toString().includes(searchQuery) ||
      (company.adminEmail && company.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      company.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPlan =
      planFilter === 'All' ||
      company.plan.toLowerCase() === planFilter.toLowerCase() ||
      (planFilter.toLowerCase() === 'professional' && company.plan.toLowerCase() === 'pro');

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      <SuperAdminHeader
        title="Company Ecosystem"
        subtitle="Strategic oversight of all registered entities, their operational scale, and service utilization."
        badgeText="Enterprise Management"
        badgeIcon={Building2}
        stats={[
          { label: 'Total Companies', value: companies.length.toString(), icon: Building2 },
          { label: 'Active Users', value: stats ? stats.globalSeats.toString() : '0', icon: UsersIcon },
          { label: 'Monthly Revenue', value: stats ? `₹${(stats.monthlyRevenue / 1000000).toFixed(1)}M` : '₹0', icon: TrendingUp },
          { label: 'Pending Verification', value: stats ? stats.pendingVerification.toString() : '0', icon: ShieldAlert }
        ]}
      >
        <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-2xl text-sm font-semibold text-text-secondary hover:text-primary transition-all hover:shadow-md active:scale-95">
          <Download size={18} />
          Bulk Export
          </button>
          <button 
            onClick={() => {
              setEditingCompany(null);
              setIsModalOpen(true);
            }}
            className="btn-primary group shadow-xl shadow-primary/20"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Provision Company
          </button>
      </SuperAdminHeader>

      {statsError ? (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning"
        >
          {statsError}
        </motion.div>
      ) : null}

      {/* Top Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className={cn(
              'glass-card p-4 sm:p-6 group hover:border-primary/50 transition-all cursor-default relative overflow-hidden',
              isStatsLoading && 'animate-pulse'
            )}
          >
            <div className={cn(
              "absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl opacity-10 transition-transform group-hover:scale-150 duration-700",
              `bg-${stat.color}`
            )} />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-300 group-hover:scale-110",
                `bg-${stat.color}/10 text-${stat.color}`
              )}>
                <stat.icon size={22} />
              </div>
              {stat.trend ? (
                <span className={cn(
                  "text-micro font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                  stat.trend === 'Attention'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-success/10 text-success'
                )}>
                  {stat.trend}
                </span>
              ) : null}
            </div>
            <p className="text-stat-label">{stat.label}</p>
            <h3 className="text-stat-value mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Filter & Action Bar */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4 rounded-3xl"
      >
        <div className="relative w-full xl:w-[450px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or admin email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-text-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-surface-variant rounded-2xl text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all flex-grow sm:flex-grow-0 justify-center">
            <Filter size={16} />
            Filters
          </button>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-grow sm:flex-grow-0 bg-surface-variant border-none rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-text-secondary outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select 
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="flex-grow sm:flex-grow-0 bg-surface-variant border-none rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-text-secondary outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="All">Plan: All</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Professional">Professional</option>
          </select>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <TableSkeleton rows={6} columns={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50">
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Entity Details</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Operational Scale</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Subscription Tier</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Status</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Engagement</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCompanies.map((company) => (
                  <motion.tr 
                    key={company.id}
                    variants={itemVariants}
                    className="hover:bg-surface-variant transition-colors group cursor-pointer"
                  >
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-lg group-hover:scale-110 transition-all duration-300 shadow-sm border border-primary/10">
                          {company.name.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary tracking-tight group-hover:text-primary transition-colors">{company.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-micro font-bold text-muted bg-surface-variant px-1.5 py-0.5 rounded uppercase tracking-tighter">
                              ID: #{company.id}
                            </span>
                            <span className="text-micro font-medium text-text-secondary">• {company.adminEmail || 'admin@entity.com'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-text-primary">{company.employees.toLocaleString()}</span>
                        <span className="text-micro font-bold text-text-secondary uppercase tracking-tight">Active Seats</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-xl text-label transition-all",
                        company.plan === 'Enterprise' ? "bg-secondary text-white shadow-lg shadow-secondary/20" : 
                        company.plan === 'Pro' || company.plan === 'Professional' ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                      )}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                           "w-2 h-2 rounded-full",
                           company.status === 'Active' ? "bg-success" : "bg-error"
                        )} />
                        <span className={cn(
                           "text-xs font-bold",
                           company.status === 'Active' ? "text-success" : "text-error"
                        )}>
                          {company.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                        <Calendar size={14} className="text-muted" />
                        {company.joiningDate}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(company);
                          }}
                          title={company.status === 'Active' ? 'Suspend Company' : 'Activate Company'}
                          className="p-2.5 bg-surface border border-border text-muted hover:text-warning hover:border-warning/50 rounded-xl transition-all shadow-sm"
                        >
                          {company.status === 'Active' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(company);
                          }}
                          title="Delete Company"
                          className="p-2.5 bg-surface border border-border text-muted hover:text-error hover:border-error/50 rounded-xl transition-all shadow-sm"
                        >
                          <Plus size={18} className="rotate-45 text-error" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCompany(company);
                            setIsModalOpen(true);
                          }}
                          title="Edit Parameters"
                          className="p-2.5 bg-surface border border-border text-muted hover:text-text-primary rounded-xl transition-all shadow-sm"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && (
          <div className="p-6 bg-surface-variant border-t border-border flex items-center justify-between">
            <p className="text-label text-text-secondary">Showing {filteredCompanies.length} of {companies.length} Managed Entities</p>
            <div className="flex items-center gap-2">
              <button className="px-5 py-2.5 bg-surface border border-border rounded-xl text-xs font-black uppercase tracking-widest text-text-secondary disabled:opacity-30 hover:shadow-sm transition-all" disabled>Previous</button>
              <button className="px-5 py-2.5 bg-surface border border-border rounded-xl text-xs font-black uppercase tracking-widest text-text-secondary hover:shadow-sm hover:text-primary transition-all">Next</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Company Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
          reset();
        }}
        title={editingCompany ? "Adjust Entity Parameters" : "Provision New Entity"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-label text-text-secondary ml-1">Company Identity</label>
              <div className="relative group">
                <Building2 className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", errors.name ? "text-error" : "text-muted group-focus-within:text-primary")} />
                <input 
                  {...register('name')}
                  type="text" 
                  placeholder="e.g. Cyberdyne Systems" 
                  className={cn(
                    "w-full pl-12 pr-4 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 transition-all font-bold text-text-primary",
                    errors.name ? "ring-2 ring-error/20" : "focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.name && <p className="text-micro text-error font-bold uppercase tracking-wide ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-label text-text-secondary ml-1">Digital Domain</label>
              <div className="relative group">
                <Globe className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", errors.website ? "text-error" : "text-muted group-focus-within:text-primary")} />
                <input 
                  {...register('website')}
                  type="text" 
                  placeholder="https://domain.com" 
                  className={cn(
                    "w-full pl-12 pr-4 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 transition-all font-bold text-text-primary",
                    errors.website ? "ring-2 ring-error/20" : "focus:ring-primary/20"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-label text-text-secondary ml-1">Primary Liaison</label>
              <div className="relative group">
                <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", errors.adminEmail ? "text-error" : "text-muted group-focus-within:text-primary")} />
                <input 
                  {...register('adminEmail')}
                  type="email" 
                  placeholder="admin@entity.com" 
                  className={cn(
                    "w-full pl-12 pr-4 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 transition-all font-bold text-text-primary",
                    errors.adminEmail ? "ring-2 ring-error/20" : "focus:ring-primary/20"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-label text-text-secondary ml-1">Subscription Tier</label>
              <select 
                {...register('plan')}
                className={cn(
                  "w-full px-5 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 transition-all text-sm font-bold uppercase tracking-wider text-text-primary",
                  errors.plan ? "ring-2 ring-error/20" : "focus:ring-primary/20"
                )}
              >
                <option value="">Select Tier</option>
                <option value="basic">Standard (₹49/mo)</option>
                <option value="pro">Pro (₹149/mo)</option>
                <option value="enterprise">Enterprise (Custom)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-label text-text-secondary ml-1">Workforce Allocation</label>
            <div className="relative group">
              <UsersIcon className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", errors.employeeCount ? "text-error" : "text-muted group-focus-within:text-primary")} />
              <input 
                {...register('employeeCount', { valueAsNumber: true })}
                type="number" 
                placeholder="Initial seat count" 
                className={cn(
                  "w-full pl-12 pr-4 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 transition-all font-bold text-text-primary",
                  errors.employeeCount ? "ring-2 ring-error/20" : "focus:ring-primary/20"
                )}
              />
            </div>
          </div>
          
          <div className="pt-8 flex gap-4">
            <button 
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
              className="flex-1 py-4 bg-surface-variant text-text-secondary text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface transition-all border border-border"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3 px-8"
            >
              {isSubmitting ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  {editingCompany ? 'Confirm Adjustments' : 'Initiate Provisioning'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCompany}
        onClose={() => setDeletingCompany(null)}
        onConfirm={executeDelete}
        title={`Delete ${deletingCompany?.name}?`}
        message={`Are you sure you want to delete ${deletingCompany?.name}? This action cannot be undone.`}
        confirmText="Delete Entity"
        cancelText="Cancel"
      />
    </motion.div>
  );
};

export default CompaniesPage;
