import { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, X, Save, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  fetchAdminHolidays,
  createAdminHoliday,
  deleteAdminHoliday,
  type Holiday
} from '@/services/settingsService';

export default function HolidaysPanel() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    type: 'mandatory' as Holiday['type'],
    recurring: true,
  });

  const loadHolidays = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAdminHolidays();
      setHolidays(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load holidays.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    
    setIsSaving(true);
    setError('');
    try {
      const savedHoliday = await createAdminHoliday({
        name: newHoliday.name,
        date: newHoliday.date,
        type: newHoliday.type,
        recurring: newHoliday.recurring
      });
      
      setHolidays([...holidays, savedHoliday]);
      setNewHoliday({
        name: '',
        date: '',
        type: 'mandatory',
        recurring: true,
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save holiday.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveHoliday = async (id: string) => {
    setError('');
    try {
      await deleteAdminHoliday(id);
      setHolidays(holidays.filter(h => h.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete holiday.');
    }
  };

  const getHolidayForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr);
  };

  const isWeekend = (day: number) => {
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw size={24} className="animate-spin text-primary mb-2" />
        <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Loading holidays...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-error/10 border border-error/20 rounded-sm text-error text-xs font-black uppercase tracking-wider">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {/* Calendar View */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Holiday Calendar</h3>
              <p className="text-sm text-text-secondary">View and manage company holidays</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Plus size={14} />
            Add Holiday
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 bg-surface-variant hover:bg-surface border border-border rounded-sm transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h4 className="text-xl font-bold text-text-primary">
            {monthNames[currentMonth]} {currentYear}
          </h4>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 bg-surface-variant hover:bg-surface border border-border rounded-sm transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center py-2 text-xs font-black text-muted uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const holiday = getHolidayForDate(day);
            const weekend = isWeekend(day);
            
            return (
              <div
                key={day}
                className={cn(
                  'h-12 flex flex-col items-center justify-center rounded-sm text-sm font-bold transition-all cursor-pointer relative',
                  weekend && 'bg-surface-variant/30 text-text-secondary',
                  holiday && 'bg-primary/20 text-primary border border-primary/30',
                  !weekend && !holiday && 'hover:bg-surface-variant/50'
                )}
              >
                <span>{day}</span>
                {holiday && (
                  <span className="text-[10px] font-black uppercase tracking-wider mt-0.5 truncate w-full text-center px-1">
                    {holiday.name.slice(0, 6)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/20 border border-primary/30 rounded-sm" />
            <span className="text-xs font-bold text-text-secondary">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-surface-variant/30 rounded-sm" />
            <span className="text-xs font-bold text-text-secondary">Weekend</span>
          </div>
        </div>
      </div>

      {/* Add Holiday Form */}
      {showAddForm && (
        <div className="glass-card p-6">
          <h4 className="text-lg font-bold text-text-primary mb-4">Add New Holiday</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                Holiday Name
              </label>
              <input
                type="text"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="e.g., Diwali"
                className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                Date
              </label>
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                Holiday Type
              </label>
              <select
                value={newHoliday.type}
                onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value as Holiday['type'] })}
                className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
              >
                <option value="mandatory">Mandatory</option>
                <option value="optional">Optional</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newHoliday.recurring}
                onChange={(e) => setNewHoliday({ ...newHoliday, recurring: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-bold text-text-primary">Recurring Holiday (repeats every year)</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddHoliday}
                className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Save size={14} />
                Save Holiday
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
        </div>
      )}

      {/* Holiday List */}
      <div className="glass-card p-6">
        <h4 className="text-lg font-bold text-text-primary mb-4">All Holidays ({currentYear})</h4>
        <div className="space-y-3">
          {holidays
            .filter(h => {
              const year = parseInt(h.date.split('-')[0], 10);
              return year === currentYear || h.recurring;
            })
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((holiday) => {
              const [_, month, day] = holiday.date.split('-').map(Number);
              const displayDate = holiday.recurring 
                ? `${day}/${month} (Recurring)`
                : holiday.date;

              return (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-sm border border-border group hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-sm flex items-center justify-center font-bold text-lg">
                      {day}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{holiday.name}</p>
                      <p className="text-xs text-text-secondary mt-1">{displayDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider',
                      holiday.type === 'mandatory' && 'bg-error/10 text-error border border-error/20',
                      holiday.type === 'optional' && 'bg-warning/10 text-warning border border-warning/20',
                      holiday.type === 'restricted' && 'bg-primary/10 text-primary border border-primary/20'
                    )}>
                      {holiday.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHoliday(holiday.id)}
                      className="p-2 text-muted hover:text-error transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
