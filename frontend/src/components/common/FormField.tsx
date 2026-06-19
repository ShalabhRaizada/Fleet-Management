import type { ReactNode } from 'react';
import { InlineError } from './InlineError';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

/** Common label + control + inline-error wrapper used by the typed input components below. */
export function FormField({ label, required, error, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="req">*</span>}
      </label>
      {children}
      <InlineError message={error} />
    </div>
  );
}

interface BaseInputProps {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function TextInput({ id, label, required, error, disabled, placeholder, value, onChange }: BaseInputProps & { value: string; onChange: (v: string) => void }) {
  return (
    <FormField label={label} required={required} error={error} htmlFor={id}>
      <input id={id} className="input" value={value} disabled={disabled} placeholder={placeholder} required={required}
        onChange={(e) => onChange(e.target.value)} />
    </FormField>
  );
}

export function TextAreaInput({ id, label, required, error, disabled, placeholder, value, onChange, rows = 3 }: BaseInputProps & { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <FormField label={label} required={required} error={error} htmlFor={id}>
      <textarea id={id} className="textarea" value={value} disabled={disabled} placeholder={placeholder} required={required} rows={rows}
        onChange={(e) => onChange(e.target.value)} />
    </FormField>
  );
}

export function NumberInput({ id, label, required, error, disabled, placeholder, value, onChange, min, max, step }: BaseInputProps & { value: number | ''; onChange: (v: number | '') => void; min?: number; max?: number; step?: number }) {
  return (
    <FormField label={label} required={required} error={error} htmlFor={id}>
      <input id={id} type="number" className="input" value={value} disabled={disabled} placeholder={placeholder} required={required}
        min={min} max={max} step={step}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
    </FormField>
  );
}

export function DateInput({ id, label, required, error, disabled, value, onChange, min, max }: BaseInputProps & { value: string; onChange: (v: string) => void; min?: string; max?: string }) {
  return (
    <FormField label={label} required={required} error={error} htmlFor={id}>
      <input id={id} type="date" className="input" value={value} disabled={disabled} required={required} min={min} max={max}
        onChange={(e) => onChange(e.target.value)} />
    </FormField>
  );
}
