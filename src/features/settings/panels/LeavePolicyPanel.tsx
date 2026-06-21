'use client';

import { useState } from 'react';
import { Users, Calendar, Shield, Plus, X, Save } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LeaveType {
  id: string;
  name: string;
  code: string;
  daysPerYear: number;
  maxConsecutiveDays: number;
  requiresApproval: boolean;
  paid: boolean;
}

interface LeavePolicyPanelProps {
  leaveTypes?: LeaveType[];
  onLeaveTypesChange?: (types: LeaveType[]) => void;
  
  // Backwards compatibility fallbacks
  casualLeavePerYear?: number;
  sickLeavePerYear?: number;
  earnedLeavePerYear?: number;
  requireApproval: boolean;
  maxConsecutiveDays: number;
  onCasualLeaveChange?: (value: number) => void;
  onSickLeaveChange?: (value: number) => void;
  onEarnedLeaveChange?: (value: number) => void;
  onRequireApprovalChange: (value: boolean) => void;
  onMaxConsecutiveDaysChange: (value: number) => void;
}

export default function LeavePolicyPanel({
  leaveTypes,
  onLeaveTypesChange,
  casualLeavePerYear,
  sickLeavePerYear,
  earnedLeavePerYear,
  requireApproval,
  maxConsecutiveDays,
  onCasualLeaveChange,
  onSickLeaveChange,
  onEarnedLeaveChange,
  onRequireApprovalChange,
  onMaxConsecutiveDaysChange,
}: LeavePolicyPanelProps) {
  const defaultLeaveTypes = [
    { id: '1', name: 'Casual Leave', code: 'CL', daysPerYear: casualLeavePerYear || 12, maxConsecutiveDays: 3, requiresApproval: true, paid: true },
    { id: '2', name: 'Sick Leave', code: 'SL', daysPerYear: sickLeavePerYear || 10, maxConsecutiveDays: 5, requiresApproval: true, paid: true },
    { id: '3', name: 'Earned Leave', code: 'EL', daysPerYear: earnedLeavePerYear || 15, maxConsecutiveDays: 10, requiresApproval: true, paid: true },
    { id: '4', name: 'Maternity Leave', code: 'ML', daysPerYear: 90, maxConsecutiveDays: 90, requiresApproval: true, paid: true },
    { id: '5', name: 'Paternity Leave', code: 'PL', daysPerYear: 10, maxConsecutiveDays: 10, requiresApproval: true, paid: true },
    { id: '6', name: 'Work From Home', code: 'WFH', daysPerYear: 24, maxConsecutiveDays: 5, requiresApproval: true, paid: true }
  ];

  const currentLeaveTypes = leaveTypes || defaultLeaveTypes;
  const [selectedTypeId, setSelectedTypeId] = useState<string>(currentLeaveTypes[0]?.id || '1');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState({
    name: '',
    daysPerYear: 0,
    maxConsecutiveDays: 5,
    requiresApproval: true,
    paid: true,
  });

  const selectedLeaveType = currentLeaveTypes.find(lt => lt.id === selectedTypeId) || currentLeaveTypes[0];

  const handleUpdateLeaveType = (id: string, updates: Partial<LeaveType>) => {
    const updated = currentLeaveTypes.map(lt => {
      if (lt.id === id) {
        const newLt = { ...lt, ...updates };
        // Sync back with individual callbacks if present
        if (newLt.code === 'CL' && onCasualLeaveChange && updates.daysPerYear !== undefined) {
          onCasualLeaveChange(updates.daysPerYear);
        } else if (newLt.code === 'SL' && onSickLeaveChange && updates.daysPerYear !== undefined) {
          onSickLeaveChange(updates.daysPerYear);
        } else if (newLt.code === 'EL' && onEarnedLeaveChange && updates.daysPerYear !== undefined) {
          onEarnedLeaveChange(updates.daysPerYear);
        }
        return newLt;
      }
      return lt;
    });

    if (onLeaveTypesChange) {
      onLeaveTypesChange(updated);
    }
  };

  const handleAddLeaveType = () => {
    if (!newLeaveType.name || newLeaveType.daysPerYear <= 0) return;
    
    const code = newLeaveType.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) || 'LT';
    const newType: LeaveType = {
      id: Date.now().toString(),
      code,
      name: newLeaveType.name,
      daysPerYear: newLeaveType.daysPerYear,
      maxConsecutiveDays: newLeaveType.maxConsecutiveDays,
      requiresApproval: newLeaveType.requiresApproval,
      paid: newLeaveType.paid,
    };
    
    const updated = [...currentLeaveTypes, newType];
    if (onLeaveTypesChange) {
      onLeaveTypesChange(updated);
    }
    
    setNewLeaveType({
      name: '',
      daysPerYear: 0,
      maxConsecutiveDays: 5,
      requiresApproval: true,
      paid: true,
    });
    setShowAddForm(false);
  };

  const handleRemoveLeaveType = (id: string) => {
    const updated = currentLeaveTypes.filter(lt => lt.id !== id);
    if (onLeaveTypesChange) {
      onLeaveTypesChange(updated);
    }
    if (selectedTypeId === id) {
      setSelectedTypeId(updated[0]?.id || '1');
    }
  };

  const isStandardType = (id: string) => ['1', '2', '3', '4', '5', '6'].includes(id);

  return (
    <div className="space-y-6 text-text-primary">
      {/* Configure Leave Types Dropdown and Form */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Configure Leave Types</h3>
            <p className="text-sm text-text-secondary">Select a leave category to customize its policy limits</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Select Leave Type
            </label>
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            >
              {currentLeaveTypes.map(lt => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.code})
                </option>
              ))}
            </select>
          </div>

          {selectedLeaveType && (
            <div className="p-4 bg-surface-variant/30 rounded-sm border border-border/60 space-y-6">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Policy for {selectedLeaveType.name}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                    Days Allowed Per Year
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={selectedLeaveType.daysPerYear}
                    onChange={(e) => handleUpdateLeaveType(selectedLeaveType.id, { daysPerYear: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                    Maximum Consecutive Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={selectedLeaveType.maxConsecutiveDays}
                    onChange={(e) => handleUpdateLeaveType(selectedLeaveType.id, { maxConsecutiveDays: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-sm border border-border">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Requires Approval</p>
                    <p className="text-xs text-text-secondary mt-1">Leaves of this type require manager approval</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateLeaveType(selectedLeaveType.id, { requiresApproval: !selectedLeaveType.requiresApproval })}
                    className={cn(
                      'w-12 h-6 rounded-sm transition-all relative',
                      selectedLeaveType.requiresApproval ? 'bg-primary' : 'bg-surface-variant border border-border'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-sm transition-all',
                        selectedLeaveType.requiresApproval ? 'left-7 bg-white' : 'left-1 bg-text-secondary'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-sm border border-border">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Paid Leave</p>
                    <p className="text-xs text-text-secondary mt-1">Whether the employee gets paid during this leave</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateLeaveType(selectedLeaveType.id, { paid: !selectedLeaveType.paid })}
                    className={cn(
                      'w-12 h-6 rounded-sm transition-all relative',
                      selectedLeaveType.paid ? 'bg-primary' : 'bg-surface-variant border border-border'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-sm transition-all',
                        selectedLeaveType.paid ? 'left-7 bg-white' : 'left-1 bg-text-secondary'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leave Rules (Global Settings) */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Global Leave Rules</h3>
            <p className="text-sm text-text-secondary">Configure default restrictions and approval settings</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Global Maximum Consecutive Days
            </label>
            <input
              type="number"
              min={1}
              value={maxConsecutiveDays}
              onChange={(e) => onMaxConsecutiveDaysChange(parseInt(e.target.value, 10) || 1)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
            <p className="text-xs text-text-secondary mt-1">Fallback limit of consecutive days allowed for leave</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-sm border border-border">
            <div>
              <p className="text-sm font-bold text-text-primary">Global Require Approval</p>
              <p className="text-xs text-text-secondary mt-1">All leave requests require manager approval by default</p>
            </div>
            <button
              type="button"
              onClick={() => onRequireApprovalChange(!requireApproval)}
              className={cn(
                'w-12 h-6 rounded-sm transition-all relative',
                requireApproval ? 'bg-primary' : 'bg-surface-variant border border-border'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-sm transition-all',
                  requireApproval ? 'left-7 bg-white' : 'left-1 bg-text-secondary'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* List of All Leave Policies and Custom Add Form */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">All Leave Policies ({currentLeaveTypes.length})</h3>
              <p className="text-sm text-text-secondary">Overview of all active leave categories</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Plus size={14} />
            Add Custom Type
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-surface-variant/50 rounded-sm border border-border space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                Leave Type Name
              </label>
              <input
                type="text"
                value={newLeaveType.name}
                onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                placeholder="e.g., Casual Leave, Maternity Leave"
                className="w-full px-4 py-3 bg-surface rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                  Days Per Year
                </label>
                <input
                  type="number"
                  min={0}
                  value={newLeaveType.daysPerYear}
                  onChange={(e) => setNewLeaveType({ ...newLeaveType, daysPerYear: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-4 py-3 bg-surface rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                  Max Consecutive Days
                </label>
                <input
                  type="number"
                  min={1}
                  value={newLeaveType.maxConsecutiveDays}
                  onChange={(e) => setNewLeaveType({ ...newLeaveType, maxConsecutiveDays: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-4 py-3 bg-surface rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newLeaveType.requiresApproval}
                  onChange={(e) => setNewLeaveType({ ...newLeaveType, requiresApproval: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-bold text-text-primary">Requires Approval</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newLeaveType.paid}
                  onChange={(e) => setNewLeaveType({ ...newLeaveType, paid: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-bold text-text-primary">Paid Leave</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddLeaveType}
                className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Save size={14} />
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-surface-variant border border-border rounded-sm text-xs font-bold uppercase tracking-wider text-text-secondary hover:border-primary/30"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {currentLeaveTypes.map((leaveType) => (
            <div
              key={leaveType.id}
              className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-sm border border-border group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary">{leaveType.name}</p>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold">
                      {leaveType.code}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {leaveType.daysPerYear} days/year • Max {leaveType.maxConsecutiveDays} consecutive
                  </p>
                </div>
                <div className="flex gap-2">
                  {leaveType.requiresApproval && (
                    <span className="px-2 py-1 bg-warning/10 text-warning border border-warning/20 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                      Approval Required
                    </span>
                  )}
                  {leaveType.paid ? (
                    <span className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                      Paid
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-muted/10 text-muted border border-muted/20 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                      Unpaid
                    </span>
                  )}
                </div>
              </div>
              {!isStandardType(leaveType.id) && (
                <button
                  type="button"
                  onClick={() => handleRemoveLeaveType(leaveType.id)}
                  className="p-2 text-muted hover:text-error transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
