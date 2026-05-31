'use client';

import { useEffect, useRef, useState } from 'react';
import type { EmployeeLiveLocation } from '@/services/locationService';
import type { LocationLog, MapBounds, MapCenter } from '../types';
import { mockLocationLogs as initialLogs } from '@/data/mockData';

function formatLogTime() {
  const now = new Date();
  return now
    .toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', '');
}

interface UseLocationSimulationOptions {
  isAutoRefreshing: boolean;
  geofenceRadius: number;
  radarSpeed: number;
  officeCenter: MapCenter;
  mapBounds: MapBounds;
  setLocations: React.Dispatch<React.SetStateAction<EmployeeLiveLocation[]>>;
  initialLocations: EmployeeLiveLocation[];
}

export function useLocationSimulation({
  isAutoRefreshing,
  geofenceRadius,
  radarSpeed,
  officeCenter,
  mapBounds,
  setLocations,
  initialLocations,
}: UseLocationSimulationOptions) {
  const [logs, setLogs] = useState<LocationLog[]>(initialLogs);
  const prevLocationsRef = useRef<EmployeeLiveLocation[]>(initialLocations);

  useEffect(() => {
    if (!isAutoRefreshing) return;

    const intervalId = setInterval(() => {
      setLocations((prevLocs) => {
        const updated = prevLocs.map((emp) => {
          if (emp.status === 'On Leave') return emp;

          const latJitter = (Math.random() - 0.5) * 0.002 * radarSpeed;
          const lngJitter = (Math.random() - 0.5) * 0.0025 * radarSpeed;

          const nextLat = Math.max(
            mapBounds.minLat + 0.005,
            Math.min(mapBounds.maxLat - 0.005, emp.lat + latJitter)
          );
          const nextLng = Math.max(
            mapBounds.minLng + 0.005,
            Math.min(mapBounds.maxLng - 0.005, emp.lng + lngJitter)
          );

          const dist = Math.sqrt(
            (nextLat - officeCenter.lat) ** 2 + (nextLng - officeCenter.lng) ** 2
          );

          const nextStatus =
            dist > geofenceRadius ? 'Outside Geofence' : 'In Office';

          const prevEmpState = prevLocationsRef.current.find(
            (e) => e.employeeId === emp.employeeId
          );
          if (prevEmpState && prevEmpState.status !== nextStatus) {
            const isBreach = nextStatus === 'Outside Geofence';
            const newLog: LocationLog = {
              id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
              employeeName: emp.name,
              event: isBreach ? 'Geofence Breach' : 'Office Entry',
              description: isBreach
                ? 'Employee moved outside the office geofence'
                : 'Employee returned inside the office geofence',
              timestamp: formatLogTime(),
              coordinates: `${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`,
            };
            setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 19)]);
          }

          const batteryVal = parseInt(emp.battery, 10);
          const nextBattery =
            batteryVal > 5
              ? `${batteryVal - (Math.random() > 0.85 ? 1 : 0)}%`
              : '98%';

          const speedNum =
            nextStatus === 'In Office'
              ? Math.floor(Math.random() * 3)
              : Math.floor(12 + Math.random() * 35);

          return {
            ...emp,
            lat: nextLat,
            lng: nextLng,
            status: nextStatus,
            speed: `${speedNum} km/h`,
            battery: nextBattery,
          };
        });

        prevLocationsRef.current = updated;
        return updated;
      });
    }, 4000);

    return () => clearInterval(intervalId);
  }, [
    geofenceRadius,
    isAutoRefreshing,
    mapBounds,
    officeCenter,
    radarSpeed,
    setLocations,
  ]);

  const appendLog = (log: LocationLog) => {
    setLogs((prev) => [log, ...prev]);
  };

  const handleManualBreachTrigger = (employeeId: number) => {
    setLocations((prev) =>
      prev.map((emp) => {
        if (emp.employeeId !== employeeId) return emp;

        const breachLat = officeCenter.lat + geofenceRadius + 0.015;
        const breachLng = officeCenter.lng + geofenceRadius + 0.015;

        appendLog({
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          employeeName: emp.name,
          event: 'Geofence Breach',
          description: 'Manual test: employee moved outside geofence.',
          timestamp: formatLogTime(),
          coordinates: `${breachLat.toFixed(4)}, ${breachLng.toFixed(4)}`,
        });

        return {
          ...emp,
          lat: breachLat,
          lng: breachLng,
          status: 'Outside Geofence',
          speed: '45 km/h',
        };
      })
    );
  };

  const handleManualOfficeTrigger = (employeeId: number) => {
    setLocations((prev) =>
      prev.map((emp) => {
        if (emp.employeeId !== employeeId) return emp;

        const officeLat = officeCenter.lat + (Math.random() - 0.5) * 0.002;
        const officeLng = officeCenter.lng + (Math.random() - 0.5) * 0.002;

        appendLog({
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          employeeName: emp.name,
          event: 'Office Entry',
          description: 'Manual test: employee returned to office.',
          timestamp: formatLogTime(),
          coordinates: `${officeLat.toFixed(4)}, ${officeLng.toFixed(4)}`,
        });

        return {
          ...emp,
          lat: officeLat,
          lng: officeLng,
          status: 'In Office',
          speed: '0 km/h',
        };
      })
    );
  };

  return {
    logs,
    setLogs,
    handleManualBreachTrigger,
    handleManualOfficeTrigger,
  };
}
