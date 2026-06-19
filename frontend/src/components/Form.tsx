import type { ReactNode } from 'react';

export interface FieldDef<T> {
  name: keyof T & string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'checkbox' | 'textarea';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  /** Logical section heading this field belongs to (used by sectioned form layouts). */
  section?: string;
}

interface SimpleFormProps<T> {
  fields: FieldDef<T>[];
  values: Partial<T>;
  onChange: (name: keyof T & string, value: unknown) => void;
  errors?: Record<string, string>;
  /** Override the default control for specific fields, e.g. a SearchableCombobox instead of a plain <select>. */
  renderers?: Partial<Record<keyof T & string, (value: unknown, onChange: (v: unknown) => void) => ReactNode>>;
  cols?: 2 | 3 | 4;
}

function formatInputValue(value: string | number | boolean | undefined): string | number {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return value;
}

export function FormGrid<T>({ fields, values, onChange, errors, renderers, cols = 2 }: SimpleFormProps<T>) {
  return (
    <div className={`field-row cols-${cols}`}>
      {fields.map((f) => (
        <div key={f.name} className="field" style={f.type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}>
          <label>
            {f.label}
            {f.required && <span className="req">*</span>}
          </label>
          {renderers?.[f.name] ? (
            renderers[f.name]!(values[f.name], (v) => onChange(f.name, v))
          ) : f.type === 'select' ? (
            <select
              className="select"
              value={(values[f.name] as string) ?? ''}
              onChange={(e) => onChange(f.name, e.target.value)}
              required={f.required === true}
            >
              <option value="">-- select --</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === 'checkbox' ? (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => onChange(f.name, e.target.checked)}
                required={f.required === true}
              />
            </label>
          ) : f.type === 'textarea' ? (
            <textarea
              className="textarea"
              value={(values[f.name] as string) ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => onChange(f.name, e.target.value)}
              rows={3}
              required={f.required === true}
              minLength={f.minLength}
              maxLength={f.maxLength}
            />
          ) : (
            <input
              type={f.type || 'text'}
              className="input"
              value={formatInputValue(values[f.name] as string | number | boolean | undefined)}
              placeholder={f.placeholder}
              onChange={(e) =>
                onChange(f.name, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)
              }
              required={f.required === true}
              {...(f.type === 'number'
                ? { min: f.min, max: f.max }
                : { pattern: f.pattern, minLength: f.minLength, maxLength: f.maxLength })}
            />
          )}
          {errors?.[f.name] && <p style={{ fontSize: 11.5, color: 'var(--danger)', margin: '2px 0 0' }}>{errors[f.name]}</p>}
        </div>
      ))}
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="row" style={{ paddingTop: 16, borderTop: '1px solid var(--divider)', marginTop: 16 }}>{children}</div>;
}
