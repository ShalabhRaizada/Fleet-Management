import { useEffect, useRef, useState } from 'react';

export interface ComboOption {
  value: string;
  label: string;
  /** Secondary code shown alongside the label, also matched when searching. */
  code?: string;
}

interface SearchableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  /** Static option list. Ignored once `loadOptions` is provided. */
  options?: ComboOption[];
  /** Async loader, called with the current search text; takes precedence over `options`. */
  loadOptions?: (query: string) => Promise<ComboOption[]>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  noResultsText?: string;
  id?: string;
}

export function SearchableCombobox({
  value, onChange, options, loadOptions, placeholder = 'Search...', required, disabled, noResultsText = 'No results found', id,
}: SearchableComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolvedOptions, setResolvedOptions] = useState<ComboOption[]>(options ?? []);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = (options ?? resolvedOptions).find((o) => o.value === value) ?? resolvedOptions.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    if (loadOptions) {
      setLoading(true);
      const handle = setTimeout(() => {
        loadOptions(query).then((opts) => { setResolvedOptions(opts); setLoading(false); }).catch(() => setLoading(false));
      }, 200);
      return () => clearTimeout(handle);
    }
    setResolvedOptions(options ?? []);
  }, [open, query, loadOptions, options]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = loadOptions
    ? resolvedOptions
    : resolvedOptions.filter((o) => !query || o.label.toLowerCase().includes(query.toLowerCase()) || o.code?.toLowerCase().includes(query.toLowerCase()));

  function selectOption(opt: ComboOption) {
    onChange(opt.value);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (open && filtered[highlight]) selectOption(filtered[highlight]); }
    else if (e.key === 'Escape') { setOpen(false); }
  }

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <input
        id={id}
        className="input"
        disabled={disabled}
        required={required && !value}
        placeholder={selected ? selected.label : placeholder}
        value={open ? query : ''}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setHighlight(0); }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
      />
      {value && !open && (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 6, top: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
        >
          ×
        </button>
      )}
      {open && (
        <div className="card" style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 220, overflowY: 'auto' }}>
          {loading ? (
            <div className="muted" style={{ padding: 10, fontSize: 12.5 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="muted" style={{ padding: 10, fontSize: 12.5 }}>{noResultsText}</div>
          ) : (
            filtered.map((opt, idx) => (
              <div
                key={opt.value}
                onMouseDown={() => selectOption(opt)}
                style={{
                  padding: '8px 10px', fontSize: 13, cursor: 'pointer',
                  background: idx === highlight ? 'var(--surface-3)' : undefined,
                }}
              >
                {opt.label}{opt.code ? <span className="muted" style={{ marginLeft: 6, fontSize: 11.5 }}>({opt.code})</span> : null}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
