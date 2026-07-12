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

  const getPosition = useCallback(async (successCallback?: (coords: GeolocationCoords) => void | Promise<void>) => {
    setStatus('loading');
    setErrorCode(null);

    // Only block if not secure AND not localhost/dev
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (typeof window !== 'undefined' && !window.isSecureContext && !isLocalhost) {
      const msg = `Location access requires HTTPS. Current scheme: ${window.location.protocol}`;
      console.error(msg);
      setStatus('idle');
      toast.error(msg);
      return;
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      console.error(msg);
      setStatus('idle');
      toast.error(msg);
      return;
    }

    // Check permission state
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (permissionStatus.state === 'denied') {
          const msg = 'Location access is blocked. Click the lock icon in your URL bar → Site Settings → Allow Location.';
          console.error('Permission state: denied');
          setStatus('idle');
          toast.error(msg);
          return;
        }
      }
    } catch (e) {
      console.warn('Permission query not supported or failed', e);
    }

    const optionsHigh: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
    const optionsLow: PositionOptions = { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 };

    // Await the async successCallback properly
    const handleSuccess = async (position: GeolocationPosition) => {
      const gotCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(gotCoords);
      setStatus('success');
      if (successCallback) {
        try {
          await successCallback(gotCoords);
        } catch (cbErr) {
          console.error('Error inside successCallback:', cbErr);
        }
      }
    };

    // Last resort: approximate location from the network IP address.
    // Works on desktops without GPS where the browser reports POSITION_UNAVAILABLE.
    const tryIpFallback = async (): Promise<boolean> => {
      const providers = [
        async () => {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            return { latitude: data.latitude, longitude: data.longitude };
          }
          return null;
        },
        async () => {
          const res = await fetch('https://ipwho.is/');
          const data = await res.json();
          if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            return { latitude: data.latitude, longitude: data.longitude };
          }
          return null;
        },
      ];

      for (const provider of providers) {
        try {
          const gotCoords = await provider();
          if (gotCoords) {
            setCoords(gotCoords);
            setStatus('success');
            toast.warning('Using approximate location based on your network. Verify and adjust if needed.');
            if (successCallback) {
              try {
                await successCallback(gotCoords);
              } catch (cbErr) {
                console.error('Error inside successCallback:', cbErr);
              }
            }
            return true;
          }
        } catch (e) {
          console.warn('IP geolocation provider failed, trying next...', e);
        }
      }
      return false;
    };

    const showError = async (error: GeolocationPositionError) => {
      console.error(`Geolocation error Code=${error.code}: ${error.message}`);
      setErrorCode(error.code);

      // Permission denied is a user choice — don't silently fall back to IP.
      if (error.code !== error.PERMISSION_DENIED) {
        const recovered = await tryIpFallback();
        if (recovered) return;
      }

      // Reset to 'idle' so button becomes clickable again for retry
      setStatus('idle');

      if (error.code === error.PERMISSION_DENIED) {
        toast.error('Location access denied. Allow location access in browser settings and try again.');
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        toast.error('Could not detect location. Please enter latitude and longitude manually.');
      } else if (error.code === error.TIMEOUT) {
        toast.error('Location request timed out. Please try again or enter manually.');
      } else {
        toast.error('Failed to get location. Please enter manually.');
      }
    };

    // First attempt: high accuracy (GPS on mobile, may fail on desktop)
    navigator.geolocation.getCurrentPosition(
      (pos) => handleSuccess(pos),
      (highErr) => {
        console.warn(`High-accuracy failed (code ${highErr.code}), retrying with low accuracy...`);
        // Second attempt: low accuracy (network/IP-based — works on desktop)
        navigator.geolocation.getCurrentPosition(
          (pos) => handleSuccess(pos),
          (lowErr) => showError(lowErr),
          optionsLow
        );
      },
      optionsHigh
    );
  }, []);

  return { coords, status, errorCode, getPosition };
}
