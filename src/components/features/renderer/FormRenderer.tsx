import { useState, useMemo, useCallback } from 'react';
import type { FormField } from '@/types/form';
import { buildZodSchema } from '@/utils/validation';
import { evaluateFieldConditions } from '@/utils/conditions';
import { FIELD_TYPES } from '../builder/FieldPalette';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormRendererProps {
  fields: FormField[];
}

export function FormRenderer({ fields }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const zodSchema = useMemo(() => buildZodSchema(fields), [fields]);

  const setValue = useCallback((fieldId: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = zodSchema.safeParse(values);
    if (result.success) {
      setErrors({});
      setSubmitted(true);
    } else {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setSubmitted(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <CheckCircle className="h-12 w-12 text-primary" />
        <h2 className="text-lg font-semibold">Form Submitted</h2>
        <pre className="bg-muted rounded-lg p-4 text-xs max-w-md w-full overflow-auto">
          {JSON.stringify(values, null, 2)}
        </pre>
        <button
          onClick={() => {
            setValues({});
            setErrors({});
            setSubmitted(false);
          }}
          className="text-sm text-primary hover:text-primary/80 font-medium mt-2"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-5">
      {fields.map((field) => {
        const visibility = evaluateFieldConditions(field.conditions, values);
        if (!visibility.visible) return null;

        return (
          <RenderedField
            key={field.id}
            field={field}
            value={values[field.id]}
            error={errors[field.id]}
            disabled={visibility.disabled}
            onChange={(v) => setValue(field.id, v)}
          />
        );
      })}

      {fields.length > 0 && (
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Submit
        </button>
      )}

      {fields.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No fields in this form yet
        </p>
      )}
    </form>
  );
}

function RenderedField({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: FormField;
  value: string | number | boolean | undefined;
  error?: string;
  disabled: boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  const fieldMeta = FIELD_TYPES.find((f) => f.type === field.type);
  const Icon = fieldMeta?.icon;

  const inputClass = `w-full rounded-md border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ${
    error ? 'border-destructive' : 'border-input'
  }`;

  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {field.label}
        {field.validation.required && <span className="text-destructive">*</span>}
      </label>

      {field.type === 'text' || field.type === 'email' ? (
        <input
          type={field.type}
          className={inputClass}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'number' ? (
        <input
          type="number"
          className={inputClass}
          placeholder={field.placeholder}
          value={value !== undefined ? String(value) : ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'textarea' ? (
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'date' ? (
        <input
          type="date"
          className={inputClass}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'select' ? (
        <select
          className={`${inputClass} appearance-none`}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{field.placeholder || 'Select...'}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === true}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-input accent-primary h-4 w-4"
          />
          <span className="text-sm text-muted-foreground">{field.placeholder || 'Check this'}</span>
        </label>
      ) : null}

      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive mt-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
