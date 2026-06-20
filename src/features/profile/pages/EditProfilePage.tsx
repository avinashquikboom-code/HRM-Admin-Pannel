"use client";

import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
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
  Info,
  Pencil,
  Shield,
  Fingerprint,
  Loader2,
  X
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
import SuperAdminHeader from '@/components/SuperAdminHeader';

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
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Loading profile...</p>
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
        className="space-y-8 pb-10"
      >
        <SuperAdminHeader
          title="Edit Profile"
          subtitle="Update your administrative credentials and public profile information."
          badgeText="Profile Editor"
          badgeIcon={Pencil}
          stats={[
            { label: 'Profile Status', value: 'Active', icon: ShieldCheck },
            { label: 'Security Level', value: 'Maximum', icon: Shield },
            { label: '2FA Status', value: security?.twoFactorEnabled ? 'Active' : 'Inactive', icon: Fingerprint },
            { label: 'Account Type', value: user?.role?.replace('_', ' ') || 'Super Admin', icon: User }
          ]}
        >
          <button
            onClick={() => router.push(profileBasePath)}
            className="flex items-center gap-2.5 px-5 py-3 bg-surface/80 hover:bg-surface border border-border rounded-sm text-sm font-bold text-text-secondary hover:text-primary transition-all duration-300 hover:shadow-md active:scale-95"
          >
            <ArrowLeft size={18} />
            Back to Profile
          </button>
        </SuperAdminHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {submitError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-sm bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error flex items-center gap-3"
            >
              <X size={18} />
              {submitError}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Avatar & Security */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
              <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />

                <div className="relative mb-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  <div className="w-36 h-36 rounded-full p-1.5 bg-gradient-to-br from-primary/20 to-transparent shadow-2xl border border-white/10 relative overflow-hidden">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                      {resolvedAvatarSrc ? (
                        <img src={resolvedAvatarSrc} alt={user?.name || 'Admin'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <User size={60} className="text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        {isAvatarLoading ? (
                          <Loader2 size={28} className="text-white animate-spin" />
                        ) : (
                          <Camera size={28} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAvatarLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2.5 rounded-sm bg-primary text-white shadow-lg border border-primary/30 hover:scale-110 transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-text-primary mb-1">{user?.name || 'Administrator'}</h3>
                <p className="text-sm text-text-secondary font-medium mb-4">{user?.email || 'admin@example.com'}</p>
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6">
                  <ShieldCheck size={12} />
                  {security?.clearanceLabel || 'Level 5 Clearance'}
                </div>

                {avatarError && (
                  <p className="mb-3 text-xs font-bold text-error">{avatarError}</p>
                )}
                {avatarMessage && (
                  <p className="mb-3 text-xs font-bold text-success">{avatarMessage}</p>
                )}

                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    disabled={isAvatarLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 text-xs font-black text-primary bg-primary/10 hover:bg-primary/15 rounded-sm transition-all border border-primary/20 uppercase tracking-wider disabled:opacity-60 active:scale-95 cursor-pointer"
                  >
                    {isAvatarLoading ? 'Processing...' : 'Upload New'}
                  </button>
                  <button
                    type="button"
                    disabled={isAvatarLoading || !hasCustomAvatar}
                    onClick={handleAvatarRemove}
                    className="flex-1 py-3 text-xs font-black text-error bg-error/10 hover:bg-error/15 rounded-sm transition-all border border-error/20 uppercase tracking-wider disabled:opacity-60 active:scale-95 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-sm bg-accent/10 text-accent border border-accent/10">
                    <Shield size={18} />
                  </div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Security Info</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-sm bg-surface-variant/50 border border-border/50">
                    <span className="text-sm font-bold text-text-primary">2FA Authentication</span>
                    <span className={cn(
                      "text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider",
                      security?.twoFactorEnabled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    )}>
                      {security?.twoFactorEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {!hideLoginTracking && (
                    <div className="flex items-center justify-between p-3 rounded-sm bg-surface-variant/50 border border-border/50">
                      <span className="text-sm font-bold text-text-primary">Last Access</span>
                      <span className="text-xs font-black text-text-secondary">{security?.lastLoginLocation || 'Unknown'}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 rounded-sm bg-surface-variant/50 border border-border/50">
                    <span className="text-sm font-bold text-text-primary">Clearance</span>
                    <span className="text-xs font-black text-primary uppercase tracking-wider">{security?.clearanceLabel || 'Level 5'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Form Fields */}
            <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
              <div className="glass-card p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-border/30 pb-6">
                  <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-text-primary tracking-tight">Personal Information</h3>
                    <p className="text-xs text-text-secondary font-medium">Update your profile details and preferences.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div>
                    <FloatingLabelInput
                      id="name"
                      label="Full Name"
                      placeholder="e.g. John Doe"
                      register={register}
                      error={errors.name}
                      required={true}
                    />
                  </div>

                  <div>
                    <FloatingLabelInput
                      id="email"
                      label="Email Address"
                      placeholder="admin@company.com"
                      register={register}
                      error={errors.email}
                      required={true}
                    />
                  </div>

                  <div>
                    <FloatingLabelInput
                      id="phone"
                      label="Phone Number"
                      placeholder="+91 98765 43210"
                      register={register}
                      error={errors.phone}
                      required={true}
                    />
                  </div>

                  <div className="relative">
                    <label className="absolute left-6 top-3 text-[10px] font-black uppercase tracking-widest text-text-secondary z-10">
                      Time Zone
                    </label>
                    <div className="w-full px-6 pt-7 pb-3 bg-surface-variant/50 border border-border/30 rounded-sm flex items-center gap-3 text-text-primary font-bold text-sm">
                      <Globe size={18} className="text-primary/70" />
                      <span className="truncate">{profile?.timezoneLabel || 'Asia/Kolkata (IST)'}</span>
                    </div>
                  </div>

                  <div className="relative md:col-span-2">
                    <label className="absolute left-6 top-3 text-[10px] font-black uppercase tracking-widest text-text-secondary z-10">
                      Linked Office
                    </label>
                    {officesLoading && <p className="px-6 pt-7 pb-3 text-sm font-bold text-text-secondary">Loading offices…</p>}
                    {officesError && <p className="px-6 pt-7 pb-3 text-sm font-bold text-error">{officesError}</p>}
                    {!officesLoading && !officesError && (
                      <div className="relative">
                        <select
                          {...register('officeId')}
                          className="w-full px-5 pt-7 pb-3 bg-surface-variant/50 border border-border/30 rounded-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-text-primary text-sm font-bold appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-surface text-text-primary">System Default</option>
                          {offices.map((office) => (
                            <option key={office.id} value={office.id} className="bg-surface text-text-primary">{office.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                          ▼
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-sm bg-accent/10 text-accent border border-accent/10">
                    <Mail size={18} />
                  </div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">About</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Bio</label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className={cn(
                      "w-full px-6 py-4 bg-surface-variant/50 border border-border/30 rounded-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary resize-none",
                      errors.bio && "border-error/40 bg-error/5 focus:ring-error/5"
                    )}
                  />
                  {errors.bio && <p className="text-[10px] text-error font-black uppercase tracking-wider ml-2">{errors.bio.message}</p>}
                </div>
              </div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => router.push(profileBasePath)}
                  type="button"
                  className="flex-1 py-4 px-6 bg-surface-variant hover:bg-border border border-border/50 rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center text-text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 btn-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60"
                >
                  <Save size={16} />
                  Save Changes
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
