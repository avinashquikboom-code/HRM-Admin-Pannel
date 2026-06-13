'use client';

import { motion } from 'framer-motion';
import { Calendar, CheckSquare, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { EMPLOYEE_PREFIX } from '@/lib/portals';

const quickLinks = [
  { label: 'Attendance', icon: CreditCard, path: `${EMPLOYEE_PREFIX}/attendance` },
  { label: 'Leave', icon: Calendar, path: `${EMPLOYEE_PREFIX}/leave` },
  { label: 'Tasks', icon: CheckSquare, path: `${EMPLOYEE_PREFIX}/tasks` },
];

export default function EmployeeHomePage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="heading-1">My Dashboard</h1>
        <p className="text-page-desc mt-1">
          Welcome back — view your attendance, leave, and assigned tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <motion.div key={link.path} whileHover={{ y: -2 }}>
            <Link
              href={link.path}
              className="glass-card p-5 flex items-center gap-4 hover:border-accent/40 transition-colors"
            >
              <div className="w-11 h-11 rounded-sm bg-accent/15 text-secondary flex items-center justify-center">
                <link.icon size={22} />
              </div>
              <span className="font-semibold text-text-primary">{link.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
