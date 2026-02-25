export type FieldType = 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'date' | 'textarea';

export interface SelectOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'is_true' | 'is_false';
export type ConditionAction = 'show' | 'hide' | 'disable';

export interface ConditionRule {
  fieldId: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
  action: ConditionAction;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: SelectOption[];
  validation: ValidationRules;
  conditions: ConditionRule[];
}

export interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export type BuilderMode = 'builder' | 'preview';
