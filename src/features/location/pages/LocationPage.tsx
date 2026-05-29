'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useOffices } from '@/hooks/useOffices';
import { useOfficeDetail } from '@/hooks/useOfficeDetail';
import { useLiveLocations } from '@/hooks/useLiveLocations';
import {
  deleteOffice,
  getMapBoundsForOffice,
  metersToDegreeRadius,
  type Office,
} from '@/services/officeService';
import { unassignEmployeeFromOffice } from '@/services/employeeService';
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

  const {
    logs,
    setLogs,
    handleManualBreachTrigger,
    handleManualOfficeTrigger,
  } = useLocationSimulation({
    isAutoRefreshing,
    geofenceRadius,
    radarSpeed: 1,
    officeCenter,
    mapBounds,
    setLocations,
    initialLocations: locations,
  });

  useEffect(() => {
    if (offices.length > 0 && selectedOfficeId === null) {
      setSelectedOfficeId(offices[0].id);
    }
  }, [offices, selectedOfficeId]);

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
      if (selectedOfficeId === office.id) setSelectedOfficeId(null);
      await refetch();
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
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAutoRefreshing((prev) => !prev)}
            className={cn(
              'btn-secondary flex items-center gap-2 text-sm',
              isAutoRefreshing && 'border-primary/25 bg-primary/5 text-primary'
            )}
          >
            {isAutoRefreshing ? (
              <>
                <Pause size={16} />
                Pause live
              </>
            ) : (
              <>
                <Play size={16} />
                Resume live
              </>
            )}
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
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <LocationStatsBar
          activeStaff={activeStaff}
          inOfficeCount={inOfficeCount}
          breachesCount={breachesCount}
          officeCount={offices.length}
          isLive={isAutoRefreshing}
        />
      </motion.div>

      {(officesError || locationsError) && (
        <motion.div variants={itemVariants} className="space-y-2">
          {officesError && (
            <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
              {officesError}
            </div>
          )}
          {locationsError && (
            <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
              {locationsError}
            </div>
          )}
        </motion.div>
      )}

      {(officeActionMessage || officeActionError) && (
        <motion.div variants={itemVariants} className="space-y-2">
          {officeActionMessage && (
            <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
              {officeActionMessage}
            </div>
          )}
          {officeActionError && (
            <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
              {officeActionError}
            </div>
          )}
        </motion.div>
      )}

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
          <ActivityFeed logs={logs} onClear={() => setLogs([])} />
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
