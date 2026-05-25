"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, 
  Activity, 
  ShieldAlert, 
  Compass, 
  RefreshCw, 
  Play, 
  Pause, 
  Battery, 
  Wifi, 
  User, 
  Search,
  ChevronRight,
  Map,
  Info,
  Sliders,
  AlertTriangle,
  Locate,
  CheckCircle2,
  Trash2,
  Building2,
  Plus,
  Pencil,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';
import { useOffices } from '@/hooks/useOffices';
import { useOfficeDetail } from '@/hooks/useOfficeDetail';
import {
  getMapBoundsForOffice,
  metersToDegreeRadius,
} from '@/services/officeService';
import CreateOfficeModal from '@/features/location/components/CreateOfficeModal';
import EditOfficeModal from '@/features/location/components/EditOfficeModal';
import AssignEmployeeModal from '@/features/location/components/AssignEmployeeModal';
import { deleteOffice, type Office } from '@/services/officeService';
import { unassignEmployeeFromOffice } from '@/services/employeeService';

import { 
  mockLiveLocations as initialLocations, 
  mockLocationLogs as initialLogs 
} from '@/data/mockData';

interface EmployeeLocation {
  employeeId: number;
  name: string;
  role: string;
  lat: number;
  lng: number;
  status: string;
  speed: string;
  battery: string;
}

interface LocationLog {
  id: string;
  employeeName: string;
  event: string;
  description: string;
  timestamp: string;
  coordinates: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// Default map bounds (Mumbai) — used until offices load
const DEFAULT_MAP_BOUNDS = {
  minLat: 19.0500,
  maxLat: 19.1020,
  minLng: 72.8400,
  maxLng: 72.9150
};

const DEFAULT_OFFICE_CENTER = {
  lat: 19.0760,
  lng: 72.8777
};

export default function LocationPage() {
  const { offices, isLoading: isOfficesLoading, error: officesError, refetch } = useOffices();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const {
    office: officeDetail,
    isLoading: isOfficeDetailLoading,
    error: officeDetailError,
    refetch: refetchOfficeDetail,
  } = useOfficeDetail(selectedOfficeId);
  const [locations, setLocations] = useState<EmployeeLocation[]>(initialLocations);
  const [logs, setLogs] = useState<LocationLog[]>(initialLogs);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  
  // Controls
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);
  const [geofenceRadius, setGeofenceRadius] = useState(0.015);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [radarSpeed, setRadarSpeed] = useState(1);
  const [isCreateOfficeOpen, setIsCreateOfficeOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [isAssignEmployeeOpen, setIsAssignEmployeeOpen] = useState(false);
  const [unassigningEmployeeId, setUnassigningEmployeeId] = useState<number | null>(null);
  const [isDeletingOfficeId, setIsDeletingOfficeId] = useState<number | null>(null);
  const [officeActionMessage, setOfficeActionMessage] = useState('');
  const [officeActionError, setOfficeActionError] = useState('');

  const handleOfficeCreated = async (officeId: number, message: string) => {
    setOfficeActionMessage(message);
    setOfficeActionError('');
    setSelectedOfficeId(officeId);
    await refetch();
    await refetchOfficeDetail(officeId);
  };

  const handleOfficeUpdated = async (officeId: number, message: string) => {
    setOfficeActionMessage(message);
    setOfficeActionError('');
    setSelectedOfficeId(officeId);
    await refetch();
    await refetchOfficeDetail(officeId);
  };

  const handleDeleteOffice = async (office: Office) => {
    const confirmed = window.confirm(
      `Delete ${office.name}? This cannot be undone.`
    );
    if (!confirmed) return;

    setOfficeActionError('');
    setOfficeActionMessage('');
    setIsDeletingOfficeId(office.id);

    try {
      const result = await deleteOffice(office.id);
      setOfficeActionMessage(result.message);

      if (selectedOfficeId === office.id) {
        setSelectedOfficeId(null);
      }

      await refetch();
    } catch (err) {
      setOfficeActionError(
        err instanceof Error ? err.message : 'Failed to delete office.'
      );
    } finally {
      setIsDeletingOfficeId(null);
    }
  };

  const handleEmployeeAssigned = async (message: string, officeId: number) => {
    setOfficeActionMessage(message);
    setOfficeActionError('');
    await refetch();
    await refetchOfficeDetail(officeId);
  };

  const handleUnassignEmployee = async (employeeId: number, employeeName: string) => {
    const confirmed = window.confirm(`Unassign ${employeeName} from this office?`);
    if (!confirmed) return;

    setOfficeActionError('');
    setOfficeActionMessage('');
    setUnassigningEmployeeId(employeeId);

    try {
      const result = await unassignEmployeeFromOffice(employeeId);
      setOfficeActionMessage(result.message);
      await refetch();
      if (selectedOfficeId) {
        await refetchOfficeDetail(selectedOfficeId);
      }
    } catch (err) {
      setOfficeActionError(
        err instanceof Error ? err.message : 'Failed to unassign employee.'
      );
    } finally {
      setUnassigningEmployeeId(null);
    }
  };

  const selectedOfficeSummary = useMemo(
    () => offices.find((office) => office.id === selectedOfficeId) ?? null,
    [offices, selectedOfficeId]
  );

  const assignedEmployees = officeDetail?.employees ?? [];
  const assignedCount =
    officeDetail?.employees?.length ??
    selectedOfficeSummary?._count.employees ??
    0;

  const selectedOffice = useMemo(
    () =>
      officeDetail ??
      selectedOfficeSummary ??
      offices[0] ??
      null,
    [officeDetail, selectedOfficeSummary, offices]
  );

  const officeCenter = useMemo(
    () =>
      selectedOffice
        ? { lat: selectedOffice.latitude, lng: selectedOffice.longitude }
        : DEFAULT_OFFICE_CENTER,
    [selectedOffice]
  );

  const mapBounds = useMemo(
    () =>
      selectedOffice
        ? getMapBoundsForOffice(
            selectedOffice.latitude,
            selectedOffice.longitude,
            selectedOffice.maxPunchRadiusMeters
          )
        : DEFAULT_MAP_BOUNDS,
    [selectedOffice]
  );

  // Timing helper for simulated movements
  const prevLocationsRef = useRef<EmployeeLocation[]>(initialLocations);

  useEffect(() => {
    if (offices.length > 0 && selectedOfficeId === null) {
      setSelectedOfficeId(offices[0].id);
    }
  }, [offices, selectedOfficeId]);

  useEffect(() => {
    if (selectedOffice) {
      setGeofenceRadius(
        metersToDegreeRadius(
          selectedOffice.maxPunchRadiusMeters,
          selectedOffice.latitude
        )
      );
    }
  }, [selectedOffice]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Map lat/lng coordinates to 0-500 SVG coordinate grid
  const getMapCoords = (lat: number, lng: number) => {
    const xSpan = mapBounds.maxLng - mapBounds.minLng;
    const ySpan = mapBounds.maxLat - mapBounds.minLat;

    const x = ((lng - mapBounds.minLng) / xSpan) * 500;
    const y = 500 - ((lat - mapBounds.minLat) / ySpan) * 500;

    return { x, y };
  };

  const getPixelRadius = (radiusDegrees: number) => {
    const ySpan = mapBounds.maxLat - mapBounds.minLat;
    return (radiusDegrees / ySpan) * 500;
  };

  // Format date helper
  const getFormattedTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    };
    return now.toLocaleString('en-US', options).replace(',', '');
  };

  // Real-time GPS coordinate movement simulator
  useEffect(() => {
    if (!isAutoRefreshing) return;

    const intervalId = setInterval(() => {
      setLocations(prevLocs => {
        const updated = prevLocs.map(emp => {
          if (emp.status === 'On Leave') return emp;

          // Add a tiny random walk jitter delta
          const latJitter = (Math.random() - 0.5) * 0.002 * radarSpeed;
          const lngJitter = (Math.random() - 0.5) * 0.0025 * radarSpeed;

          // Constrain movement to map boundaries
          let nextLat = Math.max(mapBounds.minLat + 0.005, Math.min(mapBounds.maxLat - 0.005, emp.lat + latJitter));
          let nextLng = Math.max(mapBounds.minLng + 0.005, Math.min(mapBounds.maxLng - 0.005, emp.lng + lngJitter));

          const dist = Math.sqrt(Math.pow(nextLat - officeCenter.lat, 2) + Math.pow(nextLng - officeCenter.lng, 2));
          
          let nextStatus = emp.status;
          if (dist > geofenceRadius) {
            nextStatus = 'Outside Geofence';
          } else {
            nextStatus = 'In Office';
          }

          // Trigger Log entries if crossing bounds
          const prevEmpState = prevLocationsRef.current.find(e => e.employeeId === emp.employeeId);
          if (prevEmpState && prevEmpState.status !== nextStatus) {
            const isBreach = nextStatus === 'Outside Geofence';
            const logId = `LOG-${Math.floor(100 + Math.random() * 900)}`;
            const newLog: LocationLog = {
              id: logId,
              employeeName: emp.name,
              event: isBreach ? 'Geofence Breach' : 'Office Entry',
              description: isBreach 
                ? 'Crossed outer boundary of Office Geofence Zone' 
                : 'Returned to Office Geofenced Perimeter',
              timestamp: getFormattedTime(),
              coordinates: `${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`
            };
            
            // Append log to start of list
            setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 19)]); // cap logs to last 20
          }

          // Battery drains slowly, speeds alter depending on status
          const batteryVal = parseInt(emp.battery);
          const nextBattery = batteryVal > 5 
            ? `${batteryVal - (Math.random() > 0.85 ? 1 : 0)}%` 
            : '98%'; // simulate plugging in when low
          
          const speedNum = nextStatus === 'In Office' 
            ? Math.floor(Math.random() * 3) // walking in office 0-2 km/h
            : Math.floor(12 + Math.random() * 35); // driving/riding 12-47 km/h
          
          return {
            ...emp,
            lat: nextLat,
            lng: nextLng,
            status: nextStatus,
            speed: `${speedNum} km/h`,
            battery: nextBattery
          };
        });

        // Store active coordinates in ref to compare state shifts next tick
        prevLocationsRef.current = updated;
        return updated;
      });
    }, 4000);

    return () => clearInterval(intervalId);
  }, [isAutoRefreshing, geofenceRadius, radarSpeed, officeCenter, mapBounds]);

  const handleManualBreachTrigger = (employeeId: number) => {
    setLocations(prev => prev.map(emp => {
      if (emp.employeeId !== employeeId) return emp;
      
      // Push way out north-east to force an immediate geofence breach
      const breachLat = officeCenter.lat + geofenceRadius + 0.015;
      const breachLng = officeCenter.lng + geofenceRadius + 0.015;

      const logId = `LOG-${Math.floor(100 + Math.random() * 900)}`;
      const breachLog: LocationLog = {
        id: logId,
        employeeName: emp.name,
        event: 'Geofence Breach',
        description: 'Manual System Diagnostic Override triggered external relocation breach.',
        timestamp: getFormattedTime(),
        coordinates: `${breachLat.toFixed(4)}, ${breachLng.toFixed(4)}`
      };

      setLogs(prevLogs => [breachLog, ...prevLogs]);

      return {
        ...emp,
        lat: breachLat,
        lng: breachLng,
        status: 'Outside Geofence',
        speed: '45 km/h'
      };
    }));
  };

  const handleManualOfficeTrigger = (employeeId: number) => {
    setLocations(prev => prev.map(emp => {
      if (emp.employeeId !== employeeId) return emp;
      
      // Teleport exactly into the main office
      const officeLat = officeCenter.lat + (Math.random() - 0.5) * 0.002;
      const officeLng = officeCenter.lng + (Math.random() - 0.5) * 0.002;

      const logId = `LOG-${Math.floor(100 + Math.random() * 900)}`;
      const entryLog: LocationLog = {
        id: logId,
        employeeName: emp.name,
        event: 'Office Entry',
        description: 'Manual System Diagnostic Override returned personnel back to Headquarters.',
        timestamp: getFormattedTime(),
        coordinates: `${officeLat.toFixed(4)}, ${officeLng.toFixed(4)}`
      };

      setLogs(prevLogs => [entryLog, ...prevLogs]);

      return {
        ...emp,
        lat: officeLat,
        lng: officeLng,
        status: 'In Office',
        speed: '0 km/h'
      };
    }));
  };

  // Stats
  const activeStaff = locations.filter(e => e.status !== 'On Leave').length;
  const breachesCount = locations.filter(e => e.status === 'Outside Geofence').length;
  const inOfficeCount = locations.filter(e => e.status === 'In Office').length;

  const filteredLocations = locations.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'All' || 
                          (statusFilter === 'In Office' && emp.status === 'In Office') ||
                          (statusFilter === 'Outside' && emp.status === 'Outside Geofence') ||
                          (statusFilter === 'On Leave' && emp.status === 'On Leave');
    return matchesSearch && matchesFilter;
  });

  const selectedEmployee = locations.find(e => e.employeeId === selectedEmpId);
  const officeCoords = getMapCoords(officeCenter.lat, officeCenter.lng);
  const pixelRadius = getPixelRadius(geofenceRadius);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      <style>{`
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .radar-sweep-line {
          transform-origin: 250px 250px;
          animation: radar-sweep 12s linear infinite;
        }
        @keyframes ping-glow {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .ping-glow-circle {
          transform-origin: center;
          animation: ping-glow 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
      `}</style>

      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-1">Live Spatial Telemetry</h1>
          <p className="text-text-secondary mt-1">Real-time geofenced tracking, movement vectors, and boundary access audits.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAutoRefreshing(prev => !prev)}
            className={cn(
              "btn-secondary flex items-center gap-2", 
              isAutoRefreshing ? "text-primary border-primary/20 bg-primary/5" : "text-text-secondary"
            )}
          >
            {isAutoRefreshing ? (
              <>
                <Pause size={16} className="animate-pulse" />
                Pause Telemetry
              </>
            ) : (
              <>
                <Play size={16} />
                Resume Telemetry
              </>
            )}
          </button>
          <button 
            onClick={() => {
              setIsLoading(true);
              Promise.all([
                refetch(),
                selectedOfficeId
                  ? refetchOfficeDetail(selectedOfficeId)
                  : Promise.resolve(),
              ]).finally(() =>
                setTimeout(() => setIsLoading(false), 500)
              );
            }}
            className="p-3 bg-surface-variant hover:bg-border text-text-primary rounded-2xl transition-all shadow-sm active:scale-95"
            title="Refresh offices & GPS links"
          >
            <RefreshCw size={18} className={cn((isLoading || isOfficesLoading) && "animate-spin")} />
          </button>
        </div>
      </motion.div>

      {officesError && (
        <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
          {officesError}
        </div>
      )}

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-text-primary uppercase tracking-tight">Registered Offices</h2>
            <p className="text-sm text-text-secondary mt-1">
              Select an office to center the geofence map and telemetry grid.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted uppercase tracking-widest">
              {offices.length} locations
            </span>
            <button
              type="button"
              onClick={() => setIsCreateOfficeOpen(true)}
              className="btn-primary shadow-lg shadow-primary/20 py-2.5 px-4 text-sm"
            >
              <Plus size={18} />
              Add Office
            </button>
          </div>
        </div>

        {officeActionMessage && (
          <div className="rounded-2xl bg-success/10 border border-success/20 px-4 py-3 text-sm font-medium text-success">
            {officeActionMessage}
          </div>
        )}

        {officeActionError && (
          <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
            {officeActionError}
          </div>
        )}

        {isOfficesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((item) => (
              <div key={item} className="glass-card p-6 animate-pulse h-36" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offices.map((office) => (
              <div
                key={office.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedOfficeId(office.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedOfficeId(office.id);
                  }
                }}
                className={cn(
                  'glass-card p-6 text-left transition-all border-2 cursor-pointer',
                  selectedOffice?.id === office.id
                    ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-transparent hover:border-primary/20'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                      <Building2 size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-black text-text-primary">{office.name}</p>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                        {office.code}
                      </p>
                      <p className="text-sm text-text-secondary mt-2">{office.address}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                        office.isActive
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-muted/10 text-muted border-border'
                      )}
                    >
                      {office.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOffice(office);
                        }}
                        className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/10 transition-all"
                        title="Edit office"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOffice(office);
                        }}
                        disabled={isDeletingOfficeId === office.id}
                        className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-all disabled:opacity-60"
                        title="Delete office"
                      >
                        {isDeletingOfficeId === office.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/50">
                  <div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Employees</p>
                    <p className="text-sm font-bold text-text-primary mt-1">{office._count.employees}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Ideal Radius</p>
                    <p className="text-sm font-bold text-text-primary mt-1">{office.idealRadiusMeters}m</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Max Punch</p>
                    <p className="text-sm font-bold text-text-primary mt-1">{office.maxPunchRadiusMeters}m</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {selectedOfficeId && (
        <motion.div variants={itemVariants} className="glass-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-text-primary uppercase tracking-tight">
                Office Personnel
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Employees registered at {selectedOffice?.name ?? 'selected office'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                {assignedCount} assigned
              </span>
              <button
                type="button"
                onClick={() => setIsAssignEmployeeOpen(true)}
                className="btn-primary shadow-lg shadow-primary/20 py-2 px-4 text-sm"
              >
                <UserPlus size={16} />
                Assign Employee
              </button>
            </div>
          </div>

          {officeDetailError && (
            <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>{officeDetailError}</span>
              <button
                type="button"
                onClick={() => selectedOfficeId && refetchOfficeDetail(selectedOfficeId)}
                className="text-xs font-bold uppercase tracking-widest text-error hover:underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {isOfficeDetailLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 rounded-2xl bg-surface-variant animate-pulse" />
              ))}
            </div>
          ) : assignedEmployees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-surface-variant/50 border border-border/50"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                    {employee.firstName[0]}
                    {employee.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text-primary truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">
                      {employee.employeeCode}
                    </p>
                    <p className="text-xs text-text-secondary mt-1 truncate">
                      {employee.designation}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleUnassignEmployee(
                        employee.id,
                        `${employee.firstName} ${employee.lastName}`
                      )
                    }
                    disabled={unassigningEmployeeId === employee.id}
                    className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-all disabled:opacity-60 shrink-0"
                    title="Unassign from office"
                  >
                    {unassigningEmployeeId === employee.id ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : assignedCount > 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center space-y-3">
              <User size={28} className="mx-auto text-muted" />
              <p className="text-sm font-bold text-text-secondary">
                {assignedCount} employee{assignedCount === 1 ? '' : 's'} assigned, but details could not be loaded.
              </p>
              <button
                type="button"
                onClick={() => selectedOfficeId && refetchOfficeDetail(selectedOfficeId)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                Reload personnel
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <User size={28} className="mx-auto text-muted mb-3" />
              <p className="text-sm font-bold text-text-secondary">
                No employees assigned to this office yet.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Spatial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Field Agents', value: activeStaff, icon: Locate, color: 'primary', bg: 'bg-primary/10', sub: 'GPS Signals Synced' },
          { label: 'Stationed At HQ', value: inOfficeCount, icon: Compass, color: 'success', bg: 'bg-success/10', sub: 'Inside Geofence Zone' },
          { label: 'Geofence Breaches', value: breachesCount, icon: ShieldAlert, color: 'error', bg: 'bg-error/10', sub: 'Outside Allowed Limits' },
          { label: 'GPS Sync Health', value: isAutoRefreshing ? '99.4%' : 'Paused', icon: Wifi, color: isAutoRefreshing ? 'accent' : 'warning', bg: isAutoRefreshing ? 'bg-accent/10' : 'bg-warning/10', sub: isAutoRefreshing ? '4 Satellites Locked' : 'GPS Simulation Halted' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 transition-transform group-hover:scale-150 duration-700", `bg-${stat.color}`)} />
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg, `text-${stat.color}`)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-text-primary mt-1 tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-muted font-medium mt-0.5">{stat.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Layout: Vector Radar Map vs. Controllers & Selected Profile */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Vector Interactive Radar Grid Map */}
        <motion.div variants={itemVariants} className="xl:col-span-7 glass-card p-6 space-y-4 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-border relative z-10">
            <div className="flex items-center gap-2">
              <Map size={18} className="text-primary animate-pulse" />
              <h3 className="font-black text-text-primary tracking-tight">Interactive Coordinate Radar Grid</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
                <span className="text-[10px] font-black uppercase text-muted tracking-widest">Active Scan</span>
              </div>
            </div>
          </div>

          {/* Map canvas wrapper */}
          <div className="relative aspect-square w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Dark grid gridlines bg */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px)] bg-[size:25px_25px] opacity-40" />
            
            <svg 
              viewBox="0 0 500 500" 
              className="w-full h-full select-none"
            >
              <defs>
                {/* Geofence gradient glow */}
                <radialGradient id="geofenceGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0.05)" />
                  <stop offset="90%" stopColor="rgba(6, 182, 212, 0.01)" />
                  <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                </radialGradient>
                {/* Radar Sweep Gradient */}
                <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0.25)" />
                  <stop offset="50%" stopColor="rgba(6, 182, 212, 0.05)" />
                  <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Concentric Radar Rings */}
              <circle cx="250" cy="250" r="50" fill="none" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="1" />
              <circle cx="250" cy="250" r="150" fill="none" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="1" />
              <circle cx="250" cy="250" r="240" fill="none" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="1.5" />

              {/* Radar Crosshairs */}
              <line x1="10" y1="250" x2="490" y2="250" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="1" />
              <line x1="250" y1="10" x2="250" y2="490" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="1" />

              {/* Geofence Boundary Zone */}
              <circle 
                cx={officeCoords.x} 
                cy={officeCoords.y} 
                r={pixelRadius} 
                fill="url(#geofenceGlow)" 
                stroke="rgba(6, 182, 212, 0.45)" 
                strokeWidth="1.5" 
                strokeDasharray="6 4" 
                filter="url(#glow)"
              />
              
              {/* Radar Sweep Animation Line */}
              {isAutoRefreshing && (
                <g className="radar-sweep-line pointer-events-none">
                  <path d={`M 250 250 L 250 10 A 240 240 0 0 1 370 42 Z`} fill="url(#radarSweepGrad)" opacity="0.4" />
                  <line x1="250" y1="250" x2="250" y2="10" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5" />
                </g>
              )}

              {/* Corporate HQ Base Marker */}
              <g className="cursor-pointer" onClick={() => setSelectedEmpId(null)}>
                <circle cx={officeCoords.x} cy={officeCoords.y} r="16" fill="rgba(14, 165, 233, 0.15)" stroke="rgba(14, 165, 233, 0.3)" />
                <circle cx={officeCoords.x} cy={officeCoords.y} r="6" fill="#0284c7" className="animate-pulse" />
                <path 
                  d="M 250 242 L 254 249 L 261 249 L 256 253 L 258 260 L 250 256 L 242 260 L 244 253 L 239 249 L 246 249 Z" 
                  fill="#ffffff" 
                  transform={`translate(${officeCoords.x - 250}, ${officeCoords.y - 250}) scale(0.6)`}
                  className="pointer-events-none"
                />
              </g>

              {/* Dynamic Employee Markers */}
              {filteredLocations.map((emp) => {
                const { x, y } = getMapCoords(emp.lat, emp.lng);
                const isSelected = selectedEmpId === emp.employeeId;
                
                let markerColor = "#10b981"; // success: in office
                let outerBg = "rgba(16, 185, 129, 0.2)";
                
                if (emp.status === 'Outside Geofence') {
                  markerColor = "#f97316"; // warning: breach
                  outerBg = "rgba(249, 115, 22, 0.2)";
                } else if (emp.status === 'On Leave') {
                  markerColor = "#64748b"; // muted: inactive
                  outerBg = "rgba(100, 116, 139, 0.25)";
                }

                return (
                  <motion.g 
                    key={emp.employeeId} 
                    className="cursor-pointer"
                    onClick={() => setSelectedEmpId(emp.employeeId)}
                    whileHover={{ scale: 1.25 }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  >
                    {/* Animated Pulsing Ring */}
                    {emp.status !== 'On Leave' && (
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="18" 
                        fill="none" 
                        stroke={markerColor} 
                        strokeWidth="1.5"
                        className="ping-glow-circle pointer-events-none"
                      />
                    )}
                    
                    {/* Double Outer Rings for selected */}
                    {isSelected && (
                      <>
                        <circle cx={x} cy={y} r="16" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 2" />
                        <circle cx={x} cy={y} r="22" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
                      </>
                    )}

                    {/* Standard Marker Dot */}
                    <circle cx={x} cy={y} r="9" fill={outerBg} stroke={markerColor} strokeWidth="1.5" />
                    <circle cx={x} cy={y} r="4.5" fill={markerColor} />

                    {/* Small tag labels next to pins */}
                    <text 
                      x={x + 12} 
                      y={y + 4} 
                      fill="#ffffff" 
                      fontSize="9" 
                      fontWeight="bold" 
                      className="font-sans pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] opacity-80"
                    >
                      {emp.name.split(' ')[0]}
                    </text>
                  </motion.g>
                );
              })}
            </svg>

            {/* Radar Coordinates Corner Display Overlay */}
            <div className="absolute bottom-4 left-4 p-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl pointer-events-none flex flex-col font-mono text-[9px] text-slate-400 gap-0.5 shadow-lg">
              <span className="text-primary font-bold">RADAR FEED SYSTEM v4.11</span>
              <span>LOCKED CENTER: {officeCenter.lat.toFixed(4)}N, {officeCenter.lng.toFixed(4)}E</span>
              {selectedOffice && (
                <span className="ml-4 text-primary font-bold">{selectedOffice.name}</span>
              )}
              <span>GRID GEOFENCE: {(geofenceRadius * 111).toFixed(2)} km radius</span>
              <span>SYS ACTIVE: GLONASS/GPS MATRIX</span>
            </div>

            {/* Map Legend */}
            <div className="absolute top-4 right-4 p-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl pointer-events-none flex flex-col gap-1.5 shadow-lg text-[9px] font-bold text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Geofence Zone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Stationed In Office</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>Outside Perimeter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>On Leave (Inactive)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Panel: Inspector & Simulation Tuning Controls */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Selected Employee Profile Inspector Detail */}
          <AnimatePresence mode="wait">
            {selectedEmployee ? (
              <motion.div 
                key={selectedEmployee.employeeId}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                className="glass-card p-6 space-y-6 relative overflow-hidden group"
              >
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                
                <div className="flex items-start justify-between border-b border-border pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm border border-primary/10">
                      {selectedEmployee.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-black text-text-primary text-base leading-tight">{selectedEmployee.name}</h4>
                      <p className="text-xs text-text-secondary mt-0.5">{selectedEmployee.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedEmpId(null)}
                    className="p-1 bg-surface-variant hover:bg-border rounded-lg text-text-secondary transition-colors"
                  >
                    <span className="text-[10px] uppercase font-bold tracking-widest px-1">Close</span>
                  </button>
                </div>

                {/* Inspect Grid */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-surface-variant p-3.5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider block">Latitude</span>
                    <span className="font-mono text-xs font-bold text-text-primary">{selectedEmployee.lat.toFixed(5)}N</span>
                  </div>
                  <div className="bg-surface-variant p-3.5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider block">Longitude</span>
                    <span className="font-mono text-xs font-bold text-text-primary">{selectedEmployee.lng.toFixed(5)}E</span>
                  </div>
                  <div className="bg-surface-variant p-3.5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider block">Velocity (Speed)</span>
                    <span className="font-mono text-xs font-black text-primary">{selectedEmployee.speed}</span>
                  </div>
                  <div className="bg-surface-variant p-3.5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider block flex items-center gap-1">
                      <Battery size={10} className="text-emerald-500" /> Battery
                    </span>
                    <span className="font-mono text-xs font-bold text-text-primary">{selectedEmployee.battery}</span>
                  </div>
                </div>

                {/* Boundary Status Indicator */}
                <div className={cn(
                  "p-4 rounded-2xl border flex items-center gap-3 relative z-10",
                  selectedEmployee.status === 'In Office' ? "bg-success/5 border-success/15 text-success" :
                  selectedEmployee.status === 'Outside Geofence' ? "bg-error/5 border-error/15 text-error" : "bg-slate-500/5 border-slate-500/15 text-slate-400"
                )}>
                  <div className="relative">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full block shadow-[0_0_8px_currentColor]",
                      selectedEmployee.status === 'In Office' ? "bg-success" :
                      selectedEmployee.status === 'Outside Geofence' ? "bg-error animate-ping" : "bg-slate-400"
                    )} />
                    {selectedEmployee.status === 'Outside Geofence' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-error absolute inset-0" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black uppercase tracking-wider block">Boundary Matrix</span>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {selectedEmployee.status === 'In Office' ? 'Within corporate designated working parameters.' :
                       selectedEmployee.status === 'Outside Geofence' ? 'CAUTION: Geofence violation reported outside office gates.' : 'Currently inactive due to corporate leave clearance.'}
                    </span>
                  </div>
                </div>

                {/* Simulation Override Actions */}
                {selectedEmployee.status !== 'On Leave' && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Simulation Controls Override</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleManualBreachTrigger(selectedEmployee.employeeId)}
                        disabled={selectedEmployee.status === 'Outside Geofence'}
                        className="btn-danger py-3 text-[10px] font-black uppercase tracking-wider rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm active:scale-95"
                      >
                        Force Breach
                      </button>
                      <button 
                        onClick={() => handleManualOfficeTrigger(selectedEmployee.employeeId)}
                        disabled={selectedEmployee.status === 'In Office'}
                        className="btn-primary py-3 text-[10px] font-black uppercase tracking-wider rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm active:scale-95"
                      >
                        Recall to HQ
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-3 py-10"
              >
                <div className="p-4 bg-primary/10 text-primary rounded-full animate-bounce">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-sm">Select Personnel Pin</h4>
                  <p className="text-xs text-text-secondary mt-1 max-w-[240px] mx-auto">
                    Click any active agent marker on the radar screen to inspect coordinate channels and trigger manual simulated overrides.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Control Settings Dashboard */}
          <motion.div variants={itemVariants} className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sliders size={16} className="text-primary" />
              <h4 className="font-black text-text-primary text-sm tracking-tight">Geofence Calibration Center</h4>
            </div>

            <div className="space-y-5">
              
              {/* Geofence Perimeter Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Geofence Perimeter Limit</span>
                  <span className="font-mono font-black text-primary">{(geofenceRadius * 111).toFixed(2)} km</span>
                </div>
                <input 
                  type="range" 
                  min="0.005" 
                  max="0.035" 
                  step="0.001"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(parseFloat(e.target.value))}
                  className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[8px] text-muted font-bold uppercase tracking-widest mt-1">
                  <span>Tight Zone (0.5 km)</span>
                  <span>Wide Boundary (3.9 km)</span>
                </div>
              </div>

              {/* Simulation Refresh Clock Speed */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Simulation Walk Speed multiplier</span>
                  <span className="font-mono font-black text-accent">{radarSpeed}x Speed</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Slow (0.5x)', value: 0.5 },
                    { label: 'Normal (1x)', value: 1 },
                    { label: 'Dynamic (2x)', value: 2 },
                  ].map((spd) => (
                    <button
                      key={spd.value}
                      onClick={() => setRadarSpeed(spd.value)}
                      className={cn(
                        "py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
                        radarSpeed === spd.value 
                          ? "bg-accent/10 border-accent/20 text-accent font-bold shadow-sm"
                          : "bg-surface-variant hover:bg-border text-text-secondary border-transparent"
                      )}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Filter and Spatial Records Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        
        {/* Filtering & Live Searching Block */}
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search employee coordinates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-variant border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full xl:w-48 bg-surface-variant border border-transparent hover:border-primary/10 rounded-2xl px-4 py-3 text-sm outline-none font-bold text-text-secondary cursor-pointer transition-all"
            >
              <option value="All">All Tiers</option>
              <option value="In Office">Inside Geofence</option>
              <option value="Outside">Outside Geofence</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Coordinates Roster */}
          <div className="lg:col-span-7 glass-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="heading-2">Active Coordinates Roster</h3>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {filteredLocations.length} Registered
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50">
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border">Personnel</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border">Coordinates</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border text-right">Battery / Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLocations.map((emp) => (
                    <tr 
                      key={emp.employeeId} 
                      onClick={() => setSelectedEmpId(emp.employeeId)}
                      className={cn(
                        "hover:bg-surface-variant/30 transition-colors cursor-pointer group",
                        selectedEmpId === emp.employeeId && "bg-primary/5 hover:bg-primary/5"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-black text-xs">
                            {emp.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-bold text-text-primary block group-hover:text-primary transition-colors">{emp.name}</span>
                            <span className="text-[10px] text-text-secondary block mt-0.5">{emp.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                          emp.status === 'In Office' ? 'bg-success/10 text-success border-success/10' :
                          emp.status === 'Outside Geofence' ? 'bg-error/10 text-error border-error/10 animate-pulse' : 'bg-slate-500/10 text-slate-400 border-slate-500/10'
                        )}>
                          {emp.status === 'Outside Geofence' ? 'Breached' : emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-text-secondary">
                        {emp.status === 'On Leave' ? '---' : `${emp.lat.toFixed(4)}N, ${emp.lng.toFixed(4)}E`}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-text-primary">
                        <div className="flex flex-col items-end">
                          <span className="font-black text-primary">{emp.speed}</span>
                          <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                            <Battery size={10} className="text-emerald-500" /> {emp.battery}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Geofence Breaches Alerts Log */}
          <div className="lg:col-span-5 glass-card flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-error" />
                <h3 className="heading-2">System Diagnostics Log</h3>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] font-black uppercase tracking-widest text-error/70 hover:text-error hover:bg-error/10 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95"
              >
                <Trash2 size={12} /> Clear Logs
              </button>
            </div>
            
            {/* Log List */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[360px] space-y-4">
              <AnimatePresence mode="popLayout">
                {logs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10 space-y-2 text-muted"
                  >
                    <CheckCircle2 size={32} className="text-success" />
                    <div>
                      <p className="text-xs font-bold text-text-primary">All parameters normal</p>
                      <p className="text-[10px] mt-0.5">No geofence breaches or GPS signal losses registered.</p>
                    </div>
                  </motion.div>
                ) : (
                  logs.map((log) => {
                    const isBreach = log.event === 'Geofence Breach';
                    return (
                      <motion.div 
                        key={log.id} 
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "p-3.5 rounded-2xl border flex items-start gap-3 shadow-sm",
                          isBreach ? 'bg-error/5 border-error/10' : 'bg-success/5 border-success/10'
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-xl mt-0.5",
                          isBreach ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                        )}>
                          {isBreach ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-wider text-text-primary">
                              {log.employeeName}
                            </span>
                            <span className="font-mono text-[9px] text-muted">
                              {log.timestamp.split(' ').slice(3).join(' ')} {/* only display time part */}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-text-primary leading-snug">{log.event}</p>
                          <p className="text-[10px] text-text-secondary leading-relaxed">{log.description}</p>
                          <div className="flex items-center gap-1 text-[9px] font-mono text-muted pt-1">
                            <MapPin size={10} />
                            <span>GPS: {log.coordinates}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </motion.div>

      <CreateOfficeModal
        isOpen={isCreateOfficeOpen}
        onClose={() => setIsCreateOfficeOpen(false)}
        onCreated={handleOfficeCreated}
      />

      <EditOfficeModal
        isOpen={Boolean(editingOffice)}
        office={editingOffice}
        onClose={() => setEditingOffice(null)}
        onUpdated={handleOfficeUpdated}
      />

      <AssignEmployeeModal
        isOpen={isAssignEmployeeOpen}
        officeId={selectedOfficeId}
        officeName={selectedOffice?.name ?? 'Selected office'}
        onClose={() => setIsAssignEmployeeOpen(false)}
        onAssigned={handleEmployeeAssigned}
      />

    </motion.div>
  );
}
