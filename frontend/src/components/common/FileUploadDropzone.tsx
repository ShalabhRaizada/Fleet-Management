import { useRef, useState } from 'react';

interface FileUploadDropzoneProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  files?: File[];
}

export function FileUploadDropzone({ label, accept, multiple, onFiles, files = [] }: FileUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    onFiles(Array.from(e.dataTransfer.files));
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--brand-blue)' : 'var(--border-strong)'}`,
          borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'var(--surface-3)' : undefined,
        }}
      >
        <div className="muted" style={{ fontSize: 12.5 }}>
          {files.length > 0 ? files.map((f) => f.name).join(', ') : 'Click or drag files here to upload'}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
        />
      </div>
    </div>
  );
}
