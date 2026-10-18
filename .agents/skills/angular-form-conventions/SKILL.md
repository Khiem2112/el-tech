---
name: angular-form-conventions
description: >
  Implements and reviews Angular Reactive Forms combined with Zod schema
  validation, accessible error display, and form submission lifecycle. Load for
  form components, form services, or Zod validation schemas.
---

# Angular Reactive Forms & Zod Validation Conventions

This skill defines the technical implementation standards for building forms in Angular. For UX decisions (field grouping, progressive disclosure, empty states), refer to `../flow-forms/SKILL.md`.

---

## 1. Authority Separation: Reactive Forms & Zod

- **Angular Reactive Forms (`FormGroup`, `FormControl`, `FormArray`)** owns the UI control tree, control state, dirty/touched tracking, and submission event binding.
- **Zod Schema** is the single source of truth for validation rules, constraints, type inference, and error messages.
- Place entity validation schemas in a dedicated directory (such as `fe/src/app/forms/schemas/` or shared schemas) to allow reuse across Frontend and Backend validation.
- Do not duplicate validation logic across ad-hoc template conditionals or manual string checks.

---

## 2. Reusable Zod Validator for Angular

To bridge Zod schemas into Angular's `ValidatorFn`, use a centralized validator helper function:

```typescript
// fe/src/app/forms/validators/zod-validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { z } from 'zod';

export function zodValidator(schema: z.ZodTypeAny): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(control.value);
    if (result.success) {
      return null;
    }
    const firstIssue = result.error.issues[0];
    return {
      zodError: firstIssue ? firstIssue.message : 'Invalid value',
    };
  };
}
```

---

## 3. Form Submission Lifecycle & Browser Validation

- Always apply `novalidate` to the `<form>` element. This prevents browser-native validation bubbles from bypassing Angular error messages or displaying unlocalized text.
- Before executing an API call, verify `form.invalid`. If invalid, call `form.markAllAsTouched()` so all invalid fields display their errors to the user immediately.
- Track submission status using an Angular Signal (for example, `isSubmitting = signal(false)`). Disable the submit button when `form.invalid || isSubmitting()`.
- Client-side validation is interaction feedback, not a trust boundary. The Express backend API must validate `req.body` with the corresponding Zod schema before executing business logic.

---

## 4. Error Display & Accessibility

- Only display error messages when the control has been interacted with: `control.invalid && (control.dirty || control.touched)`.
- Associate error text with the corresponding control using `[attr.aria-invalid]` and `[attr.aria-describedby]`.
- Style error messages using design tokens (such as `text-destructive`, `border-destructive`). Avoid hardcoded arbitrary color codes.

---

## 5. Implementation Examples

### Component Class

Chuan xac: Quan ly trang thai bang Reactive Forms va Angular Signals:

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { z } from 'zod';
import { zodValidator } from '../validators/zod-validator';
import { AuthService } from '../../services/auth.service';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, HlmButtonDirective, HlmInputDirective],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [zodValidator(loginSchema.shape.email)]],
    password: ['', [zodValidator(loginSchema.shape.password)]],
  });

  get emailControl() {
    return this.form.get('email');
  }

  get passwordControl() {
    return this.form.get('password');
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const formValues = this.form.value as LoginFormValues;
      await this.authService.login(formValues);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

---

### Template HTML

Chuan xac: Ket hop Spartan UI primitives, novalidate, va thong bao loi de tiep can:

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
  @if (errorMessage()) {
    <div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive" role="alert">
      {{ errorMessage() }}
    </div>
  }

  <div class="space-y-1.5">
    <label for="email" class="text-sm font-medium text-foreground">Email</label>
    <input
      hlmInput
      id="email"
      type="email"
      formControlName="email"
      placeholder="name@example.com"
      class="w-full"
      [class.border-destructive]="emailControl?.invalid && emailControl?.touched"
      [attr.aria-invalid]="emailControl?.invalid && emailControl?.touched ? 'true' : null"
      aria-describedby="email-error"
    />
    @if (emailControl?.invalid && emailControl?.touched) {
      <p id="email-error" class="text-xs text-destructive">
        {{ emailControl?.errors?.['zodError'] }}
      </p>
    }
  </div>

  <div class="space-y-1.5">
    <label for="password" class="text-sm font-medium text-foreground">Password</label>
    <input
      hlmInput
      id="password"
      type="password"
      formControlName="password"
      class="w-full"
      [class.border-destructive]="passwordControl?.invalid && passwordControl?.touched"
      [attr.aria-invalid]="passwordControl?.invalid && passwordControl?.touched ? 'true' : null"
      aria-describedby="password-error"
    />
    @if (passwordControl?.invalid && passwordControl?.touched) {
      <p id="password-error" class="text-xs text-destructive">
        {{ passwordControl?.errors?.['zodError'] }}
      </p>
    }
  </div>

  <button
    hlmBtn
    type="submit"
    class="w-full"
    [disabled]="form.invalid || isSubmitting()"
  >
    @if (isSubmitting()) {
      Signing in...
    } @else {
      Sign In
    }
  </button>
</form>
```

---

### Vi du khong dung quy chuan Can Tranh

Khong dung quy chuan: Thieu `novalidate`, kiem tra thu cong khong qua Zod, va thieu bao ve trang thai submit:

```typescript
// Sai: Kiem tra validation roi rac thay vi tap trung vao schema Zod
onSubmit() {
  if (!this.email.includes('@')) {
    alert('Email sai dinh dang');
    return;
  }
  this.http.post('/api/login', { email: this.email }); // Khong khoa nut submit, de bi double click
}
```
