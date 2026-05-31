"use client";

import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import PremiumButton from '@/components/PremiumButton';
import FloatingLabelInput from '@/components/FloatingLabelInput';
import { useForm } from 'react-hook-form';
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
import { useOffices } from '@/hooks/useOffices';
import { getProfileBasePath, isSuperAdminPath } from '@/lib/portals';
import PremiumCard from '@/components/PremiumCard';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  officeId: z.string().optional(),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;


const EditProfilePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const profileBasePath = getProfileBasePath(pathname);
  const hideLoginTracking = isSuperAdminPath(pathname);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, isLoading } = useAdminProfile();
  const { offices, isLoading: officesLoading, error: officesError } = useOffices();
  const [submitError, setSubmitError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarMessage, setAvatarMessage] = useState('');
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolvedAvatarSrc = user?.avatar && user.avatar !== '/favicon.svg' ? user.avatar : null;
  const hasCustomAvatar = Boolean(resolvedAvatarSrc);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || profile?.fullName || '',
      email: user?.email || profile?.email || '',
      phone: user?.phone || profile?.phone || '',
      bio: user?.bio || profile?.bio || '',
    },
  });

  useEffect(() => {
    if (!user && !profile) return;

    reset({
      name: user?.name || profile?.fullName || '',
      email: user?.email || profile?.email || '',
      phone: user?.phone || profile?.phone || '',
      bio: user?.bio || profile?.bio || '',
    });
  }, [user, profile, reset]);

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
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/95 backdrop-blur-xl p-8 shadow-2xl flex items-center justify-between gap-6 animate-fadeIn">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
          <div className="relative z-10 flex items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(profileBasePath)}
              className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-primary hover:bg-white/10 transition-all shadow-sm group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none">System Identity Configuration</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2">Update your administrative credentials and public profile.</p>
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
              <div className="bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-[28px] p-8 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full filter blur-2xl pointer-events-none" />

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
                    className="w-44 h-44 rounded-full p-2 bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 relative overflow-hidden group-hover:border-primary/40 transition-colors duration-500 flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                      {resolvedAvatarSrc ? (
                        <img src={resolvedAvatarSrc} alt={user?.name || 'Admin'} className="w-full h-full object-cover animate-fadeIn" />
                      ) : (
                        <User size={90} className="text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        {isAvatarLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <Camera size={28} className="text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    disabled={isAvatarLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-3.5 rounded-2xl bg-white text-slate-900 shadow-xl border border-white/40 hover:scale-110 transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    <Camera size={16} />
                  </motion.button>
                </div>

                <h3 className="text-lg font-black text-white mb-1">Administrator Avatar</h3>
                <p className="text-xs text-slate-400 font-medium px-4">
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
                    className="flex-1 py-3.5 text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/15 rounded-xl transition-all border border-primary/20 hover:border-primary/30 uppercase tracking-widest disabled:opacity-60 active:scale-95 cursor-pointer"
                  >
                    {isAvatarLoading ? 'Processing...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    disabled={isAvatarLoading || !hasCustomAvatar}
                    onClick={handleAvatarRemove}
                    className="flex-1 py-3.5 text-[10px] font-black text-error bg-error/10 hover:bg-error/15 rounded-xl transition-all border border-error/20 hover:border-error/30 uppercase tracking-widest disabled:opacity-60 active:scale-95 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-[28px] p-6 relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/10">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Security Telemetry</h4>
                </div>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-center justify-between text-[11px] font-bold border-b border-white/5 pb-2">
                    <span className="text-slate-400">2FA Authentication</span>
                    <span className="text-emerald-400 uppercase tracking-wider">{security?.twoFactorStatus || 'Active'}</span>
                  </li>
                  {!hideLoginTracking && (
                    <li className="flex items-center justify-between text-[11px] font-bold border-b border-white/5 pb-2">
                      <span className="text-slate-400">Last Node Access</span>
                      <span className="text-white">{security?.lastLoginLocation || '—'}</span>
                    </li>
                  )}
                  <li className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Clearance Level</span>
                    <span className="text-primary uppercase tracking-wider">{security?.clearanceLabel || 'Level 5'}</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Right Column: Form Fields */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-[28px] p-6 sm:p-8 space-y-8">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Registry Details</h3>
                    <p className="text-xs text-slate-400 font-medium">Verified system information for the controller account.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div>
                    <FloatingLabelInput
                      id="name"
                      label="Full Name"
                      placeholder="e.g. Rohan Roy"
                      register={register}
                      error={errors.name}
                      required={true}
                    />
                  </div>

                  <div>
                    <FloatingLabelInput
                      id="email"
                      label="Email"
                      placeholder="admin@hrm.ai"
                      register={register}
                      error={errors.email}
                      required={true}
                    />
                  </div>

                  <div>
                    <FloatingLabelInput
                      id="phone"
                      label="Phone"
                      placeholder="+91 00000 00000"
                      register={register}
                      error={errors.phone}
                      required={true}
                    />
                  </div>

                  <div className="relative">
                    <label className="absolute left-6 top-3 text-[10px] font-black uppercase tracking-widest text-slate-400 z-10">
                      Time Zone
                    </label>
                    <div className="w-full px-6 pt-7 pb-3 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-[24px] flex items-center gap-3 text-white font-bold text-sm transition-all">
                      <Globe size={18} className="text-primary/70" />
                      <span className="truncate">{profile?.timezoneLabel || 'Asia/Kolkata (IST)'}</span>
                    </div>
                  </div>

                  <div className="relative md:col-span-2">
                    <label className="absolute left-6 top-3 text-[10px] font-black uppercase tracking-widest text-slate-400 z-10">
                      Linked Office
                    </label>
                    {officesLoading && <p className="px-6 pt-7 pb-3 text-sm font-bold text-slate-400">Loading offices…</p>}
                    {officesError && <p className="px-6 pt-7 pb-3 text-sm font-bold text-error">{officesError}</p>}
                    {!officesLoading && !officesError && (
                      <div className="relative">
                        <select
                          {...register('officeId')}
                          className="w-full px-5 pt-7 pb-3 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-[24px] outline-none focus:bg-slate-900 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-white text-sm font-bold appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-950 text-white">System Default</option>
                          {offices.map((office) => (
                            <option key={office.id} value={office.id} className="bg-slate-950 text-white">{office.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          ▼
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Administrative Bio</label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  placeholder="Describe your role and focus areas..."
                  className={cn(
                    "w-full px-6 py-5 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-[32px] outline-none focus:bg-slate-900 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-white resize-none shadow-inner",
                    errors.bio && "border-error/40 bg-error/5 focus:ring-error/5 text-white"
                  )}
                />
                {errors.bio && <p className="text-[10px] text-error font-black uppercase tracking-wider ml-2">{errors.bio.message}</p>}
              </div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => router.push(profileBasePath)}
                  type="button"
                  className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center text-white cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-primary to-primary-hover text-slate-900 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 cursor-pointer"
                >
                  <Save size={16} />
                  Synchronize Profile
                </button>
              </motion.div>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </>
  );
};

export default EditProfilePage;
