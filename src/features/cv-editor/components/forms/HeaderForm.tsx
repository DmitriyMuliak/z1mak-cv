'use client';

import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ---------------------------------------------------------------------------
// Field descriptor for the flat header form
// ---------------------------------------------------------------------------

interface HeaderField {
  path: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url';
  placeholder: string;
  key: 'name' | 'email' | 'phone' | 'location' | 'linkedin' | 'website';
}

const HEADER_FIELDS: HeaderField[] = [
  { key: 'name', path: '/header/name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
  {
    key: 'email',
    path: '/header/email',
    label: 'Email',
    type: 'email',
    placeholder: 'jane@example.com',
  },
  {
    key: 'phone',
    path: '/header/phone',
    label: 'Phone',
    type: 'tel',
    placeholder: '+1 555 123 4567',
  },
  {
    key: 'location',
    path: '/header/location',
    label: 'Location',
    type: 'text',
    placeholder: 'San Francisco, CA',
  },
  {
    key: 'linkedin',
    path: '/header/linkedin',
    label: 'LinkedIn URL',
    type: 'url',
    placeholder: 'https://linkedin.com/in/janedoe',
  },
  {
    key: 'website',
    path: '/header/website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://janedoe.dev',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Controlled form for the CV header section.
 * Each input directly calls `updateField` on blur/change.
 */
export function HeaderForm() {
  const header = useResumeEditorStore((s) => s.document.header);
  const updateField = useResumeEditorStore((s) => s.updateField);

  return (
    <div className="space-y-4">
      {HEADER_FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={`header-${field.key}`}>{field.label}</Label>
          <Input
            id={`header-${field.key}`}
            type={field.type}
            placeholder={field.placeholder}
            value={header[field.key] ?? ''}
            onChange={(e) => updateField(field.path, e.target.value || undefined)}
          />
        </div>
      ))}
    </div>
  );
}
