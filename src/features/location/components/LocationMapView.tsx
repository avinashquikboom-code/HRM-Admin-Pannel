'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { EmployeeLiveLocation } from '@/services/locationService';
import type { MapBounds, MapCenter } from '../types';

interface LocationMapViewProps {
  employees: EmployeeLiveLocation[];
  selectedEmpId: number | null;
  onSelectEmployee: (id: number | null) => void;
  officeCenter: MapCenter;
  mapBounds: MapBounds;
  geofenceRadius: number;
  officeName?: string;
  isLive: boolean;
}

function getMapCoords(
  lat: number,
  lng: number,
  mapBounds: MapBounds,
  size = 500
) {
  const xSpan = mapBounds.maxLng - mapBounds.minLng;
  const ySpan = mapBounds.maxLat - mapBounds.minLat;
  const x = ((lng - mapBounds.minLng) / xSpan) * size;
  const y = size - ((lat - mapBounds.minLat) / ySpan) * size;
  return { x, y };
}

function getPixelRadius(
  radiusDegrees: number,
  mapBounds: MapBounds,
  size = 500
) {
  const ySpan = mapBounds.maxLat - mapBounds.minLat;
  return (radiusDegrees / ySpan) * size;
}

function statusStyle(status: string) {
  if (status === 'Outside Geofence') {
    return { fill: '#f97316', ring: 'rgba(249, 115, 22, 0.25)' };
  }
  if (status === 'On Leave') {
    return { fill: '#94a3b8', ring: 'rgba(148, 163, 184, 0.25)' };
  }
  return { fill: '#10b981', ring: 'rgba(16, 185, 129, 0.25)' };
}

interface MapCanvasProps {
  employees: EmployeeLiveLocation[];
  selectedEmpId: number | null;
  onSelectEmployee: (id: number | null) => void;
  officeCenter: MapCenter;
  mapBounds: MapBounds;
  geofenceRadius: number;
  gradientId: string;
  className?: string;
  onExpand?: () => void;
  showExpandHint?: boolean;
}

function MapCanvas({
  employees,
  selectedEmpId,
  onSelectEmployee,
  officeCenter,
  mapBounds,
  geofenceRadius,
  gradientId,
  className,
  onExpand,
  showExpandHint,
}: MapCanvasProps) {
  const officeCoords = getMapCoords(
    officeCenter.lat,
    officeCenter.lng,
    mapBounds
  );
  const pixelRadius = getPixelRadius(geofenceRadius, mapBounds);

  return (
    <div
      className={cn(
        'relative w-full bg-gradient-to-br from-emerald-50/80 via-surface to-sky-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800',
        onExpand && 'cursor-pointer group/map',
        className
      )}
      onClick={onExpand}
      onKeyDown={(event) => {
        if (onExpand && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onExpand();
        }
      }}
      role={onExpand ? 'button' : undefined}
      tabIndex={onExpand ? 0 : undefined}
      aria-label={onExpand ? 'Expand map to full screen' : undefined}
    >
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(15,118,110,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {showExpandHint && onExpand && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-black/0 group-hover/map:bg-black/5 transition-colors pointer-events-none">
          <span className="opacity-0 group-hover/map:opacity-100 transition-opacity rounded-full bg-surface/95 border border-border px-4 py-2 text-xs font-semibold text-text-primary shadow-lg flex items-center gap-2">
            <Maximize2 size={14} />
            Click to expand
          </span>
        </div>
      )}

      <svg
        viewBox="0 0 500 500"
        className="relative z-[2] h-full w-full"
        onClick={(event) => event.stopPropagation()}
      >
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.12)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.02)" />
          </radialGradient>
        </defs>

        <circle
          cx={officeCoords.x}
          cy={officeCoords.y}
          r={pixelRadius}
          fill={`url(#${gradientId})`}
          stroke="rgba(16, 185, 129, 0.45)"
          strokeWidth="2"
          strokeDasharray="8 6"
        />

        <circle
          cx={officeCoords.x}
          cy={officeCoords.y}
          r="10"
          fill="#0d9488"
          stroke="#fff"
          strokeWidth="2"
        />
        <circle
          cx={officeCoords.x}
          cy={officeCoords.y}
          r="18"
          fill="none"
          stroke="rgba(13, 148, 136, 0.35)"
          strokeWidth="1.5"
        />

        {employees.map((emp) => {
          const { x, y } = getMapCoords(emp.lat, emp.lng, mapBounds);
          const isSelected = selectedEmpId === emp.employeeId;
          const style = statusStyle(emp.status);

          return (
            <motion.g
              key={emp.employeeId}
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                onSelectEmployee(emp.employeeId);
              }}
              whileHover={{ scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            >
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r="20"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}
              {emp.status !== 'On Leave' && (
                <circle cx={x} cy={y} r="14" fill={style.ring} />
              )}
              <circle
                cx={x}
                cy={y}
                r="7"
                fill={style.fill}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={x + 12}
                y={y + 4}
                fill="currentColor"
                className="text-[10px] font-semibold fill-text-primary pointer-events-none"
              >
                {emp.name.split(' ')[0]}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div
        className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs z-[3] p-3 rounded-xl bg-surface/90 backdrop-blur border border-border shadow-sm text-xs space-y-1 pointer-events-none"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-semibold text-text-primary flex items-center gap-1.5">
          <MapPin size={12} className="text-primary" />
          {officeCenter.lat.toFixed(4)}, {officeCenter.lng.toFixed(4)}
        </p>
        <p className="text-text-secondary">
          Tap a marker for details · expand for full view
        </p>
      </div>

      <div
        className="absolute top-3 right-3 z-[3] p-3 rounded-xl bg-surface/90 backdrop-blur border border-border shadow-sm space-y-1.5 text-[10px] font-semibold pointer-events-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          In office
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          Outside geofence
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          On leave
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          Office center
        </div>
      </div>

      {onExpand && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onExpand();
          }}
          className="absolute top-3 left-3 z-[4] inline-flex items-center gap-1.5 rounded-xl bg-surface/95 border border-border px-3 py-2 text-xs font-semibold text-text-primary shadow-sm hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
          aria-label="Expand map to full screen"
        >
          <Maximize2 size={14} />
          Full screen
        </button>
      )}
    </div>
  );
}

export default function LocationMapView(props: LocationMapViewProps) {
  const {
    employees,
    selectedEmpId,
    onSelectEmployee,
    officeCenter,
    mapBounds,
    geofenceRadius,
    officeName,
    isLive,
  } = props;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const gradientId = useId().replace(/:/g, '');
  const fullscreenGradientId = `${gradientId}-fs`;

  const openFullscreen = useCallback(() => setIsFullscreen(true), []);
  const closeFullscreen = useCallback(() => setIsFullscreen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFullscreen();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen, closeFullscreen]);

  const canvasProps = {
    employees,
    selectedEmpId,
    onSelectEmployee,
    officeCenter,
    mapBounds,
    geofenceRadius,
  };

  return (
    <>
      <div className="glass-card overflow-hidden flex flex-col h-full">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Navigation size={18} className="text-primary" />
            <div>
              <h3 className="font-bold text-text-primary">Live map</h3>
              <p className="text-xs text-text-secondary">
                {officeName ?? 'Select an office'} · geofence{' '}
                {(geofenceRadius * 111).toFixed(2)} km
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openFullscreen}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-variant/50 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
            >
              <Maximize2 size={14} />
              Expand
            </button>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                isLive
                  ? 'bg-success/10 text-success'
                  : 'bg-muted/10 text-muted'
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  isLive ? 'bg-success animate-pulse' : 'bg-muted'
                )}
              />
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>

        <MapCanvas
          {...canvasProps}
          gradientId={gradientId}
          className="aspect-[4/3] sm:aspect-[16/10]"
          onExpand={openFullscreen}
          showExpandHint
        />
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[200] flex flex-col bg-background"
                role="dialog"
                aria-modal="true"
                aria-label="Full screen live map"
              >
                <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Navigation size={20} className="text-primary shrink-0" />
                    <div className="min-w-0">
                      <h2 className="font-bold text-text-primary truncate">
                        Live map — {officeName ?? 'Office'}
                      </h2>
                      <p className="text-xs text-text-secondary truncate">
                        Geofence {(geofenceRadius * 111).toFixed(2)} km ·{' '}
                        {employees.length} employee
                        {employees.length === 1 ? '' : 's'} on map
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                        isLive
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/10 text-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          isLive ? 'bg-success animate-pulse' : 'bg-muted'
                        )}
                      />
                      {isLive ? 'Live' : 'Paused'}
                    </span>
                    <button
                      type="button"
                      onClick={closeFullscreen}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-surface-variant px-3 py-2 text-xs font-semibold text-text-primary hover:bg-border transition-colors"
                    >
                      <Minimize2 size={14} />
                      Exit
                    </button>
                    <button
                      type="button"
                      onClick={closeFullscreen}
                      className="rounded-xl p-2 text-text-secondary hover:bg-surface-variant hover:text-text-primary transition-colors"
                      aria-label="Close full screen map"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-h-0 p-3 sm:p-4"
                >
                  <MapCanvas
                    {...canvasProps}
                    gradientId={fullscreenGradientId}
                    className="h-full min-h-[280px] rounded-2xl border border-border overflow-hidden"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
