import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';
import type { z } from 'zod';

export function zodValidator(schema: z.ZodTypeAny): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(control.value);
    return result.success ? null : { zodError: result.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.' };
  };
}
