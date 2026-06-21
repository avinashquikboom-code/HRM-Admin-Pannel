'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  inputClassName?: string;
}

export default function PasswordInput({
  inputClassName,
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5 pointer-events-none" />
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={cn(
          'w-full pl-12 pr-12 py-4 bg-surface dark:bg-surface-variant border-none rounded-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all text-text-primary disabled:opacity-60',
          inputClassName
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-60"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
