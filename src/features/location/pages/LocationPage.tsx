'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pause, Play, RefreshCw, Building2, MapPin, Globe, ShieldAlert, ShieldCheck, Search, Sliders, Navigation, Activity, Users } from 'lucide-react';
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
import InlineAssignForm from '@/features/location/components/InlineAssignForm';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'sonner';
import LocationStatsBar from '@/features/location/components/LocationStatsBar';
import OfficeSidebar from '@/features/location/components/OfficeSidebar';
import LocationMapView from '@/features/location/components/LocationMapView';
import EmployeeDetailCard from '@/features/location/components/EmployeeDetailCard';
import LocationRoster from '@/features/location/components/LocationRoster';
import ActivityFeed from '@/features/location/components/ActivityFeed';
import { useLocationSimulation } from '@/features/location/hooks/useLocationSimulation';
import type { LocationStatusFilter } from '@/features/location/types';
import SuperAdminHeader from '@/components/SuperAdminHeader';

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
  const [unassigningEmployee, setUnassigningEmployee] = useState<{ id: string, name: string } | null>(null);
  const [deletingOffice, setDeletingOffice] = useState<Office | null>(null);
  const [isInlineAssignOpen, setIsInlineAssignOpen] = useState(false);
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
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [radiusInput, setRadiusInput] = useState(25);
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
        : offices.length > 0
          ? { lat: offices[0].latitude, lng: offices[0].longitude }
          : { lat: 0, lng: 0 },
    [selectedOffice, offices]
  );

  const mapBounds = useMemo(
    () =>
      selectedOffice
        ? getMapBoundsForOffice(
          selectedOffice.latitude,
          selectedOffice.longitude,
          selectedOffice.maxPunchRadiusMeters
        )
        : offices.length > 0
          ? getMapBoundsForOffice(
            offices[0].latitude,
            offices[0].longitude,
            offices[0].maxPunchRadiusMeters
          )
          : null,
    [selectedOffice, offices]
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [logsCount, setLogsCount] = useState(0);

  const loadTelemetryLogs = useCallback(async (page: number = 1) => {
    try {
      const data = await fetchLiveLocationLogs(page, 20);
      setLogs(data.logs);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setLogsCount(data.count);
    } catch (err) {
      console.warn('[Telemetry Logs Fetch Error]:', err);
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
      console.warn('Clear logs error:', err);
    }
  };

  const handleManualBreachTrigger = () => { };
  const handleManualOfficeTrigger = () => { };

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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !document.getElementById('leaflet-map') || mapInstance || activeTab !== 'editor') return;

    const L = (window as any).L;

    // Use first office from database as default, or empty inputs
    const defaultLat = offices.length > 0 ? offices[0].latitude : (parseFloat(latInput) || 0);
    const defaultLng = offices.length > 0 ? offices[0].longitude : (parseFloat(lngInput) || 0);
    const defaultZoom = offices.length > 0 ? 14 : 2;

    const map = L.map('leaflet-map', {
      zoomControl: false
    }).setView([defaultLat, defaultLng], defaultZoom);

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
      color: '#0d9488',
      fillColor: '#0d9488',
      fillOpacity: 0.2,
      weight: 3,
      dashArray: '5, 5',
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

    return () => {
      map.remove();
      setMapInstance(null);
      setMarkerInstance(null);
      setCircleInstance(null);
    };
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

    // Helper to query Nominatim
    const queryNominatim = async (q: string): Promise<any[]> => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'HRM-Portal'
            }
          }
        );
        return await res.json();
      } catch (err) {
        console.error('Nominatim fetch failed for query:', q, err);
        return [];
      }
    };

    try {
      // 1. Try raw query first
      let data = await queryNominatim(searchQuery);

      // 2. If it fails, try a cleaned up query (remove flat/floor numbers and abbreviations)
      if (!data || data.length === 0) {
        let cleaned = searchQuery;
        cleaned = cleaned.replace(/\b\d{2,4}\b,?/g, ''); // Remove small numbers like 603,
        cleaned = cleaned.replace(/(flat|room|office|shop|floor|suite|unit|sector)\b\s*\d*/gi, '');
        cleaned = cleaned.replace(/\s*-\s*/g, ' '); // Replace " - " with space
        cleaned = cleaned.replace(/\bRd\b/gi, 'Road');
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        if (cleaned && cleaned !== searchQuery) {
          data = await queryNominatim(cleaned);
        }
      }

      // 3. If it still fails, iteratively drop specific parts from the front of comma-separated address
      if (!data || data.length === 0) {
        const parts = searchQuery.split(',').map(p => p.trim()).filter(Boolean);
        // If we have "Kamdhenu 23 West, 603, Thane - Belapur Rd, TTC Industrial Area, Kopar Khairane..."
        // try successive fallbacks:
        // - Thane - Belapur Rd, TTC Industrial Area, Kopar Khairane...
        // - TTC Industrial Area, Kopar Khairane...
        // - Kopar Khairane, Navi Mumbai...
        for (let i = 1; i < parts.length - 1; i++) {
          const fallbackQuery = parts.slice(i).join(', ').replace(/\s*-\s*/g, ' ').replace(/\bRd\b/gi, 'Road');
          if (fallbackQuery.length > 5) {
            data = await queryNominatim(fallbackQuery);
            if (data && data.length > 0) {
              console.log(`Geocoding succeeded with fallback query: "${fallbackQuery}"`);
              break;
            }
          }
        }
      }

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
        toast.error('Location not found. Try simplifying the address (e.g., "Kopar Khairane, Navi Mumbai" or "Connaught Place, Delhi").');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      toast.error('Failed to geocode address. Please check your connection and try again.');
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
    setLatInput('');
    setLngInput('');
    setRadiusInput(25);
    setSearchQuery('');
    setOfficeActionMessage('');
    setOfficeActionError('');

    if (mapInstance && markerInstance && circleInstance) {
      // Reset to first office or world view
      if (offices.length > 0) {
        const firstOffice = offices[0];
        mapInstance.setView([firstOffice.latitude, firstOffice.longitude], 14);
        markerInstance.setLatLng([firstOffice.latitude, firstOffice.longitude]);
        circleInstance.setLatLng([firstOffice.latitude, firstOffice.longitude]);
        circleInstance.setRadius(25);
      } else {
        mapInstance.setView([0, 0], 2);
        markerInstance.setLatLng([0, 0]);
        circleInstance.setLatLng([0, 0]);
        circleInstance.setRadius(25);
      }
    }
  };

  // Submit perimeter save / update to database
  const handleSaveGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteNameInput.trim()) {
      toast.error('Site Name is required.');
      return;
    }

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Latitude and Longitude must be valid numbers.');
      return;
    }

    setIsSaving(true);

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
        toast.success(result.message || 'Geo-fence updated successfully!');
      } else {
        const result = await createOffice(payload);
        toast.success(result.message || 'Geo-fence created successfully!');
        setSelectedOfficeId(result.office.id);
      }
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save operation failed.');
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
    toast.success(message);
    setSelectedOfficeId(officeId);
    await refetch();
    await refetchOfficeDetail(officeId);
  };

  const handleOfficeUpdated = async (officeId: string, message: string) => {
    toast.success(message);
    setSelectedOfficeId(officeId);
    await refetch();
    await refetchOfficeDetail(officeId);
  };

  const handleDeleteOffice = (office: Office) => {
    setDeletingOffice(office);
  };

  const executeDeleteOffice = async () => {
    if (!deletingOffice) return;
    const office = deletingOffice;

    setOfficeActionError('');
    setOfficeActionMessage('');
    setIsDeletingOfficeId(office.id);

    try {
      const result = await deleteOffice(office.id);
      toast.success(result.message || 'Office deleted successfully!');

      const updatedOffices = await refetch();

      if (selectedOfficeId === office.id) {
        const remaining = updatedOffices?.filter((o: Office) => o.id !== office.id) ?? [];
        setSelectedOfficeId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete office.'
      );
    } finally {
      setIsDeletingOfficeId(null);
      setDeletingOffice(null);
    }
  };

  const handleEmployeeAssigned = async (message: string, officeId: string) => {
    toast.success(message);
    await refetch();
    await refetchOfficeDetail(officeId);
  };

  const handleUnassignEmployee = (
    employeeId: string,
    employeeName: string
  ) => {
    setUnassigningEmployee({ id: employeeId, name: employeeName });
  };

  const executeUnassignEmployee = async () => {
    if (!unassigningEmployee) return;
    const { id: employeeId } = unassigningEmployee;

    setOfficeActionError('');
    setOfficeActionMessage('');
    setUnassigningEmployeeId(employeeId);

    try {
      const result = await unassignEmployeeFromOffice(employeeId);
      toast.success(result.message || 'Employee unassigned successfully!');
      await refetch();
      if (selectedOfficeId) await refetchOfficeDetail(selectedOfficeId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to unassign employee.'
      );
    } finally {
      setUnassigningEmployeeId(null);
      setUnassigningEmployee(null);
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
      <style dangerouslySetInnerHTML={{
        __html: `
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

      <SuperAdminHeader
        title="Live Location"
        subtitle="Monitor employee locations, office geofences, and geofence activity across your organization in real time."
        badgeText="Geofence Management"
        badgeIcon={MapPin}
        stats={[
          { label: 'Total Offices', value: offices.length.toString(), icon: Building2 },
          { label: 'Active Employees', value: locations.length.toString(), icon: Users },
          { label: 'In Office', value: locations.filter(l => l.status === 'In Office').length.toString(), icon: ShieldCheck },
          { label: 'Outside Geofence', value: locations.filter(l => l.status === 'Outside Geofence').length.toString(), icon: Activity }
        ]}
      >

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
              className="p-3 rounded-sm bg-surface-variant hover:bg-border text-text-primary transition-all disabled:opacity-60"
              title="Refresh data"
            >
              <RefreshCw
                size={18}
                className={cn(isLoadingAny && 'animate-spin')}
              />
            </button>
          </>
        )}
      </SuperAdminHeader>

      {/* Tab-scoped alert feedback.
          Office errors belong to the editor tab; live-location (telemetry)
          errors belong to the tracker tab, so messages never bleed across screens. */}
      {(() => {
        const scopedError =
          activeTab === 'editor'
            ? officeActionError || officesError
            : locationsError;
        if (!officeActionMessage && !scopedError) return null;
        return (
          <motion.div variants={itemVariants} className="space-y-2">
            {officeActionMessage && (
              <div className="rounded-sm bg-success/10 border border-success/20 px-4 py-3 text-sm font-semibold text-success flex items-center gap-2">
                <ShieldCheck size={16} />
                {officeActionMessage}hhhhhhs
              </div>
            )}
            {scopedError && (
              <div className="rounded-sm bg-error/10 border border-error/20 px-4 py-3 text-sm font-semibold text-error flex items-center gap-2">
                <ShieldAlert size={16} />
                {scopedError}
              </div>
            )}
          </motion.div>
        );
      })()}

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
            <div className="bg-surface border border-border rounded-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h3 className="heading-2 font-bold text-text-primary">
                    {selectedOfficeId ? 'Edit Perimeter' : 'New Perimeter'}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Create physical office locations with geofencing for employee attendance tracking
                  </p>
                </div>
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
                    className="w-full px-4 py-3 bg-surface-variant border border-transparent rounded-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold text-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-micro font-black uppercase tracking-wider text-text-secondary ml-1">Latitude</label>
                    <input
                      type="text"
                      placeholder="Enter latitude"
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                      onBlur={handleCoordsSubmit}
                      className="w-full px-4 py-3 bg-surface-variant border border-transparent rounded-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold text-text-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-micro font-black uppercase tracking-wider text-text-secondary ml-1">Longitude</label>
                    <input
                      type="text"
                      placeholder="Enter longitude"
                      value={lngInput}
                      onChange={(e) => setLngInput(e.target.value)}
                      onBlur={handleCoordsSubmit}
                      className="w-full px-4 py-3 bg-surface-variant border border-transparent rounded-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold text-text-primary"
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
                    min="25"
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
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-sm font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
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
            <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
              <h4 className="heading-2 font-bold text-text-primary border-b border-border/50 pb-2">
                Configured Fences
              </h4>

              {isOfficesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-surface-variant animate-pulse rounded-sm" />
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
                          "p-4 rounded-sm border cursor-pointer transition-all flex items-center justify-between group",
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

            {/* Left Card 3: Assign Staff Card */}
            {selectedOfficeId && (
              <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <h4 className="heading-2 font-bold text-text-primary">
                    Assign Staff
                  </h4>
                  {!isInlineAssignOpen && (
                    <button
                      type="button"
                      onClick={() => setIsInlineAssignOpen(true)}
                      className="text-micro font-black text-primary hover:text-primary-dark uppercase tracking-widest"
                    >
                      + Assign
                    </button>
                  )}
                  {isInlineAssignOpen && (
                    <button
                      type="button"
                      onClick={() => setIsInlineAssignOpen(false)}
                      className="text-micro font-black text-error hover:text-error-dark uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isInlineAssignOpen ? (
                  <InlineAssignForm
                    officeId={selectedOfficeId}
                    officeName={selectedOffice?.name ?? 'Selected office'}
                    onAssigned={handleEmployeeAssigned}
                    onCancel={() => setIsInlineAssignOpen(false)}
                  />
                ) : isOfficeDetailLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-surface-variant animate-pulse rounded-sm" />
                    ))}
                  </div>
                ) : assignedEmployees.length === 0 ? (
                  <div className="text-center py-6 text-xs font-semibold text-muted">
                    No staff assigned to this perimeter.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {assignedEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-3 rounded-sm border border-border/50 bg-surface-variant/50 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-primary">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[10px] text-text-secondary">{emp.employeeCode}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnassignEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)}
                          className="text-[10px] font-black uppercase text-error hover:text-error-dark opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 hover:bg-error/10 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Leaflet Interactive Map View */}
          <div className="xl:col-span-8">
            <div className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col relative h-[500px] xl:h-[620px]">
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

              {/* Autocomplete Address geocoder absolute positioned - Commented out for now */}
              {/* <form
                onSubmit={handleAddressSearch}
                className="absolute top-[76px] left-4 z-[10] w-[280px] sm:w-[360px] bg-surface/95 backdrop-blur border border-border shadow-xl rounded-sm flex items-center p-1"
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
                  className="p-2.5 bg-primary text-white rounded-sm hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  {isSearching ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                </button>
              </form> */}

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
        /* LIVE TELEMETRY TRACKER VIEW (SIMPLIFIED - NO OFFICES SECTION) */
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
            <div className="xl:col-span-12 space-y-6">
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
              <ActivityFeed
                logs={logs}
                onClear={handleClearLogs}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => loadTelemetryLogs(page)}
              />
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

          <ConfirmModal
            isOpen={!!deletingOffice}
            onClose={() => setDeletingOffice(null)}
            onConfirm={executeDeleteOffice}
            title={`Delete ${deletingOffice?.name}?`}
            message={`Are you sure you want to delete ${deletingOffice?.name}? This action cannot be undone.`}
            confirmText="Delete Office"
          />

          <ConfirmModal
            isOpen={!!unassigningEmployee}
            onClose={() => setUnassigningEmployee(null)}
            onConfirm={executeUnassignEmployee}
            title={`Unassign ${unassigningEmployee?.name}?`}
            message={`Are you sure you want to unassign ${unassigningEmployee?.name} from this office?`}
            confirmText="Unassign"
          />
        </>
      )}
    </motion.div>
  );
}
