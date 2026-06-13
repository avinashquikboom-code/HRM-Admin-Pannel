"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getAuthSession } from '@/lib/authStorage';
import { portalForRole } from '@/lib/portals';
import RegisterUserWithRights from '@/features/access-control/components/RegisterUserWithRights';

const RegisterUserPage = () => {
  const router = useRouter();
  const session = getAuthSession();
  const portal = session?.portal ?? portalForRole(session?.user?.role);

  const isSuperAdmin = portal === 'super_admin';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="p-3 bg-surface border border-border rounded-sm text-text-secondary hover:text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="heading-1 tracking-tight">Register User</h1>
          <p className="text-page-desc mt-1">
            Create an account and assign module rights with checkboxes.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 sm:p-8 lg:p-10"
      >
        <RegisterUserWithRights
          managerPortal={isSuperAdmin ? 'super_admin' : 'platform_admin'}
          registerRole={isSuperAdmin ? 'HR' : 'EMPLOYEE'}
          targetPortal={isSuperAdmin ? 'platform_admin' : 'employee'}
          compact
          allowRoleSelection
        />
      </motion.div>

      <p className="text-center text-text-secondary text-sm">
        Manage default role rights on{' '}
        <Link
          href={isSuperAdmin ? '/super-admin/user-rights' : '/user-rights'}
          className="font-bold text-primary hover:text-primary-dark"
        >
          User Rights page
        </Link>
      </p>
    </div>
  );
};

export default RegisterUserPage;
