'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import { createOffice, type CreateOfficeRequest } from '@/services/officeService';
import { getAuthToken } from '@/lib/authStorage';
import { cn } from '@/utils/cn';

interface CreateOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (officeId: string, message: string) => void;
}

const defaultForm: CreateOfficeRequest = {
  name: '',
  code: '',
  address: '',
  latitude: 0,
  longitude: 0,
  idealRadiusMeters: 25,
  maxPunchRadiusMeters: 50,
  isActive: true,
};

export default function CreateOfficeModal({
  isOpen,
  onClose,
  onCreated,
}: CreateOfficeModalProps) {
  const [form, setForm] = useState<CreateOfficeRequest>(defaultForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setForm(defaultForm);
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!getAuthToken()) {
      setError('Admin token not found. Sign in first so hrm_token cookie is set.');
      return;
    }

    if (!form.latitude || !form.longitude) {
      setError('Valid latitude and longitude are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOffice(form);
      onCreated(result.office.id, result.message);
      setForm(defaultForm);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create office.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof CreateOfficeRequest>(
    key: K,
    value: CreateOfficeRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Provision New Office">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-border bg-surface-variant/40 px-4 py-3 text-xs font-mono text-text-secondary space-y-1">
          <p>
            <span className="font-bold text-primary">POST</span>{' '}
            /api/admin/offices
          </p>
          <p>
            {'{ name, code, address, latitude, longitude, idealRadiusMeters, maxPunchRadiusMeters }'}
          </p>
          <p>Authorization: Bearer &lt;token-from-hrm_token-cookie&gt;</p>
        </div>

        {error && (
          <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Office Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              placeholder="Pune Branch"
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Office Code
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
              placeholder="PUN-BR"
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
            Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            required
            placeholder="Hinjewadi, Pune"
            className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={form.latitude || ''}
              onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)}
              required
              placeholder="18.5912"
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={form.longitude || ''}
              onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)}
              required
              placeholder="73.7389"
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Ideal Radius (m)
            </label>
            <input
              type="number"
              min={1}
              value={form.idealRadiusMeters}
              onChange={(e) =>
                updateField('idealRadiusMeters', parseInt(e.target.value, 10) || 0)
              }
              required
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Max Punch Radius (m)
            </label>
            <input
              type="number"
              min={1}
              value={form.maxPunchRadiusMeters}
              onChange={(e) =>
                updateField('maxPunchRadiusMeters', parseInt(e.target.value, 10) || 0)
              }
              required
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer ml-1">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField('isActive', e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-text-secondary">Mark office as active</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-2xl border border-border text-text-secondary font-bold uppercase tracking-widest text-xs disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex-[2] py-3 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs',
              'shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-70',
              'flex items-center justify-center gap-2'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Office
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
