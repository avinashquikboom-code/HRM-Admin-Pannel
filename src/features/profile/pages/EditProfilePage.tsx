"use client";

import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import PremiumButton from '@/components/PremiumButton';
import FloatingLabelInput from '@/components/FloatingLabelInput';
import { useForm } from 'react-hook-form';
import { fetchEmployees, type AdminEmployee } from '@/services/employeeService';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Info
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { updateAdminProfile, uploadAdminAvatar, removeAdminAvatar, fileToDataUrl } from '@/services/profileService';
import { getProfileBasePath } from '@/lib/portals';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditProfilePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const profileBasePath = getProfileBasePath(pathname);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, isLoading } = useAdminProfile();
  const [submitError, setSubmitError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarMessage, setAvatarMessage] = useState('');
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCustomAvatar = Boolean(profile?.avatarUrl ?? user?.profile?.avatarUrl);
  const avatarSrc = hasCustomAvatar ? user?.avatar : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || profile?.fullName || '',
      email: user?.email || profile?.email || '',
      phone: user?.phone || profile?.phone || '',
      bio: user?.bio || profile?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      setSubmitError('Not authenticated. Please sign in again.');
      return;
    }
    // Load employees for admin overview (optional)
    // This will fetch employee data when the profile page loads
    // and store it in a local state for display.
    // Note: This does not affect the profile update flow.
    // The employee list is rendered below the form.
    // It uses the same API you provided.
    // Errors are logged but do not block profile submission.


    setSubmitError('');

    try {
      const result = await updateAdminProfile(
        {
          fullName: data.name,
          phone: data.phone,
          bio: data.bio,
          email: data.email,
        },
        user
      );

      dispatch(updateUser(result.user));
      router.push(profileBasePath);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to update profile.'
      );
    }
  };

  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5MB.');
      return;
    }

    setAvatarError('');
    setAvatarMessage('');
    setIsAvatarLoading(true);

    try {
      const imageBase64 = await fileToDataUrl(file);
      const result = await uploadAdminAvatar({ imageBase64 }, user);
      dispatch(updateUser(result.user));
      setAvatarMessage(result.message);
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : 'Failed to upload avatar.'
      );
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user) return;

    setAvatarError('');
    setAvatarMessage('');
    setIsAvatarLoading(true);

    try {
      const result = await removeAdminAvatar(user);
      dispatch(updateUser(result.user));
      setAvatarMessage(result.message);
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : 'Failed to remove avatar.'
      );
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const security = profile?.security;

  if (isLoading && !user?.profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full"
        />
        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Admin Profile</title>
        <meta name="description" content="Update your administrative credentials and public profile." />
      </Head>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        variants={containerVariants}
        className="max-w-5xl mx-auto space-y-8 pb-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between bg-surface/50 backdrop-blur-xl p-6 rounded-[32px] border border-border/50 shadow-sm">
          <div className="flex items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(profileBasePath)}
              className="p-3.5 bg-surface border border-border rounded-2xl text-text-secondary hover:text-primary transition-all shadow-sm group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </motion.button>
            <div>
              <h1 className="heading-2">System Identity Configuration</h1>
              <p className="text-sm text-text-secondary font-medium">Update your administrative credentials and public profile.</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {submitError && (
            <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Avatar & Quick Info */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="glass-card p-6 sm:p-8 md:p-10 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                <div className="relative group mb-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-48 h-48 rounded-full bg-surface-variant border-4 border-surface shadow-2xl flex items-center justify-center overflow-hidden relative"
                  >
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={user?.name || 'Admin'} className="w-full h-full object-cover" />
                    ) : (
                      <User size={100} className="text-muted" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {isAvatarLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <Camera size={32} className="text-white" />
                      )}
                    </div>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    disabled={isAvatarLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-4 bg-primary text-white rounded-2xl shadow-xl border-4 border-surface active:scale-95 disabled:opacity-60"
                  >
                    <Camera size={20} />
                  </motion.button>
                </div>

                <h3 className="text-lg font-black text-text-primary mb-1">Administrator Avatar</h3>
                <p className="text-xs text-text-secondary font-medium px-4">
                  This image will be visible across the system for all verified entities.
                </p>

                {avatarError && (
                  <p className="mt-4 text-xs font-bold text-error">{avatarError}</p>
                )}
                {avatarMessage && (
                  <p className="mt-4 text-xs font-bold text-success">{avatarMessage}</p>
                )}

                <div className="flex gap-4 mt-8 w-full">
                  <button
                    type="button"
                    disabled={isAvatarLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all border border-primary/10 uppercase tracking-widest disabled:opacity-60"
                  >
                    {isAvatarLoading ? 'Processing...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    disabled={isAvatarLoading || !hasCustomAvatar}
                    onClick={handleAvatarRemove}
                    className="flex-1 py-3 text-xs font-black text-error bg-error/5 hover:bg-error/10 rounded-xl transition-all border border-error/10 uppercase tracking-widest disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="glass-card p-8 bg-surface-variant/30 border-dashed border-2 border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">Security Status</h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-secondary">2FA Authentication</span>
                    <span className="text-success uppercase">{security?.twoFactorStatus || 'Active'}</span>
                  </li>
                  <li className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-secondary">Last Login</span>
                    <span className="text-text-primary">{security?.lastLoginLocation || '—'}</span>
                  </li>
                  <li className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-secondary">Clearance Level</span>
                    <span className="text-primary uppercase">{security?.clearanceLabel || 'Level 5'}</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            <EmployeeListSection />

            {/* Right Column: Form Fields */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
              <div className="glass-card p-6 sm:p-8 md:p-10 space-y-10">
                <div className="flex items-center gap-4 border-b border-border/50 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-text-primary tracking-tight">Registry Details</h3>
                    <p className="text-xs text-text-secondary font-medium">Verified system information for the controller account.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-2.5">
                    <FloatingLabelInput
                      id="name"
                      label="Full Name"
                      placeholder="e.g. Avinash Magar"
                      register={register}
                      error={errors.name}
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <FloatingLabelInput
                      id="email"
                      label="Email"
                      placeholder="admin@hrm.ai"
                      register={register}
                      error={errors.email}
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <FloatingLabelInput
                      id="phone"
                      label="Phone"
                      placeholder="+91 00000 00000"
                      register={register}
                      error={errors.phone}
                      required
                    />
                    <div className="w-full px-6 py-4.5 bg-surface-variant/30 border-2 border-border/50 rounded-[24px] flex items-center gap-3 text-text-primary font-bold text-sm">
                      <Globe size={20} className="text-primary" />
                      {profile?.timezoneLabel || 'Asia/Kolkata (IST)'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-micro font-black text-muted uppercase tracking-[0.2em] ml-1">Administrative Bio</label>
                <textarea
                  {...register('bio')}
                  rows={5}
                  placeholder="Describe your role and focus areas..."
                  className={cn(
                    "w-full px-6 py-5 bg-surface-variant/50 border-2 border-transparent rounded-[32px] outline-none focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary resize-none",
                    errors.bio && "border-error/50 bg-error/5 focus:ring-error/5"
                  )}
                />
                {errors.bio && <p className="text-micro text-error font-black uppercase tracking-wider ml-1">{errors.bio.message}</p>}
              </div>


            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-5">
              <PremiumButton
                onClick={() => router.push(profileBasePath)}
                type="button"
                variant="secondary"
                className="flex-1"
              >
                Discard Changes
              </PremiumButton>
              <PremiumButton
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                variant="primary"
                className="flex-[2]"
              >
                <Save size={20} />
                Synchronize Profile
              </PremiumButton>
            </motion.div>
          </motion.div>
      </form>

    </motion.div>
    </>
  );
};

// Employee List Section (optional premium view)
import PremiumCard from '@/components/PremiumCard';

function EmployeeListSection() {
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchEmployees()
      .then((data) => {
        setEmployees(data.employees);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load employees');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-sm text-text-secondary">Loading employees...</p>;
  }
  if (error) {
    return <p className="text-sm text-error">{error}</p>;
  }
  return (
    <div className="mt-8 space-y-4">
      <h2 className="heading-2">Employee Directory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <PremiumCard key={emp.id} className="p-4">
            <p className="font-bold text-text-primary">{emp.firstName} {emp.lastName}</p>
            <p className="text-text-secondary">{emp.user?.email ?? emp.employeeCode}</p>
            <p className="text-text-secondary">{emp.designation ?? '—'}</p>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
export default EditProfilePage;
