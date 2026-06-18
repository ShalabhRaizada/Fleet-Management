import type { ReactNode } from 'react';

export interface FieldDef<T> {
  name: keyof T & string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'checkbox' | 'textarea';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

interface SimpleFormProps<T> {
  fields: FieldDef<T>[];
  values: Partial<T>;
  onChange: (name: keyof T & string, value: unknown) => void;
  errors?: Record<string, string>;
}

export function FormGrid<T>({ fields, values, onChange, errors }: SimpleFormProps<T>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {f.label}
            {f.required && <span className="text-red-500"> *</span>}
          </label>
          {f.type === 'select' ? (
            <select
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              value={(values[f.name] as string) ?? ''}
              onChange={(e) => onChange(f.name, e.target.value)}
            >
              <option value="">-- select --</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={Boolean(values[f.name])}
              onChange={(e) => onChange(f.name, e.target.checked)}
              className="h-4 w-4"
            />
          ) : f.type === 'textarea' ? (
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              value={(values[f.name] as string) ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => onChange(f.name, e.target.value)}
              rows={3}
            />
          ) : (
            <input
              type={f.type || 'text'}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              value={(values[f.name] as string | number) ?? ''}
              placeholder={f.placeholder}
              onChange={(e) =>
                onChange(f.name, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)
              }
            />
          )}
          {errors?.[f.name] && <p className="text-xs text-red-500 mt-1">{errors[f.name]}</p>}
        </div>
      ))}
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">{children}</div>;
}
