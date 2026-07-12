'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, MapPin, Building2 } from 'lucide-react';
import Modal from '@/components/Modal';
import {
  updateOffice,
  type UpdateOfficeRequest,
  type Office,
} from '@/services/officeService';
import { getAuthToken } from '@/lib/authStorage';
import { cn } from '@/utils/cn';
import { useGeolocation } from '@/hooks/useGeolocation';

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
    maxPunchRadiusMeters: office.maxPunchRadiusMeters || 25,
    isActive: office.isActive,
    officeType: office.officeType || 'STORE',
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
  const { getPosition, status: geoStatus } = useGeolocation();

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

  const handleGetCurrentLocation = () => {
    getPosition(async (coords) => {
      setForm((prev) => prev ? {
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      } : prev);

      // Reverse geocoding to get address
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await res.json();
        if (data && data.display_name) {
          setForm((prev) => prev ? {
            ...prev,
            address: data.display_name,
          } : prev);
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
      }
    });
  };

  if (!form) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Office">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-sm bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
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
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
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
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
            Office Type
          </label>
          <select
            value={form.officeType}
            onChange={(e) => updateField('officeType', e.target.value)}
            className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
          >
            <option value="STORE">Store Branch</option>
            <option value="HEAD_OFFICE">Head Office</option>
          </select>
          <p className="text-xs text-text-secondary ml-1">
            <strong>Store Branch:</strong> Physical retail locations where employees work<br/>
            <strong>Head Office:</strong> Main corporate headquarters location
          </p>
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
            className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
              <MapPin size={12} />
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)}
              required
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
              <MapPin size={12} />
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)}
              required
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={geoStatus === 'loading'}
          className="w-full py-2.5 rounded-sm border border-primary/35 bg-primary/5 text-primary font-bold uppercase tracking-wider text-xs hover:bg-primary/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {geoStatus === 'loading' ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin size={14} />
              Get Current Location
            </>
          )}
        </button>

        <div className="space-y-2">
          <label className="text-xs font-black text-muted uppercase tracking-widest ml-1 flex justify-between">
            <span>Max Punch Radius (Meters)</span>
            <span className="text-primary font-black">{form.maxPunchRadiusMeters || 50}m</span>
          </label>
          <input
            type="range"
            min="10"
            max="500"
            step="5"
            value={form.maxPunchRadiusMeters || 50}
            onChange={(e) => updateField('maxPunchRadiusMeters', parseInt(e.target.value))}
            className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
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
            className="flex-1 py-3 rounded-sm border border-border text-text-secondary font-bold uppercase tracking-widest text-xs disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex-[2] py-3 rounded-sm bg-primary text-white font-bold uppercase tracking-widest text-xs',
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
