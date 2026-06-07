'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from '@/components/Modal';
import {
  updateOffice,
  type UpdateOfficeRequest,
  type Office,
} from '@/services/officeService';
import { getAuthToken } from '@/lib/authStorage';
import { cn } from '@/utils/cn';

interface EditOfficeModalProps {
  isOpen: boolean;
  office: Office | null;
  onClose: () => void;
  onUpdated: (officeId: string, message: string) => void;
}

function officeToForm(office: Office): UpdateOfficeRequest {
  return {
    name: office.name,
    code: office.code ?? '',
    address: office.address,
    latitude: office.latitude,
    longitude: office.longitude,
    idealRadiusMeters: office.idealRadiusMeters,
    maxPunchRadiusMeters: 25,
    isActive: office.isActive,
  };
}

export default function EditOfficeModal({
  isOpen,
  office,
  onClose,
  onUpdated,
}: EditOfficeModalProps) {
  const [form, setForm] = useState<UpdateOfficeRequest | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && office) {
      setForm(officeToForm(office));
      setError('');
    }
  }, [isOpen, office]);

  const handleClose = () => {
    if (isSubmitting) return;
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!office || !form) return;

    if (!getAuthToken()) {
      setError('Please sign in again.');
      return;
    }

    if (!form.latitude || !form.longitude) {
      setError('Valid latitude and longitude are required.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await updateOffice(office.id, form);
      onUpdated(result.office.id, result.message);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update office.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof UpdateOfficeRequest>(
    key: K,
    value: UpdateOfficeRequest[K]
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (!form) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Office">
      <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Office Code
            </label>
            <input
              type="text"
              value={form.code ?? ''}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
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
              value={form.latitude}
              onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)}
              required
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
              value={form.longitude}
              onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)}
              required
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>
        </div>

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
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Update Office
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
