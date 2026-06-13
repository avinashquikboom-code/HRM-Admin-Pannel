import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Rocket } from 'lucide-react';

interface ModuleShellProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

const ModuleShell: React.FC<ModuleShellProps> = ({ title, description, icon: Icon = Rocket }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">{title}</h1>
        <p className="text-page-desc mt-1">{description}</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px] border-dashed border-2"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-sm flex items-center justify-center text-primary mb-6">
          <Icon size={40} />
        </div>
        <h2 className="text-xl sm:text-lg font-semibold text-text-primary mb-2">{title} Module</h2>
        <p className="text-page-desc max-w-md mx-auto mb-8">
          This module is part of the premium Super Admin ecosystem. We are currently finalizing the advanced analytics and deep-level reporting features for this section.
        </p>
        <div className="flex gap-4">
          <button className="btn-primary">Initialize Workflow</button>
          <button className="btn-secondary">Request Demo</button>
        </div>
      </motion.div>

      {/* Grid of empty cards to fill space nicely */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 h-32 bg-surface-variant/30 border-dashed border-2 opacity-50"></div>
        ))}
      </div>
    </div>
  );
};

export default ModuleShell;
