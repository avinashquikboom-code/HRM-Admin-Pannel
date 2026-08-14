'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Users,
  User,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import {
  fetchHrShiftRules,
  createHrShiftRule,
  updateHrShiftRule,
  deleteHrShiftRule,
  ShiftRuleRecord,
} from '@/services/shiftRuleService';
import { fetchOffices, Office } from '@/services/officesService';
import { fetchEmployees, AdminEmployee } from '@/services/employeeService';

export default function ShiftRulesPage() {
  const [rules, setRules] = useState<ShiftRuleRecord[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ShiftRuleRecord | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formShiftType, setFormShiftType] = useState('ALL');
  const [formBranchId, setFormBranchId] = useState('ALL');
  const [formEmployeeId, setFormEmployeeId] = useState('ALL');
  const [formPriority, setFormPriority] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  // Mobile Preview State
  const [previewOpenRuleId, setPreviewOpenRuleId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rulesData, officesData, employeesData] = await Promise.all([
        fetchHrShiftRules({ shiftType: shiftFilter }),
        fetchOffices().catch(() => []),
        fetchEmployees({ limit: 1000 }).then(res => res.employees).catch(() => []),
      ]);

      setRules(rulesData);
      setOffices(officesData);
      setEmployees(employeesData);

      if (rulesData.length > 0 && !previewOpenRuleId) {
        setPreviewOpenRuleId(rulesData[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load shift rules data:', err);
      setError(err.message || 'Failed to fetch shift guidelines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [shiftFilter]);

  const openCreateModal = () => {
    setEditingRule(null);
    setFormTitle('');
    setFormContent('');
    setFormShiftType('ALL');
    setFormBranchId('ALL');
    setFormEmployeeId('ALL');
    setFormPriority(0);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: ShiftRuleRecord) => {
    setEditingRule(rule);
    setFormTitle(rule.title);
    setFormContent(rule.content);
    setFormShiftType(rule.shiftType || 'ALL');
    setFormBranchId(rule.branchId || 'ALL');
    setFormEmployeeId(rule.employeeId || 'ALL');
    setFormPriority(rule.priority || 0);
    setFormIsActive(rule.isActive);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Title and Content are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingRule) {
        await updateHrShiftRule(editingRule.id, {
          title: formTitle.trim(),
          content: formContent.trim(),
          shiftType: formShiftType,
          branchId: formBranchId,
          employeeId: formEmployeeId,
          priority: formPriority,
          isActive: formIsActive,
        });
      } else {
        await createHrShiftRule({
          title: formTitle.trim(),
          content: formContent.trim(),
          shiftType: formShiftType,
          branchId: formBranchId,
          employeeId: formEmployeeId,
          priority: formPriority,
        });
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Error saving guideline: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (rule: ShiftRuleRecord) => {
    try {
      await updateHrShiftRule(rule.id, { isActive: !rule.isActive });
      await loadData();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const requestDelete = (rule: ShiftRuleRecord) => {
    setDeleteConfirmId(rule.id);
    setDeleteTitle(rule.title);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await deleteHrShiftRule(deleteConfirmId);
      setDeleteConfirmId(null);
      setDeleteTitle('');
      await loadData();
    } catch (err: any) {
      alert(`Failed to delete rule: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Helper maps for Office/Branch and Employee names
  const officeMap = useMemo(() => {
    const map = new Map<string, string>();
    offices.forEach((o) => map.set(String(o.id), o.name));
    return map;
  }, [offices]);

  const employeeMap = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((e) => map.set(String(e.id), `${e.firstName} ${e.lastName || ''}`.trim()));
    return map;
  }, [employees]);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      // Branch filter
      if (branchFilter !== 'ALL') {
        if (r.branchId && r.branchId !== 'ALL' && r.branchId !== branchFilter) {
          return false;
        }
      }

      // Employee filter
      if (employeeFilter !== 'ALL') {
        if (r.employeeId && r.employeeId !== 'ALL' && r.employeeId !== employeeFilter) {
          return false;
        }
      }

      // Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const branchName = r.branchId ? (officeMap.get(r.branchId) || '') : '';
        const empName = r.employeeId ? (employeeMap.get(r.employeeId) || '') : '';

        const matchesTitle = r.title.toLowerCase().includes(term);
        const matchesContent = r.content.toLowerCase().includes(term);
        const matchesShift = (r.shiftType || '').toLowerCase().includes(term);
        const matchesBranch = branchName.toLowerCase().includes(term);
        const matchesEmployee = empName.toLowerCase().includes(term);

        if (!matchesTitle && !matchesContent && !matchesShift && !matchesBranch && !matchesEmployee) {
          return false;
        }
      }

      return true;
    });
  }, [rules, branchFilter, employeeFilter, searchTerm, officeMap, employeeMap]);

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Shift Rules & Guidelines</h1>
            <p className="text-slate-500 text-sm">
              Define operational policies, shift rules, and conduct guidelines for employees & branches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              await loadData();
              toast.success('Shift rules guidelines refreshed');
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            New Guideline
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, content, shift, branch, or employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none min-w-[140px]">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Shift:</span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Shifts</option>
              <option value="MORNING">Morning Shift</option>
              <option value="AFTERNOON">Afternoon Shift</option>
              <option value="EVENING">Evening Shift</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none min-w-[170px]">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Branch:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Branches (Global)</option>
              {offices.map((office) => (
                <option key={office.id} value={String(office.id)}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none min-w-[180px]">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Employee:</span>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Employees (Global)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.firstName} {emp.lastName || ''} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid (List + Mobile Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules Table / List (7-9 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 2xl:col-span-9 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm font-medium">Loading shift guidelines...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-rose-500 bg-rose-50/50">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">{error}</p>
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">No shift guidelines found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "New Guideline" to add rules for employees.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRules.map((rule) => {
                  const branchName =
                    !rule.branchId || rule.branchId === 'ALL'
                      ? 'All Branches (Global)'
                      : officeMap.get(rule.branchId) || `Branch #${rule.branchId}`;

                  const employeeName =
                    !rule.employeeId || rule.employeeId === 'ALL'
                      ? 'All Employees (Global)'
                      : employeeMap.get(rule.employeeId) || `Employee #${rule.employeeId}`;

                  return (
                    <div
                      key={rule.id}
                      className={`p-5 transition-colors ${
                        previewOpenRuleId === rule.id ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">{rule.title}</h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                rule.isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {rule.priority > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                P-{rule.priority}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {rule.content}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              Shift: {rule.shiftType || 'ALL SHIFTS'}
                            </span>

                            <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                              Branch: {branchName}
                            </span>

                            <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                              <User className="w-3.5 h-3.5 text-violet-500" />
                              Target: {employeeName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setPreviewOpenRuleId(rule.id)}
                            title="Preview Mobile Card"
                            className={`p-2 rounded-lg transition-colors ${
                              previewOpenRuleId === rule.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                            }`}
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(rule)}
                            title="Edit Guideline"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleActive(rule)}
                            title={rule.isActive ? 'Deactivate' : 'Activate'}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            {rule.isActive ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          <button
                            onClick={() => requestDelete(rule)}
                            title="Delete Guideline"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Preview Sidebar (3-5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 2xl:col-span-3 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Mobile View Preview</h2>
            </div>

            {previewOpenRuleId && rules.find((r) => r.id === previewOpenRuleId) ? (
              (() => {
                const previewRule = rules.find((r) => r.id === previewOpenRuleId)!;
                const branchName =
                  !previewRule.branchId || previewRule.branchId === 'ALL'
                    ? 'All Branches'
                    : officeMap.get(previewRule.branchId) || `Branch #${previewRule.branchId}`;

                const empName =
                  !previewRule.employeeId || previewRule.employeeId === 'ALL'
                    ? 'All Employees'
                    : employeeMap.get(previewRule.employeeId) || `Employee #${previewRule.employeeId}`;

                return (
                  <div className="mx-auto w-[280px] bg-slate-950 p-4 rounded-[36px] shadow-2xl border-4 border-slate-800 text-white space-y-4">
                    {/* Speaker Notch */}
                    <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />

                    {/* App Header Bar */}
                    <div className="pt-2 border-b border-slate-800/80 pb-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-tight text-slate-300">
                        Shift Guidelines
                      </span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                        LIVE
                      </span>
                    </div>

                    {/* Guideline Mobile Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                          {previewRule.shiftType || 'ALL SHIFTS'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold bg-slate-800 px-1.5 py-0.5 rounded">
                          {branchName}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-white leading-tight">
                        {previewRule.title}
                      </h4>

                      <p className="text-[11px] text-slate-300 leading-normal font-normal">
                        {previewRule.content}
                      </p>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400">
                        <span>Target: {empName}</span>
                        <span>Priority #{previewRule.priority}</span>
                      </div>
                    </div>

                    {/* Mobile Home indicator */}
                    <div className="w-20 h-1 bg-slate-700 rounded-full mx-auto pt-1" />
                  </div>
                );
              })()
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a guideline to preview mobile appearance.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRule}
            className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900">
              {editingRule ? 'Edit Shift Guideline' : 'New Shift Guideline'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Morning Shift Punctuality Policy"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Content / Details *
              </label>
              <textarea
                rows={4}
                required
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Enter complete guidelines and policy details..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Shift
                </label>
                <select
                  value={formShiftType}
                  onChange={(e) => setFormShiftType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">ALL SHIFTS (Global)</option>
                  <option value="MORNING">MORNING</option>
                  <option value="AFTERNOON">AFTERNOON</option>
                  <option value="EVENING">EVENING</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Branch
                </label>
                <select
                  value={formBranchId}
                  onChange={(e) => setFormBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">ALL BRANCHES (Global)</option>
                  {offices.map((office) => (
                    <option key={office.id} value={String(office.id)}>
                      {office.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Employee
                </label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">ALL EMPLOYEES (Global)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={String(emp.id)}>
                      {emp.firstName} {emp.lastName || ''} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Priority
                </label>
                <input
                  type="number"
                  value={formPriority}
                  onChange={(e) => setFormPriority(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Active (Visible to employees)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
              >
                {submitting ? 'Saving...' : 'Save Guideline'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-5">
            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 bg-rose-50 rounded-2xl mx-auto">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>

            {/* Title */}
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Delete Guideline?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-slate-800">&quot;{deleteTitle}&quot;</span>?
                <br />
                <span className="text-rose-500 font-medium">This action cannot be undone.</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteTitle('');
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-70"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
