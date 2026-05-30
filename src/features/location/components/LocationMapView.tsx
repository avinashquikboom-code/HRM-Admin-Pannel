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
  geofenceRadius: number;
  officeName?: string;
  containerId: string;
  className?: string;
}

function MapCanvas({
  employees,
  selectedEmpId,
  onSelectEmployee,
  officeCenter,
  geofenceRadius,
  officeName,
  containerId,
  className,
}: MapCanvasProps) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [layersGroup, setLayersGroup] = useState<any>(null);

  // Dynamically load Leaflet assets via browser CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !document.getElementById(containerId) || mapInstance) return;

    const L = (window as any).L;

    const map = L.map(containerId, {
      zoomControl: false
    }).setView([officeCenter.lat, officeCenter.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    const group = L.featureGroup().addTo(map);
    setMapInstance(map);
    setLayersGroup(group);

    return () => {
      map.remove();
    };
  }, [leafletLoaded, containerId]);

  // Redraw layers when office coordinates, radius, employees or selection updates
  useEffect(() => {
    if (!mapInstance || !layersGroup) return;

    const L = (window as any).L;
    layersGroup.clearLayers();

    // 1. Draw Office Center Icon
    const officeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #0d9488; width: 18px; height: 18px; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translate(-5px, -5px);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const officeMarker = L.marker([officeCenter.lat, officeCenter.lng], {
      icon: officeIcon
    }).addTo(layersGroup);

    officeMarker.bindTooltip(officeName || "Office Center", {
      permanent: true,
      direction: 'bottom',
      className: 'custom-leaflet-tooltip-office',
      offset: [0, 8]
    });

    // 2. Draw Geofence Circle Overlay (convert degree geofenceRadius to meters)
    const radiusMeters = geofenceRadius * 111320;
    L.circle([officeCenter.lat, officeCenter.lng], {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '5, 5',
      radius: radiusMeters
    }).addTo(layersGroup);

    // 3. Draw Employees
    employees.forEach((emp) => {
      const isSelected = selectedEmpId === emp.employeeId;
      const style = statusStyle(emp.status);

      const empIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="position: relative;">
            <div style="background-color: ${style.fill}; width: 14px; height: 14px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 3px 6px rgba(0,0,0,0.25); transform: translate(-3px, -3px);"></div>
            ${isSelected ? `<div style="position: absolute; top: -8px; left: -8px; width: 24px; height: 24px; border: 2.5px dashed #0d9488; border-radius: 50%; animation: spin 4s linear infinite; box-sizing: border-box;"></div>` : ''}
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const empMarker = L.marker([emp.lat, emp.lng], {
        icon: empIcon
      }).addTo(layersGroup);

      empMarker.on('click', () => {
        onSelectEmployee(emp.employeeId);
      });

      empMarker.bindTooltip(emp.name.split(' ')[0], {
        permanent: true,
        direction: 'top',
        className: 'custom-leaflet-tooltip',
        offset: [0, -8]
      });
    });

    // Dynamic zoom focus to selected employee
    if (selectedEmpId) {
      const selEmp = employees.find((e) => e.employeeId === selectedEmpId);
      if (selEmp) {
        mapInstance.setView([selEmp.lat, selEmp.lng], mapInstance.getZoom());
      }
    }
  }, [mapInstance, layersGroup, employees, officeCenter, geofenceRadius, selectedEmpId, officeName]);

  return (
    <div className={cn('relative w-full overflow-hidden bg-surface-variant', className)}>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          font-family: inherit !important;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-leaflet-tooltip {
          background-color: var(--surface) !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border) !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          padding: 2px 6px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
        }
        .custom-leaflet-tooltip-office {
          background-color: var(--primary-light) !important;
          color: var(--primary) !important;
          border: 1px solid var(--border) !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          padding: 2px 6px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1) !important;
          border-radius: 1rem !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: var(--surface) !important;
          color: var(--text-primary) !important;
          border-bottom: 1px solid var(--border) !important;
          transition: all 0.2s;
        }
        .leaflet-bar a:hover {
          background-color: var(--primary-light) !important;
          color: var(--primary) !important;
        }
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}} />

      {!leafletLoaded && (
        <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center bg-surface-variant/90 animate-pulse">
          <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <span className="text-xs font-black uppercase tracking-widest text-text-secondary">Loading Tracker Map...</span>
        </div>
      )}

      <div id={containerId} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Info Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[5] p-3 rounded-xl bg-surface/90 backdrop-blur border border-border shadow-sm text-xs space-y-1 pointer-events-none">
        <p className="font-semibold text-text-primary flex items-center gap-1.5">
          <MapPin size={12} className="text-primary" />
          {officeCenter.lat.toFixed(4)}, {officeCenter.lng.toFixed(4)}
        </p>
        <p className="text-text-secondary">
          Click employee pins to view telemetry profiles
        </p>
      </div>

      {/* Map Markers Legend */}
      <div className="absolute top-3 right-3 z-[5] p-3 rounded-xl bg-surface/90 backdrop-blur border border-border shadow-sm space-y-1.5 text-[10px] font-semibold pointer-events-none">
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
    </div>
  );
}

export default function LocationMapView(props: LocationMapViewProps) {
  const {
    employees,
    selectedEmpId,
    onSelectEmployee,
    officeCenter,
    geofenceRadius,
    officeName,
    isLive,
  } = props;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mapUniqueId = useId().replace(/:/g, '');
  const mainMapId = `tracker-map-${mapUniqueId}`;
  const fullscreenMapId = `tracker-map-fs-${mapUniqueId}`;

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
    geofenceRadius,
    officeName,
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
                  'w-2.5 h-2.5 rounded-full',
                  isLive ? 'bg-success animate-pulse' : 'bg-muted'
                )}
              />
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>

        <MapCanvas
          {...canvasProps}
          containerId={mainMapId}
          className="h-[380px] sm:h-[480px]"
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
                    containerId={fullscreenMapId}
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
