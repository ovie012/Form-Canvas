import { z, ZodObject, ZodRawShape } from 'zod';
import type { FormField } from '@/types/form';

export function buildZodSchema(fields: FormField[]): ZodObject<ZodRawShape> {
  const shape: ZodRawShape = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'number': {
        let num = z.coerce.number({ invalid_type_error: `${field.label} must be a number` });
        if (field.validation.min !== undefined) num = num.min(field.validation.min);
        if (field.validation.max !== undefined) num = num.max(field.validation.max);
        fieldSchema = field.validation.required ? num : num.optional();
        break;
      }
      case 'checkbox': {
        fieldSchema = field.validation.required
          ? z.boolean().refine((v) => v === true, { message: `${field.label} is required` })
          : z.boolean().optional();
        break;
      }
      case 'email': {
        let str = z.string();
        if (field.validation.required) str = str.min(1, `${field.label} is required`);
        str = str.email(`${field.label} must be a valid email`);
        fieldSchema = field.validation.required ? str : str.optional().or(z.literal(''));
        break;
      }
      default: {
        let str = z.string();
        if (field.validation.required) str = str.min(1, `${field.label} is required`);
        if (field.validation.minLength) str = str.min(field.validation.minLength, `Minimum ${field.validation.minLength} characters`);
        if (field.validation.maxLength) str = str.max(field.validation.maxLength, `Maximum ${field.validation.maxLength} characters`);
        if (field.validation.pattern) {
          try {
            str = str.regex(new RegExp(field.validation.pattern), 'Invalid format');
          } catch {
            // skip invalid regex
          }
        }
        fieldSchema = field.validation.required ? str : str.optional().or(z.literal(''));
        break;
      }
    }

    shape[field.id] = fieldSchema;
  }

  return z.object(shape);
}
