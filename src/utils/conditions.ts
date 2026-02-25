import type { ConditionRule, ConditionAction } from '@/types/form';

interface FieldState {
  [fieldId: string]: string | number | boolean | undefined;
}

function evaluateCondition(rule: ConditionRule, formValues: FieldState): boolean {
  const value = formValues[rule.fieldId];

  switch (rule.operator) {
    case 'equals':
      return String(value) === String(rule.value);
    case 'not_equals':
      return String(value) !== String(rule.value);
    case 'greater_than':
      return Number(value) > Number(rule.value);
    case 'less_than':
      return Number(value) < Number(rule.value);
    case 'is_true':
      return value === true || value === 'true';
    case 'is_false':
      return value === false || value === 'false' || value === undefined;
    default:
      return false;
  }
}

export interface FieldVisibility {
  visible: boolean;
  disabled: boolean;
}

export function evaluateFieldConditions(
  conditions: ConditionRule[],
  formValues: FieldState
): FieldVisibility {
  const result: FieldVisibility = { visible: true, disabled: false };

  for (const rule of conditions) {
    const met = evaluateCondition(rule, formValues);

    if (met) {
      switch (rule.action) {
        case 'show':
          result.visible = true;
          break;
        case 'hide':
          result.visible = false;
          break;
        case 'disable':
          result.disabled = true;
          break;
      }
    } else {
      // If a "show" condition is not met, hide the field
      if (rule.action === 'show') {
        result.visible = false;
      }
    }
  }

  return result;
}
