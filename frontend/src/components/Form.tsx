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
}

interface SimpleFormProps<T> {
  fields: FieldDef<T>[];
  values: Partial<T>;
  onChange: (name: keyof T & string, value: unknown) => void;
  errors?: Record<string, string>;
}

export function FormGrid<T>({ fields, values, onChange, errors }: SimpleFormProps<T>) {
  return (
    <div className="field-row cols-2">
      {fields.map((f) => (
        <div key={f.name} className="field" style={f.type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}>
          <label>
            {f.label}
            {f.required && <span className="req">*</span>}
          </label>
          {f.type === 'select' ? (
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
              value={(values[f.name] as string | number) ?? ''}
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
