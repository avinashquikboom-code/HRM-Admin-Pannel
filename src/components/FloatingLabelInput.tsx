import { ReactNode } from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FloatingLabelInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  register: ReturnType<UseFormRegister<any>>;
  error?: FieldError;
  required?: boolean;
  className?: string;
}

export default function FloatingLabelInput({
  id,
  label,
  type = 'text',
  placeholder = '',
  register,
  error,
  required = false,
  className = '',
}: FloatingLabelInputProps) {
  return (
    <div className={`relative mt-6 ${className}`}> 
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id, { required })}
        className={`peer w-full px-6 py-4.5 bg-surface-variant/50 border-2 border-transparent rounded-[24px] outline-none focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-text-primary ${error ? 'border-error/50 bg-error/5 focus:ring-error/5' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <label
        htmlFor={id}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-text-secondary peer-focus:-top-2 peer-focus:text-sm peer-focus:text-primary transition-all"
      >
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-error font-medium" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
