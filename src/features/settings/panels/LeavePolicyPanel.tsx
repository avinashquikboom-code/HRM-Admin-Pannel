'use client';

import { useState } from 'react';
import { Users, Calendar, Shield, Plus, X, Save } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LeaveType {
  id: string;
  name: string;
  daysPerYear: number;
  maxConsecutiveDays: number;
  requiresApproval: boolean;
  paid: boolean;
}

interface LeavePolicyPanelProps {
  casualLeavePerYear: number;
  sickLeavePerYear: number;
  earnedLeavePerYear: number;
  requireApproval: boolean;
  maxConsecutiveDays: number;
  onCasualLeaveChange: (value: number) => void;
  onSickLeaveChange: (value: number) => void;
  onEarnedLeaveChange: (value: number) => void;
  onRequireApprovalChange: (value: boolean) => void;
  onMaxConsecutiveDaysChange: (value: number) => void;
}

export default function LeavePolicyPanel({
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
  const [customLeaveTypes, setCustomLeaveTypes] = useState<LeaveType[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState({
    name: '',
    daysPerYear: 0,
    maxConsecutiveDays: 5,
    requiresApproval: true,
    paid: true,
  });

  const handleAddLeaveType = () => {
    if (!newLeaveType.name || newLeaveType.daysPerYear <= 0) return;
    
    const leaveType: LeaveType = {
      id: Date.now().toString(),
      ...newLeaveType,
    };
    
    setCustomLeaveTypes([...customLeaveTypes, leaveType]);
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
    setCustomLeaveTypes(customLeaveTypes.filter(lt => lt.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Standard Leave Types */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Standard Leave Types</h3>
            <p className="text-sm text-text-secondary">Configure leave limits for standard leave categories</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Casual Leave (days per year)
            </label>
            <input
              type="number"
              min={0}
              value={casualLeavePerYear}
              onChange={(e) => onCasualLeaveChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Sick Leave (days per year)
            </label>
            <input
              type="number"
              min={0}
              value={sickLeavePerYear}
              onChange={(e) => onSickLeaveChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Earned Leave (days per year)
            </label>
            <input
              type="number"
              min={0}
              value={earnedLeavePerYear}
              onChange={(e) => onEarnedLeaveChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>
        </div>
      </div>

      {/* Leave Rules */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Leave Rules</h3>
            <p className="text-sm text-text-secondary">Configure approval and consecutive day policies</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Maximum Consecutive Days
            </label>
            <input
              type="number"
              min={1}
              value={maxConsecutiveDays}
              onChange={(e) => onMaxConsecutiveDaysChange(parseInt(e.target.value, 10) || 1)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
            <p className="text-xs text-text-secondary mt-1">Maximum number of consecutive days allowed for leave</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-sm border border-border">
            <div>
              <p className="text-sm font-bold text-text-primary">Require Approval</p>
              <p className="text-xs text-text-secondary mt-1">All leave requests require manager approval</p>
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

      {/* Custom Leave Types */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Custom Leave Types</h3>
              <p className="text-sm text-text-secondary">Add custom leave categories for your organization</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Plus size={14} />
            Add Type
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
                placeholder="e.g., Maternity Leave"
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
          {customLeaveTypes.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">No custom leave types added yet</p>
          ) : (
            customLeaveTypes.map((leaveType) => (
              <div
                key={leaveType.id}
                className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-sm border border-border group hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-primary">{leaveType.name}</p>
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
                    {leaveType.paid && (
                      <span className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                        Paid
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLeaveType(leaveType.id)}
                  className="p-2 text-muted hover:text-error transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
