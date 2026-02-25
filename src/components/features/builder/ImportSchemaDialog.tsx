import { useState, useRef } from 'react';
import { useFormStore } from '@/store/formStore';
import type { FormSchema } from '@/types/form';
import { X, Upload, AlertCircle } from 'lucide-react';

interface ImportSchemaDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportSchemaDialog({ open, onClose }: ImportSchemaDialogProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importSchema } = useFormStore();

  if (!open) return null;

  const handleImport = () => {
    setError('');
    try {
      const parsed = JSON.parse(jsonText);
      const schema = validateSchema(parsed);
      if (!schema) {
        setError('Invalid schema: must have id, name, and fields array.');
        return;
      }
      importSchema(schema);
      setJsonText('');
      onClose();
    } catch {
      setError('Invalid JSON. Please check the syntax.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        setJsonText(text);
        setError('');
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Import JSON Schema</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Paste a form schema JSON below, or upload a .json file.
          </p>

          <textarea
            className="w-full h-48 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError('');
            }}
            placeholder='{"id": "...", "name": "My Form", "fields": [...]}'
          />

          {error && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload File
            </button>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!jsonText.trim()}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function validateSchema(data: unknown): FormSchema | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.name !== 'string') return null;
  if (!Array.isArray(obj.fields)) return null;

  return {
    id: typeof obj.id === 'string' ? obj.id : `schema_${Date.now()}`,
    name: obj.name,
    fields: obj.fields.map((f: Record<string, unknown>) => ({
      id: typeof f.id === 'string' ? f.id : `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: typeof f.type === 'string' ? f.type : 'text',
      label: typeof f.label === 'string' ? f.label : 'Field',
      placeholder: typeof f.placeholder === 'string' ? f.placeholder : '',
      options: Array.isArray(f.options) ? f.options : undefined,
      validation: typeof f.validation === 'object' && f.validation ? f.validation : {},
      conditions: Array.isArray(f.conditions) ? f.conditions : [],
    })) as FormSchema['fields'],
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
