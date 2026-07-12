import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const getPosition = useCallback(async (successCallback?: (coords: GeolocationCoords) => void) => {
    setStatus('loading');
    setErrorCode(null);

    // 1. Check window.isSecureContext
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const msg = `Location access requires a secure connection (HTTPS or localhost). Current URL scheme: ${window.location.protocol}`;
      console.error(msg);
      setStatus('error');
      toast.error(msg);
      return;
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      console.error(msg);
      setStatus('error');
      toast.error(msg);
      return;
    }

    // 2. Check Permission Status
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (permissionStatus.state === 'denied') {
          const msg = 'Location access is blocked by browser settings. Please click the site settings/lock icon in your URL bar and allow location access.';
          console.error('Permission state: denied');
          setStatus('error');
          toast.error(msg);
          return;
        }
      }
    } catch (e) {
      console.warn('Permission query not supported or failed', e);
    }

    const optionsHigh = { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 };
    const optionsLow = { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 };

    const handleSuccess = (position: GeolocationPosition) => {
      const gotCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(gotCoords);
      setStatus('success');
      if (successCallback) {
        successCallback(gotCoords);
      }
    };

    const handleFailure = (error: GeolocationPositionError, isHighAccuracy: boolean) => {
      console.error(`Geolocation error (HighAccuracy=${isHighAccuracy}): Code ${error.code} - ${error.message}`);
      
      if (isHighAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
        console.warn('Retrying with standard accuracy (enableHighAccuracy=false)...');
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (lowError) => {
            console.error(`Geolocation fallback error: Code ${lowError.code} - ${lowError.message}`);
            setErrorCode(lowError.code);
            setStatus('error');
            
            let message = 'Failed to get location. Please enter manually.';
            if (lowError.code === lowError.PERMISSION_DENIED) {
              message = 'Location access denied. Please enable location permissions in browser settings or enter manually.';
            } else if (lowError.code === lowError.POSITION_UNAVAILABLE) {
              message = 'Location information is unavailable. Please enter manually.';
            } else if (lowError.code === lowError.TIMEOUT) {
              message = 'Location request timed out. Please enter manually.';
            }
            toast.error(message);
          },
          optionsLow
        );
      } else {
        setErrorCode(error.code);
        setStatus('error');
        
        let message = 'Failed to get location. Please enter manually.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location access blocked. Please allow location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable. Please enter manually.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Please enter manually.';
        }
        toast.error(message);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => handleSuccess(pos),
      (err) => handleFailure(err, true),
      optionsHigh
    );
  }, []);

  return { coords, status, errorCode, getPosition };
}
