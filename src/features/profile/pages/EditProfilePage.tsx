"use client";

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
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditProfilePage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || 'Avinash Magar',
      email: user?.email || 'avinash@hrm.ai',
      phone: user?.phone || '+91 98765 43210',
      bio: user?.bio || 'Super Administrator managing the HRM ecosystem. Expertise in scalable cloud architectures.',
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    dispatch(updateUser(data));
    router.push('/profile');
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

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-8 pb-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between bg-surface/50 backdrop-blur-xl p-6 rounded-[32px] border border-border/50 shadow-sm">
        <div className="flex items-center gap-5">
          <motion.button 
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/profile')}
            className="p-3.5 bg-surface border border-border rounded-2xl text-text-secondary hover:text-primary transition-all shadow-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">System Identity Configuration</h1>
            <p className="text-sm text-text-secondary font-medium">Update your administrative credentials and public profile.</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Quick Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="glass-card p-10 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              
              <div className="relative group mb-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="w-48 h-48 rounded-full bg-surface-variant border-4 border-surface shadow-2xl flex items-center justify-center overflow-hidden relative"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={100} className="text-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={32} className="text-white" />
                  </div>
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="absolute bottom-2 right-2 p-4 bg-primary text-white rounded-2xl shadow-xl border-4 border-surface active:scale-95"
                >
                  <Camera size={20} />
                </motion.button>
              </div>
              
              <h3 className="text-lg font-black text-text-primary mb-1">Administrator Avatar</h3>
              <p className="text-xs text-text-secondary font-medium px-4">
                This image will be visible across the system for all verified entities.
              </p>
              
              <div className="flex gap-4 mt-8 w-full">
                <button type="button" className="flex-1 py-3 text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all border border-primary/10 uppercase tracking-widest">Upload</button>
                <button type="button" className="flex-1 py-3 text-xs font-black text-error bg-error/5 hover:bg-error/10 rounded-xl transition-all border border-error/10 uppercase tracking-widest">Remove</button>
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
                  <span className="text-success uppercase">Active</span>
                </li>
                <li className="flex items-center justify-between text-xs font-bold">
                  <span className="text-text-secondary">Last Login</span>
                  <span className="text-text-primary">Mumbai, IN</span>
                </li>
                <li className="flex items-center justify-between text-xs font-bold">
                  <span className="text-text-secondary">Clearance Level</span>
                  <span className="text-primary uppercase">Level 5</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Right Column: Form Fields */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 space-y-10">
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
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <User size={12} /> Full Name
                  </label>
                  <div className="relative group">
                    <input 
                      {...register('name')}
                      placeholder="e.g. Avinash Magar"
                      className={cn(
                        "w-full px-6 py-4.5 bg-surface-variant/50 border-2 border-transparent rounded-[24px] outline-none focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary",
                        errors.name && "border-error/50 bg-error/5 focus:ring-error/5"
                      )}
                    />
                    <motion.div 
                      layoutId="input-glow"
                      className="absolute inset-0 rounded-[24px] pointer-events-none group-focus-within:shadow-[0_0_20px_rgba(59,163,139,0.1)] transition-shadow" 
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-error font-black uppercase tracking-wider ml-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Mail size={12} /> Email Protocol
                  </label>
                  <div className="relative group">
                    <input 
                      {...register('email')}
                      placeholder="admin@hrm.ai"
                      className={cn(
                        "w-full px-6 py-4.5 bg-surface-variant/50 border-2 border-transparent rounded-[24px] outline-none focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary",
                        errors.email && "border-error/50 bg-error/5 focus:ring-error/5"
                      )}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-error font-black uppercase tracking-wider ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Phone size={12} /> Secure Phone
                  </label>
                  <div className="relative group">
                    <input 
                      {...register('phone')}
                      placeholder="+91 00000 00000"
                      className={cn(
                        "w-full px-6 py-4.5 bg-surface-variant/50 border-2 border-transparent rounded-[24px] outline-none focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary",
                        errors.phone && "border-error/50 bg-error/5 focus:ring-error/5"
                      )}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-error font-black uppercase tracking-wider ml-1">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Globe size={12} /> System Region
                  </label>
                  <div className="w-full px-6 py-4.5 bg-surface-variant/30 border-2 border-border/50 rounded-[24px] flex items-center gap-3 text-text-primary font-bold text-sm">
                    <Globe size={20} className="text-primary" />
                    Asia/Kolkata (IST)
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Administrative Bio</label>
                <textarea 
                  {...register('bio')}
                  rows={5}
                  placeholder="Describe your role and focus areas..."
                  className={cn(
                    "w-full px-6 py-5 bg-surface-variant/50 border-2 border-transparent rounded-[32px] outline-none focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary resize-none",
                    errors.bio && "border-error/50 bg-error/5 focus:ring-error/5"
                  )}
                />
                {errors.bio && <p className="text-[10px] text-error font-black uppercase tracking-wider ml-1">{errors.bio.message}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-5">
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => router.push('/profile')}
                className="flex-1 py-5 bg-surface border-2 border-border text-text-secondary font-black uppercase tracking-[0.2em] text-[10px] rounded-[28px] hover:bg-surface-variant transition-all shadow-sm"
              >
                Discard Changes
              </motion.button>
              <motion.button 
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-5 bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[28px] shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {isSubmitting ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Save size={20} />
                    Synchronize Profile
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProfilePage;
