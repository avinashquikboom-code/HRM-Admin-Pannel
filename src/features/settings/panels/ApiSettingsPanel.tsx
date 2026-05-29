'use client';

import { Copy, Key, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import SettingsSection from '@/features/settings/components/SettingsSection';

export default function ApiSettingsPanel() {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const maskedKey = 'hrm_live_••••••••••••••••••••';
  const fullKey = 'hrm_live_sk_8f3a9c2e1b7d4f6a0c8e2b9d1f4a7c3';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <SettingsSection
      title="API keys"
      description="Use these credentials to connect external systems to the HRM platform."
      icon={Key}
    >
      <div className="rounded-2xl border border-border/60 bg-surface-variant/30 p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Production secret key
          </p>
          <p className="mt-2 font-mono text-sm font-semibold text-text-primary break-all">
            {revealed ? fullKey : maskedKey}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRevealed((prev) => !prev)}
            className="btn-secondary py-2 px-4 text-xs"
          >
            {revealed ? 'Hide key' : 'Reveal key'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
          >
            <Copy size={14} />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors"
          >
            <RefreshCw size={14} />
            Regenerate
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4">
        <p className="text-sm font-semibold text-text-primary">
          Keep your API key private
        </p>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
          Do not share this key in client-side code or public repositories.
          Regenerating a key will invalidate the previous one immediately.
        </p>
      </div>
    </SettingsSection>
  );
}
