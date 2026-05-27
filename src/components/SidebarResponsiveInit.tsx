'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/sidebarSlice';

const DESKTOP_QUERY = '(min-width: 768px)';

export default function SidebarResponsiveInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => dispatch(setSidebarOpen(mq.matches));
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [dispatch]);

  return null;
}
