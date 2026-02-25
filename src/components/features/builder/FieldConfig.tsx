import { useFormStore } from '@/store/formStore';
import type { FormField, ConditionRule, ConditionOperator, ConditionAction, SelectOption } from '@/types/form';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

export function FieldConfig() {
  const { schema, selectedFieldId, updateField } = useFormStore();
  const field = schema.fields.find((f) => f.id === selectedFieldId);

  if (!field) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
        Select a field to configure
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <GeneralSection field={field} onUpdate={updateField} />
      <ValidationSection field={field} onUpdate={updateField} />
      {field.type === 'select' && <OptionsSection field={field} onUpdate={updateField} />}
      <ConditionsSection field={field} allFields={schema.fields} onUpdate={updateField} />
    </div>
  );
}

// --- General Section ---

function GeneralSection({
  field,
  onUpdate,
}: {
  field: FormField;
  onUpdate: (id: string, u: Partial<FormField>) => void;
}) {
  return (
    <div className="panel-section">
      <h3 className="panel-heading">General</h3>
      <div className="space-y-3">
        <ConfigInput
          label="Label"
          value={field.label}
          onChange={(v) => onUpdate(field.id, { label: v })}
        />
        {field.type !== 'checkbox' && (
          <ConfigInput
            label="Placeholder"
            value={field.placeholder ?? ''}
            onChange={(v) => onUpdate(field.id, { placeholder: v })}
          />
        )}
      </div>
    </div>
  );
}

// --- Validation Section ---

function ValidationSection({
  field,
  onUpdate,
}: {
  field: FormField;
  onUpdate: (id: string, u: Partial<FormField>) => void;
}) {
  const update = useCallback(
    (key: string, value: string | boolean) => {
      const validation = { ...field.validation };
      if (value === '' || value === false) {
        delete (validation as Record<string, unknown>)[key];
      } else if (typeof value === 'string' && ['minLength', 'maxLength', 'min', 'max'].includes(key)) {
        (validation as Record<string, unknown>)[key] = parseInt(value, 10) || undefined;
      } else {
        (validation as Record<string, unknown>)[key] = value;
      }
      onUpdate(field.id, { validation });
    },
    [field, onUpdate]
  );

  return (
    <div className="panel-section">
      <h3 className="panel-heading">Validation</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={field.validation.required ?? false}
            onChange={(e) => update('required', e.target.checked)}
            className="rounded border-border accent-primary h-4 w-4"
          />
          Required
        </label>

        {(field.type === 'text' || field.type === 'textarea' || field.type === 'email') && (
          <>
            <ConfigInput
              label="Min Length"
              type="number"
              value={field.validation.minLength?.toString() ?? ''}
              onChange={(v) => update('minLength', v)}
            />
            <ConfigInput
              label="Max Length"
              type="number"
              value={field.validation.maxLength?.toString() ?? ''}
              onChange={(v) => update('maxLength', v)}
            />
            <ConfigInput
              label="Pattern (Regex)"
              value={field.validation.pattern ?? ''}
              onChange={(v) => update('pattern', v)}
            />
          </>
        )}

        {field.type === 'number' && (
          <>
            <ConfigInput
              label="Min Value"
              type="number"
              value={field.validation.min?.toString() ?? ''}
              onChange={(v) => update('min', v)}
            />
            <ConfigInput
              label="Max Value"
              type="number"
              value={field.validation.max?.toString() ?? ''}
              onChange={(v) => update('max', v)}
            />
          </>
        )}
      </div>
    </div>
  );
}

// --- Options Section (Select) ---

function OptionsSection({
  field,
  onUpdate,
}: {
  field: FormField;
  onUpdate: (id: string, u: Partial<FormField>) => void;
}) {
  const options = field.options ?? [];

  const updateOption = (index: number, key: keyof SelectOption, value: string) => {
    const newOpts = [...options];
    newOpts[index] = { ...newOpts[index], [key]: value };
    onUpdate(field.id, { options: newOpts });
  };

  const addOption = () => {
    const n = options.length + 1;
    onUpdate(field.id, {
      options: [...options, { label: `Option ${n}`, value: `option_${n}` }],
    });
  };

  const removeOption = (index: number) => {
    onUpdate(field.id, { options: options.filter((_, i) => i !== index) });
  };

  return (
    <div className="panel-section">
      <h3 className="panel-heading">Options</h3>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={opt.label}
              onChange={(e) => updateOption(i, 'label', e.target.value)}
              placeholder="Label"
            />
            <input
              className="w-24 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={opt.value}
              onChange={(e) => updateOption(i, 'value', e.target.value)}
              placeholder="Value"
            />
            <button
              onClick={() => removeOption(i)}
              className="text-muted-foreground hover:text-destructive p-1"
              aria-label="Remove option"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium mt-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Option
        </button>
      </div>
    </div>
  );
}

// --- Conditions Section ---

function ConditionsSection({
  field,
  allFields,
  onUpdate,
}: {
  field: FormField;
  allFields: FormField[];
  onUpdate: (id: string, u: Partial<FormField>) => void;
}) {
  const otherFields = allFields.filter((f) => f.id !== field.id);

  const addCondition = () => {
    const rule: ConditionRule = {
      fieldId: otherFields[0]?.id ?? '',
      operator: 'equals',
      value: '',
      action: 'show',
    };
    onUpdate(field.id, { conditions: [...field.conditions, rule] });
  };

  const updateCondition = (index: number, updates: Partial<ConditionRule>) => {
    const newConds = [...field.conditions];
    newConds[index] = { ...newConds[index], ...updates };
    onUpdate(field.id, { conditions: newConds });
  };

  const removeCondition = (index: number) => {
    onUpdate(field.id, { conditions: field.conditions.filter((_, i) => i !== index) });
  };

  const operators: { value: ConditionOperator; label: string }[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'is_true', label: 'Is True' },
    { value: 'is_false', label: 'Is False' },
  ];

  const actions: { value: ConditionAction; label: string }[] = [
    { value: 'show', label: 'Show' },
    { value: 'hide', label: 'Hide' },
    { value: 'disable', label: 'Disable' },
  ];

  return (
    <div className="panel-section">
      <h3 className="panel-heading">Conditional Logic</h3>
      <div className="space-y-3">
        {field.conditions.map((cond, i) => (
          <div key={i} className="rounded-md border border-border p-2.5 space-y-2 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">If</span>
              <select
                className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                value={cond.fieldId}
                onChange={(e) => updateCondition(i, { fieldId: e.target.value })}
              >
                {otherFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                value={cond.operator}
                onChange={(e) =>
                  updateCondition(i, { operator: e.target.value as ConditionOperator })
                }
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              {!['is_true', 'is_false'].includes(cond.operator) && (
                <input
                  className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  value={String(cond.value ?? '')}
                  onChange={(e) => updateCondition(i, { value: e.target.value })}
                  placeholder="Value"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Then</span>
              <select
                className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                value={cond.action}
                onChange={(e) =>
                  updateCondition(i, { action: e.target.value as ConditionAction })
                }
              >
                {actions.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeCondition(i)}
                className="text-muted-foreground hover:text-destructive p-1"
                aria-label="Remove condition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {otherFields.length > 0 && (
          <button
            onClick={addCondition}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Condition
          </button>
        )}
        {otherFields.length === 0 && (
          <p className="text-xs text-muted-foreground">Add more fields to enable conditions</p>
        )}
      </div>
    </div>
  );
}

// --- Shared ---

function ConfigInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
