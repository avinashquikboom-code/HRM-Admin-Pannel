'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pause, Play, RefreshCw, Building2, MapPin, Globe, ShieldAlert, ShieldCheck, Search, Sliders, Navigation, Activity } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useOffices } from '@/hooks/useOffices';
import { useOfficeDetail } from '@/hooks/useOfficeDetail';
import { useLiveLocations } from '@/hooks/useLiveLocations';
import {
  deleteOffice,
  createOffice,
  updateOffice,
  getMapBoundsForOffice,
  metersToDegreeRadius,
  type Office,
} from '@/services/officeService';
import { unassignEmployeeFromOffice } from '@/services/employeeService';
import { fetchLiveLocationLogs, clearLiveLocationLogs } from '@/services/locationService';
import CreateOfficeModal from '@/features/location/components/CreateOfficeModal';
import EditOfficeModal from '@/features/location/components/EditOfficeModal';
import AssignEmployeeModal from '@/features/location/components/AssignEmployeeModal';
import LocationStatsBar from '@/features/location/components/LocationStatsBar';
import OfficeSidebar from '@/features/location/components/OfficeSidebar';
import LocationMapView from '@/features/location/components/LocationMapView';
import EmployeeDetailCard from '@/features/location/components/EmployeeDetailCard';
import LocationRoster from '@/features/location/components/LocationRoster';
import ActivityFeed from '@/features/location/components/ActivityFeed';
import { useLocationSimulation } from '@/features/location/hooks/useLocationSimulation';
import type { LocationStatusFilter } from '@/features/location/types';

const DEFAULT_MAP_BOUNDS = {
  minLat: 19.05,
  maxLat: 19.102,
  minLng: 72.84,
  maxLng: 72.915,
};

const DEFAULT_OFFICE_CENTER = { lat: 19.076, lng: 72.8777 };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 110, damping: 16 },
  },
};

export default function LocationPage() {
  const { offices, isLoading: isOfficesLoading, error: officesError, refetch } =
    useOffices();
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const {
    office: officeDetail,
    isLoading: isOfficeDetailLoading,
    error: officeDetailError,
    refetch: refetchOfficeDetail,
  } = useOfficeDetail(selectedOfficeId);

  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);
  const {
    locations,
    isLoading: isLocationsLoading,
    error: locationsError,
    refetch: refetchLocations,
    setLocations,
  } = useLiveLocations(isAutoRefreshing);

  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<LocationStatusFilter>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isCreateOfficeOpen, setIsCreateOfficeOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [isAssignEmployeeOpen, setIsAssignEmployeeOpen] = useState(false);
  const [unassigningEmployeeId, setUnassigningEmployeeId] = useState<
    string | null
  >(null);
  const [isDeletingOfficeId, setIsDeletingOfficeId] = useState<string | null>(
    null
  );
  const [officeActionMessage, setOfficeActionMessage] = useState('');
  const [officeActionError, setOfficeActionError] = useState('');

  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');

  // Redesign state variables
  const [activeTab, setActiveTab] = useState<'editor' | 'tracker'>('editor');

  useEffect(() => {
    if (tabQuery === 'tracker') {
      setActiveTab('tracker');
    } else if (tabQuery === 'editor') {
      setActiveTab('editor');
    }
  }, [tabQuery]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [circleInstance, setCircleInstance] = useState<any>(null);

  // Form inputs
  const [siteNameInput, setSiteNameInput] = useState('');
  const [latInput, setLatInput] = useState('19.187053');
  const [lngInput, setLngInput] = useState('72.977937');
  const [radiusInput, setRadiusInput] = useState(250);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedOfficeSummary = useMemo(
    () => offices.find((office) => office.id === selectedOfficeId) ?? null,
    [offices, selectedOfficeId]
  );

  const selectedOffice = useMemo(
    () => officeDetail ?? selectedOfficeSummary ?? offices[0] ?? null,
    [officeDetail, selectedOfficeSummary, offices]
  );

  const assignedEmployees = officeDetail?.employees ?? [];
  const assignedCount =
    officeDetail?.employees?.length ??
    selectedOfficeSummary?._count.employees ??
    0;

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

  const geofenceRadius = useMemo(
    () =>
      selectedOffice
        ? metersToDegreeRadius(
            selectedOffice.maxPunchRadiusMeters,
            selectedOffice.latitude
          )
        : 0.015,
    [selectedOffice]
  );

  const [logs, setLogs] = useState<any[]>([]);

  const loadTelemetryLogs = useCallback(async () => {
    try {
      const data = await fetchLiveLocationLogs();
      setLogs(data);
    } catch (err) {
      console.error('[Telemetry Logs Fetch Error]:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'tracker') {
      loadTelemetryLogs();
    }
  }, [activeTab, loadTelemetryLogs]);

  useEffect(() => {
    if (!isAutoRefreshing || activeTab !== 'tracker') return;

    const intervalId = setInterval(() => {
      loadTelemetryLogs();
    }, 7000);

    return () => clearInterval(intervalId);
  }, [isAutoRefreshing, activeTab, loadTelemetryLogs]);

  const handleClearLogs = async () => {
    try {
      await clearLiveLocationLogs();
      setLogs([]);
    } catch (err) {
      console.error('Clear logs error:', err);
    }
  };

  const handleManualBreachTrigger = () => {};
  const handleManualOfficeTrigger = () => {};

  useEffect(() => {
    if (offices.length > 0 && selectedOfficeId === null && activeTab === 'tracker') {
      setSelectedOfficeId(offices[0].id);
    }
  }, [offices, selectedOfficeId, activeTab]);

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

  // Cleanup Leaflet on unmount
  useEffect(() => {
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapInstance]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !document.getElementById('leaflet-map') || mapInstance || activeTab !== 'editor') return;

    const L = (window as any).L;

    // Default Thane coords center
    const defaultLat = parseFloat(latInput) || 19.187053;
    const defaultLng = parseFloat(lngInput) || 72.977937;

    const map = L.map('leaflet-map', {
      zoomControl: false
    }).setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    setMapInstance(map);

    // Custom DivIcon marker in Orange color matching the user mock
    const orangeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #f97316; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translate(-4px, -4px);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([defaultLat, defaultLng], {
      icon: orangeIcon,
      draggable: true
    }).addTo(map);

    const circle = L.circle([defaultLat, defaultLng], {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.15,
      weight: 2,
      radius: radiusInput
    }).addTo(map);

    setMarkerInstance(marker);
    setCircleInstance(circle);

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          const displayName = data.display_name;
          const shortName = displayName.split(',')[0].trim();
          const nameCandidate = isNaN(Number(shortName)) ? shortName : (displayName.split(',')[1]?.trim() || shortName);
          setSiteNameInput(nameCandidate);
          setSearchQuery(displayName);
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
      }
    };

    // Click anywhere to reposition marker
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      setLatInput(lat.toFixed(6));
      setLngInput(lng.toFixed(6));
      reverseGeocode(lat, lng);
    });

    // Draggable marker pin
    marker.on('drag', (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      circle.setLatLng([lat, lng]);
      setLatInput(lat.toFixed(6));
      setLngInput(lng.toFixed(6));
    });

    marker.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      reverseGeocode(lat, lng);
    });
  }, [leafletLoaded, activeTab]);

  // React to Radius Slider shifts
  useEffect(() => {
    if (circleInstance) {
      circleInstance.setRadius(radiusInput);
    }
  }, [radiusInput, circleInstance]);

  // Synchronize dynamic input changes to map marker
  const handleCoordsSubmit = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && !isNaN(lng) && mapInstance && markerInstance && circleInstance) {
      mapInstance.setView([lat, lng], mapInstance.getZoom());
      markerInstance.setLatLng([lat, lng]);
      circleInstance.setLatLng([lat, lng]);
    }
  };

  // Autocomplete search via Nominatim
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstance) return;
    setIsSearching(true);
    setOfficeActionError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);
        const displayName = data[0].display_name || searchQuery;
        const shortName = displayName.split(',')[0].trim();
        const nameCandidate = isNaN(Number(shortName)) ? shortName : (displayName.split(',')[1]?.trim() || shortName);
        setSiteNameInput(nameCandidate);
        
        mapInstance.setView([latitude, longitude], 14);
        if (markerInstance && circleInstance) {
          markerInstance.setLatLng([latitude, longitude]);
          circleInstance.setLatLng([latitude, longitude]);
          setLatInput(latitude.toFixed(6));
          setLngInput(longitude.toFixed(6));
        }
      } else {
        setOfficeActionError('Location not found. Try another query.');
      }
    } catch {
      setOfficeActionError('Failed to geocode address.');
    } finally {
      setIsSearching(false);
    }
  };

  // Selection handler from Configured Fences list
  const handleSelectOfficeFence = (off: Office) => {
    setSelectedOfficeId(off.id.toString());
    setSiteNameInput(off.name);
    setLatInput(Number(off.latitude).toFixed(6));
    setLngInput(Number(off.longitude).toFixed(6));
    setRadiusInput(off.maxPunchRadiusMeters);

    if (mapInstance && markerInstance && circleInstance) {
      const lat = Number(off.latitude);
      const lng = Number(off.longitude);
      mapInstance.setView([lat, lng], 14);
      markerInstance.setLatLng([lat, lng]);
      circleInstance.setLatLng([lat, lng]);
      circleInstance.setRadius(off.maxPunchRadiusMeters);
    }
  };

  // Link to clear selection and build a fresh Perimeter
  const handleResetEditor = () => {
    setSelectedOfficeId(null);
    setSiteNameInput('');
    setLatInput('19.187053');
    setLngInput('72.977937');
    setRadiusInput(250);
    setSearchQuery('');
    setOfficeActionMessage('');
    setOfficeActionError('');

    if (mapInstance && markerInstance && circleInstance) {
      mapInstance.setView([19.187053, 72.977937], 13);
      markerInstance.setLatLng([19.187053, 72.977937]);
      circleInstance.setLatLng([19.187053, 72.977937]);
      circleInstance.setRadius(250);
    }
  };

  // Submit perimeter save / update to database
  const handleSaveGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteNameInput.trim()) {
      setOfficeActionError('Site Name is required.');
      return;
    }

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) {
      setOfficeActionError('Latitude and Longitude must be valid numbers.');
      return;
    }

    setIsSaving(true);
    setOfficeActionError('');
    setOfficeActionMessage('');

    const payload = {
      name: siteNameInput.trim(),
      code: siteNameInput.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.floor(Math.random() * 100),
      address: searchQuery.trim() || `${siteNameInput.trim()} Business Center`,
      latitude: lat,
      longitude: lng,
      idealRadiusMeters: radiusInput / 2,
      maxPunchRadiusMeters: radiusInput,
      isActive: true,
    };

    try {
      if (selectedOfficeId) {
        const result = await updateOffice(selectedOfficeId, payload);
        setOfficeActionMessage(result.message);
      } else {
        const result = await createOffice(payload);
        setOfficeActionMessage(result.message);
        setSelectedOfficeId(result.office.id);
      }
      await refetch();
    } catch (err) {
      setOfficeActionError(err instanceof Error ? err.message : 'Save operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeStaff = locations.filter((e) => e.status !== 'On Leave').length;
  const breachesCount = locations.filter(
    (e) => e.status === 'Outside Geofence'
  ).length;
  const inOfficeCount = locations.filter((e) => e.status === 'In Office').length;

  const filteredLocations = locations.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      statusFilter === 'All' ||
      (statusFilter === 'In Office' && emp.status === 'In Office') ||
      (statusFilter === 'Outside' && emp.status === 'Outside Geofence') ||
      (statusFilter === 'On Leave' && emp.status === 'On Leave');
    return matchesSearch && matchesFilter;
  });

  const selectedEmployee =
    locations.find((e) => e.employeeId === selectedEmpId) ?? null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        refetchLocations(),
        selectedOfficeId
          ? refetchOfficeDetail(selectedOfficeId)
          : Promise.resolve(),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleOfficeCreated = async (officeId: string, message: string) => {
    setOfficeActionMessage(message);
    setOfficeActionError('');
    setSelectedOfficeId(officeId);
    await refetch();
    await refetchOfficeDetail(officeId);
  };

  const handleOfficeUpdated = async (officeId: string, message: string) => {
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
      
      const updatedOffices = await refetch();
      
      if (selectedOfficeId === office.id) {
        const remaining = updatedOffices?.filter((o: Office) => o.id !== office.id) ?? [];
        setSelectedOfficeId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      setOfficeActionError(
        err instanceof Error ? err.message : 'Failed to delete office.'
      );
    } finally {
      setIsDeletingOfficeId(null);
    }
  };

  const handleEmployeeAssigned = async (message: string, officeId: string) => {
    setOfficeActionMessage(message);
    setOfficeActionError('');
    await refetch();
    await refetchOfficeDetail(officeId);
  };

  const handleUnassignEmployee = async (
    employeeId: string,
    employeeName: string
  ) => {
    const confirmed = window.confirm(
      `Unassign ${employeeName} from this office?`
    );
    if (!confirmed) return;

    setOfficeActionError('');
    setOfficeActionMessage('');
    setUnassigningEmployeeId(employeeId);

    try {
      const result = await unassignEmployeeFromOffice(employeeId);
      setOfficeActionMessage(result.message);
      await refetch();
      if (selectedOfficeId) await refetchOfficeDetail(selectedOfficeId);
    } catch (err) {
      setOfficeActionError(
        err instanceof Error ? err.message : 'Failed to unassign employee.'
      );
    } finally {
      setUnassigningEmployeeId(null);
    }
  };

  const isLoadingAny =
    isRefreshing || isOfficesLoading || isLocationsLoading;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-10"
    >
      {/* Platform styled global styles for Leaflet custom adaptations */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          font-family: inherit !important;
          z-index: 1 !important;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
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
      `}} />

      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="heading-1">Live Location</h1>
          <p className="text-page-desc mt-1 max-w-2xl">
            Monitor employee locations, office geofences, and geofence activity
            across your organization in real time.
          </p>
        </div>

        {/* Tab switcher & refreshing */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-surface-variant p-1 rounded-2xl border border-border flex">
            <button
              onClick={() => setActiveTab('editor')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'editor' ? "bg-surface text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              Perimeter Editor
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'tracker' ? "bg-surface text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              Live Tracker
            </button>
          </div>

          {activeTab === 'tracker' && (
            <>
              <button
                type="button"
                onClick={() => setIsAutoRefreshing((prev) => !prev)}
                className={cn(
                  'btn-secondary flex items-center gap-2 text-sm',
                  isAutoRefreshing && 'border-primary/25 bg-primary/5 text-primary'
                )}
              >
                {isAutoRefreshing ? <Pause size={16} /> : <Play size={16} />}
                {isAutoRefreshing ? 'Pause live' : 'Resume live'}
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoadingAny}
                className="p-3 rounded-xl bg-surface-variant hover:bg-border text-text-primary transition-all disabled:opacity-60"
                title="Refresh data"
              >
                <RefreshCw
                  size={18}
                  className={cn(isLoadingAny && 'animate-spin')}
                />
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Global alert feedback */}
      {(officeActionMessage || officeActionError || officesError || locationsError) && (
        <motion.div variants={itemVariants} className="space-y-2">
          {officeActionMessage && (
            <div className="rounded-2xl bg-success/10 border border-success/20 px-4 py-3 text-sm font-semibold text-success flex items-center gap-2">
              <ShieldCheck size={16} />
              {officeActionMessage}
            </div>
          )}
          {(officeActionError || officesError || locationsError) && (
            <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-semibold text-error flex items-center gap-2">
              <ShieldAlert size={16} />
              {officeActionError || officesError || locationsError}
            </div>
          )}
        </motion.div>
      )}

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'editor' ? (
        /* GEOFENCE PERIMETER EDITOR VIEW (MATCHES SCREENSHOT) */
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
        >
          {/* Left Panel: Form & List */}
          <div className="xl:col-span-4 space-y-6">
            {/* Left Card 1: New Perimeter Form */}
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h3 className="heading-2 font-bold text-text-primary">
                  {selectedOfficeId ? 'Edit Perimeter' : 'New Perimeter'}
                </h3>
                {selectedOfficeId && (
                  <button
                    type="button"
                    onClick={handleResetEditor}
                    className="text-micro font-black text-primary hover:text-primary-dark uppercase tracking-widest"
                  >
                    New Perimeter
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveGeofence} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-micro font-black uppercase tracking-wider text-text-secondary ml-1">Site Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Thane Office"
                    value={siteNameInput}
                    onChange={(e) => setSiteNameInput(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-variant border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold text-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-micro font-black uppercase tracking-wider text-text-secondary ml-1">Latitude</label>
                    <input
                      type="text"
                      placeholder="e.g. 19.187053"
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                      onBlur={handleCoordsSubmit}
                      className="w-full px-4 py-3 bg-surface-variant border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold text-text-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-micro font-black uppercase tracking-wider text-text-secondary ml-1">Longitude</label>
                    <input
                      type="text"
                      placeholder="e.g. 72.977937"
                      value={lngInput}
                      onChange={(e) => setLngInput(e.target.value)}
                      onBlur={handleCoordsSubmit}
                      className="w-full px-4 py-3 bg-surface-variant border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold text-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-micro font-black uppercase tracking-wider text-text-secondary ml-1">
                    <span>Radius (Meters)</span>
                    <span className="text-primary font-black">{radiusInput}m</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="25"
                    value={radiusInput}
                    onChange={(e) => setRadiusInput(Number(e.target.value))}
                    className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Geo-fence'
                  )}
                </button>
              </form>
            </div>

            {/* Left Card 2: Configured Fences Card */}
            <div className="glass-card p-6 space-y-4">
              <h4 className="heading-2 font-bold text-text-primary border-b border-border/50 pb-2">
                Configured Fences
              </h4>

              {isOfficesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-surface-variant animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : offices.length === 0 ? (
                <div className="text-center py-6 text-xs font-semibold text-muted">
                  No perimeters configured yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {offices.map((off) => {
                    const isActive = selectedOfficeId === off.id.toString();
                    return (
                      <div
                        key={off.id}
                        onClick={() => handleSelectOfficeFence(off)}
                        className={cn(
                          "p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group",
                          isActive
                            ? "bg-primary/5 border-primary shadow-sm text-primary"
                            : "bg-surface-variant border-transparent hover:bg-surface hover:border-border text-text-primary"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 size={16} className={cn(isActive ? "text-primary" : "text-muted group-hover:text-primary transition-colors")} />
                          <div>
                            <p className="text-sm font-bold tracking-tight">{off.name}</p>
                            <p className={cn("text-[10px] mt-0.5", isActive ? "text-primary/80 font-medium" : "text-text-secondary")}>
                              {off.maxPunchRadiusMeters}m perimeter
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOffice(off);
                          }}
                          className="text-[10px] font-black uppercase text-error hover:text-error-dark opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 hover:bg-error/10 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Leaflet Interactive Map View */}
          <div className="xl:col-span-8">
            <div className="glass-card overflow-hidden flex flex-col relative h-[500px] xl:h-[620px]">
              {/* Header Bar */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur z-[5] relative shrink-0">
                <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary animate-bounce" />
                  Click anywhere to position the new center
                </p>
                <span className="bg-success/15 border border-success/35 text-success text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Live Editor
                </span>
              </div>

              {/* Autocomplete Address geocoder absolute positioned */}
              <form
                onSubmit={handleAddressSearch}
                className="absolute top-[76px] left-4 z-[10] w-[280px] sm:w-[360px] bg-surface/95 backdrop-blur border border-border shadow-xl rounded-2xl flex items-center p-1"
              >
                <input
                  type="text"
                  placeholder="Search address (e.g. Thane, Kalyan)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-semibold outline-none text-text-primary placeholder:text-muted"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  {isSearching ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                </button>
              </form>

              {/* Leaflet map container */}
              <div className="flex-1 min-h-0 relative">
                {!leafletLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-variant animate-pulse">
                    <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                    <span className="text-xs font-black uppercase tracking-widest text-text-secondary">Loading street maps...</span>
                  </div>
                )}
                <div id="leaflet-map" className="w-full h-full" style={{ zIndex: 1 }} />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* LIVE TELEMETRY TRACKER VIEW (ORIGINAL FULL FEATURE SET) */
        <>
          <motion.div variants={itemVariants}>
            <LocationStatsBar
              activeStaff={activeStaff}
              inOfficeCount={inOfficeCount}
              breachesCount={breachesCount}
              officeCount={offices.length}
              isLive={isAutoRefreshing}
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
          >
            <div className="xl:col-span-4 xl:sticky xl:top-4">
              <OfficeSidebar
                offices={offices}
                selectedOfficeId={selectedOfficeId}
                onSelectOffice={setSelectedOfficeId}
                onAddOffice={() => setIsCreateOfficeOpen(true)}
                onEditOffice={setEditingOffice}
                onDeleteOffice={handleDeleteOffice}
                isDeletingOfficeId={isDeletingOfficeId}
                isLoading={isOfficesLoading}
                assignedEmployees={assignedEmployees}
                assignedCount={assignedCount}
                isOfficeDetailLoading={isOfficeDetailLoading}
                officeDetailError={officeDetailError}
                onRetryOfficeDetail={() =>
                  selectedOfficeId && refetchOfficeDetail(selectedOfficeId)
                }
                onAssignEmployee={() => setIsAssignEmployeeOpen(true)}
                onUnassignEmployee={handleUnassignEmployee}
                unassigningEmployeeId={unassigningEmployeeId}
                selectedOfficeName={selectedOffice?.name}
              />
            </div>

            <div className="xl:col-span-8 space-y-6">
              <LocationMapView
                employees={filteredLocations}
                selectedEmpId={selectedEmpId}
                onSelectEmployee={setSelectedEmpId}
                officeCenter={officeCenter}
                mapBounds={mapBounds}
                geofenceRadius={geofenceRadius}
                officeName={selectedOffice?.name}
                isLive={isAutoRefreshing}
              />

              <EmployeeDetailCard
                employee={selectedEmployee}
                onClose={() => setSelectedEmpId(null)}
                onForceBreach={handleManualBreachTrigger}
                onRecallToOffice={handleManualOfficeTrigger}
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-7">
              <LocationRoster
                employees={filteredLocations}
                selectedEmpId={selectedEmpId}
                onSelectEmployee={setSelectedEmpId}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </div>
            <div className="lg:col-span-5">
              <ActivityFeed logs={logs} onClear={handleClearLogs} />
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
        </>
      )}
    </motion.div>
  );
}
