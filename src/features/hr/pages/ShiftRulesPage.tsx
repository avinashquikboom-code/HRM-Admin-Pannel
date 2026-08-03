'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  fetchHrShiftRules,
  createHrShiftRule,
  updateHrShiftRule,
  deleteHrShiftRule,
  ShiftRuleRecord,
} from '@/services/shiftRuleService';

export default function ShiftRulesPage() {
  const [rules, setRules] = useState<ShiftRuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ShiftRuleRecord | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formShiftType, setFormShiftType] = useState('ALL');
  const [formBranchId, setFormBranchId] = useState('ALL');
  const [formPriority, setFormPriority] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  // Mobile Preview State
  const [previewOpenRuleId, setPreviewOpenRuleId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHrShiftRules({ shiftType: shiftFilter });
      setRules(data);
      if (data.length > 0 && !previewOpenRuleId) {
        setPreviewOpenRuleId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load shift rules:', err);
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
          priority: formPriority,
          isActive: formIsActive,
        });
      } else {
        await createHrShiftRule({
          title: formTitle.trim(),
          content: formContent.trim(),
          shiftType: formShiftType,
          branchId: formBranchId,
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate/delete this guideline?')) return;
    try {
      await deleteHrShiftRule(id);
      await loadData();
    } catch (err: any) {
      alert(`Failed to delete rule: ${err.message}`);
    }
  };

  const filteredRules = useMemo(() => {
    if (!searchTerm.trim()) return rules;
    const term = searchTerm.toLowerCase();
    return rules.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.content.toLowerCase().includes(term) ||
        (r.shiftType || '').toLowerCase().includes(term)
    );
  }, [rules, searchTerm]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Shift Rules & Guidelines</h1>
            <p className="text-slate-500 text-sm">
              Define operational policies, shift rules, and conduct guidelines for employees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
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

      {/* Main Grid (List + Mobile Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Table / List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shift Filter:</span>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Shifts</option>
                <option value="MORNING">Morning Shift</option>
                <option value="AFTERNOON">Afternoon Shift</option>
                <option value="EVENING">Evening Shift</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Cards / Table */}
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
                {filteredRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-5 hover:bg-slate-50/70 transition-colors ${
                      previewOpenRuleId === rule.id ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base">{rule.title}</h3>

                          {/* Shift Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              !rule.shiftType || rule.shiftType === 'ALL'
                                ? 'bg-indigo-100 text-indigo-800'
                                : rule.shiftType === 'MORNING'
                                ? 'bg-amber-100 text-amber-800'
                                : rule.shiftType === 'AFTERNOON'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {rule.shiftType || 'ALL SHIFTS'}
                          </span>

                          {/* Branch Badge */}
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {rule.branchId ? `Branch #${rule.branchId}` : 'ALL BRANCHES'}
                          </span>

                          {/* Active Status */}
                          <button
                            onClick={() => handleToggleActive(rule)}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                              rule.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {rule.isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Inactive
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-slate-600 text-sm whitespace-pre-line line-clamp-3">
                          {rule.content}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <span>Priority: {rule.priority}</span>
                          <span>Updated: {new Date(rule.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewOpenRuleId(rule.id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Preview in Mobile View"
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(rule)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                          title="Edit Guideline"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Deactivate Guideline"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Preview Column (1 Col) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border-4 border-slate-800 space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mobile Preview (Employee)
                </span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                iOS / Android
              </span>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 space-y-3 min-h-[380px] max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Shift Guidelines
                </h4>
                <span className="text-[10px] text-slate-400">Pull to refresh</span>
              </div>

              {filteredRules.filter((r) => r.isActive).length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active guidelines visible to employee
                </div>
              ) : (
                filteredRules
                  .filter((r) => r.isActive)
                  .map((rule) => {
                    const isExpanded = previewOpenRuleId === rule.id;
                    const isNew =
                      new Date().getTime() - new Date(rule.updatedAt).getTime() <
                      7 * 24 * 3600 * 1000;

                    return (
                      <div
                        key={rule.id}
                        onClick={() => setPreviewOpenRuleId(isExpanded ? null : rule.id)}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">{rule.title}</span>
                            {isNew && (
                              <span className="bg-emerald-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.2 rounded-full uppercase flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> NEW
                              </span>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-2">
                            <p className="whitespace-pre-line leading-relaxed">{rule.content}</p>
                            <div className="text-[10px] text-slate-500 pt-1">
                              Target: {rule.shiftType || 'All Shifts'} • Last updated:{' '}
                              {new Date(rule.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
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
                rows={5}
                required
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Enter complete guidelines and policy details..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  <option value="1">Main Office</option>
                  <option value="2">Adajan Branch</option>
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
    </div>
  );
}
