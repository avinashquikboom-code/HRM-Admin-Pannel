"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  workingDays: string[];
  graceMinutes: number;
  breakMinutes: number;
  color: string;
  createdAt: string;
  assignments: any[];
}

const ShiftManagementPage = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    graceMinutes: 15,
    breakMinutes: 60,
    color: '#3BA38B'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/admin/shifts');
      const data = await response.json();
      if (data.success) {
        setShifts(data.shifts);
      }
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleCreateShift = async () => {
    try {
      const response = await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        fetchShifts();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create shift:', error);
    }
  };

  const handleUpdateShift = async () => {
    if (!editingShift) return;
    try {
      const response = await fetch(`/api/admin/shifts/${editingShift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        fetchShifts();
        setIsModalOpen(false);
        setEditingShift(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update shift:', error);
    }
  };

  const handleDeleteShift = (shift: Shift) => {
    setShiftToDelete(shift);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteShift = async () => {
    if (!shiftToDelete) return;
    try {
      const response = await fetch(`/api/admin/shifts/${shiftToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchShifts();
        toast.success('Shift deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete shift:', error);
      toast.error('Failed to delete shift');
    } finally {
      setDeleteConfirmOpen(false);
      setShiftToDelete(null);
    }
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      workingDays: shift.workingDays,
      graceMinutes: shift.graceMinutes,
      breakMinutes: shift.breakMinutes,
      color: shift.color
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '18:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      graceMinutes: 15,
      breakMinutes: 60,
      color: '#3BA38B'
    });
    setEditingShift(null);
  };

  const toggleWorkingDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-8 pb-10">
      <SuperAdminHeader
        title="Shift Management"
        subtitle="Create and manage work shifts for employees."
        badgeText="Shift Configuration"
        badgeIcon={Clock}
        stats={[
          { label: 'Total Shifts', value: shifts.length.toString(), icon: Clock },
          { label: 'Active Assignments', value: shifts.reduce((acc, s) => acc + s.assignments.length, 0).toString(), icon: Users },
        ]}
      >
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="btn-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 px-6 py-4 shrink-0 rounded-sm text-xs font-black uppercase tracking-wider justify-center"
        >
          <Plus size={18} />
          Create Shift
        </button>
      </SuperAdminHeader>

      {isLoading ? (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 text-center">
          <div className="text-sm text-slate-400">Loading shifts...</div>
        </div>
      ) : shifts.length === 0 ? (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-12 text-center">
          <Clock size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-sm text-slate-400 font-semibold">No shifts created yet</p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="mt-4 btn-primary px-6 py-3 rounded-sm text-xs font-bold"
          >
            Create First Shift
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shifts.map((shift) => (
            <motion.div
              key={shift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${shift.color}20`, border: `1px solid ${shift.color}40` }}
                    >
                      <Clock size={24} style={{ color: shift.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{shift.name}</h3>
                      <p className="text-xs text-slate-400">{shift.assignments.length} employees assigned</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditShift(shift)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift)}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-slate-500" />
                    <span className="text-slate-300">{shift.startTime} - {shift.endTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-slate-300">{shift.workingDays.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/5">
                    <span>Grace: {shift.graceMinutes}m</span>
                    <span>Break: {shift.breakMinutes}m</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h3 className="text-lg font-bold text-white">
                    {editingShift ? 'Edit Shift' : 'Create Shift'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Shift Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Morning Shift"
                      className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg outline-none focus:border-primary/50 transition-colors text-sm text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg outline-none focus:border-primary/50 transition-colors text-sm text-white cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg outline-none focus:border-primary/50 transition-colors text-sm text-white cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Working Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWorkingDay(day)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                            formData.workingDays.includes(day)
                              ? "bg-primary text-white"
                              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          )}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Grace Minutes
                      </label>
                      <input
                        type="number"
                        value={formData.graceMinutes}
                        onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg outline-none focus:border-primary/50 transition-colors text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Break Minutes
                      </label>
                      <input
                        type="number"
                        value={formData.breakMinutes}
                        onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg outline-none focus:border-primary/50 transition-colors text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {['#3BA38B', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={cn(
                            "w-8 h-8 rounded-lg transition-all",
                            formData.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : ""
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={editingShift ? handleUpdateShift : handleCreateShift}
                      disabled={!formData.name}
                      className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingShift ? 'Update Shift' : 'Create Shift'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteShift}
        title="Delete Shift"
        message={shiftToDelete ? `Are you sure you want to delete "${shiftToDelete.name}"? This action cannot be undone.` : 'Are you sure you want to delete this shift? This action cannot be undone.'}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ShiftManagementPage;
