import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className,
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch('');
          }
        }}
        className={cn(
          'w-full flex items-center justify-between px-5 py-3.5 bg-surface-variant/60 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none text-sm font-bold text-text-primary text-left transition-all',
          disabled && 'opacity-60 cursor-not-allowed',
          isOpen && 'border-primary/20 bg-surface-variant/80'
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-muted/50')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn('text-muted transition-transform ml-2', isOpen && 'rotate-180')}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-[999] w-full mt-2 bg-surface-variant border border-border/40 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md"
          >
            {/* Search Input */}
            <div className="relative p-3 border-b border-border/20">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-background border border-transparent focus:border-primary/10 rounded-xl outline-none text-xs font-bold text-text-primary placeholder:text-muted/40 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Options List */}
            <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-border/5">
              {filteredOptions.length === 0 ? (
                <li className="px-5 py-4 text-xs text-muted text-center font-medium">
                  No matches found
                </li>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(opt.value);
                          setIsOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-primary/5 transition-all text-left',
                          isSelected && 'bg-primary/10 text-primary hover:bg-primary/15'
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check size={14} className="text-primary ml-2 flex-shrink-0" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
