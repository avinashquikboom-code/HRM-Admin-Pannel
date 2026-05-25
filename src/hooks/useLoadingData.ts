"use client";

import { useState, useEffect } from 'react';

/**
 * A custom hook to simulate data loading with a specified delay.
 * Useful for handling initial page transition states and showing skeletons.
 * 
 * @param delay - The delay in milliseconds before setting isLoading to false. Defaults to 800ms.
 * @returns { isLoading: boolean }
 */
export const useLoadingData = (delay: number = 800) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return { isLoading };
};
