'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// URL field with optional display label
// ---------------------------------------------------------------------------

interface UrlFieldProps {
  urlKey: 'linkedin' | 'website';
  labelKey: 'linkedinLabel' | 'websiteLabel';
  label: string;
  placeholder: string;
  labelPlaceholder: string;
}

function UrlFieldWithLabel({
  urlKey,
  labelKey,
  label,
  placeholder,
  labelPlaceholder,
}: UrlFieldProps) {
  const header = useResumeEditorStore((s) => s.document.header);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const [showLabel, setShowLabel] = useState(!!header[labelKey]);

  const urlValue = header[urlKey] ?? '';
  const labelValue = header[labelKey] ?? '';

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`header-${urlKey}`}>{label}</Label>
      <div className="relative">
        <Input
          id={`header-${urlKey}`}
          type="url"
          placeholder={placeholder}
          value={urlValue}
          className="pr-9"
          onChange={(e) => updateField(`/header/${urlKey}`, e.target.value || undefined)}
        />
        <button
          type="button"
          title={showLabel ? 'Remove display label' : 'Add display label'}
          onClick={() => {
            if (showLabel) {
              updateField(`/header/${labelKey}`, undefined);
            }
            setShowLabel((v) => !v);
          }}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors',
            showLabel ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Tag size={14} />
        </button>
      </div>

      {showLabel && (
        <Input
          id={`header-${labelKey}`}
          type="text"
          placeholder={labelPlaceholder}
          value={labelValue}
          onChange={(e) => updateField(`/header/${labelKey}`, e.target.value || undefined)}
          className="h-7 text-xs"
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple text / email / tel field
// ---------------------------------------------------------------------------

interface SimpleFieldProps {
  fieldKey: 'name' | 'email' | 'phone' | 'location';
  label: string;
  type: 'text' | 'email' | 'tel';
  placeholder: string;
}

function SimpleField({ fieldKey, label, type, placeholder }: SimpleFieldProps) {
  const value = useResumeEditorStore((s) => s.document.header[fieldKey] ?? '');
  const updateField = useResumeEditorStore((s) => s.updateField);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`header-${fieldKey}`}>{label}</Label>
      <Input
        id={`header-${fieldKey}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => updateField(`/header/${fieldKey}`, e.target.value || undefined)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeaderForm() {
  return (
    <div className="space-y-4">
      <SimpleField fieldKey="name" label="Full Name" type="text" placeholder="Jane Doe" />
      <SimpleField fieldKey="email" label="Email" type="email" placeholder="jane@example.com" />
      <SimpleField fieldKey="phone" label="Phone" type="tel" placeholder="+1 555 123 4567" />
      <SimpleField
        fieldKey="location"
        label="Location"
        type="text"
        placeholder="San Francisco, CA"
      />
      <UrlFieldWithLabel
        urlKey="linkedin"
        labelKey="linkedinLabel"
        label="LinkedIn URL"
        placeholder="https://linkedin.com/in/janedoe"
        labelPlaceholder="Display as… e.g. LinkedIn"
      />
      <UrlFieldWithLabel
        urlKey="website"
        labelKey="websiteLabel"
        label="Website"
        placeholder="https://janedoe.dev"
        labelPlaceholder="Display as… e.g. My Portfolio"
      />
    </div>
  );
}
