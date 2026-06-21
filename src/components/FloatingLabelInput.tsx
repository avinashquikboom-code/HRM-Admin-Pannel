import { UseFormRegister, FieldError } from 'react-hook-form';

interface FloatingLabelInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<any>;
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
    <div className={`relative ${className}`}>
      <label
        htmlFor={id}
        className="absolute left-6 top-3 text-[10px] font-black uppercase tracking-widest text-text-secondary z-10"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id, { required })}
        className={`w-full px-6 pt-7 pb-3 bg-surface-variant/50 border-2 border-transparent rounded-sm outline-none focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-text-primary text-sm font-bold ${error ? 'border-error/50 bg-error/5 focus:ring-error/5' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 ml-4 text-[10px] font-black uppercase tracking-widest text-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
