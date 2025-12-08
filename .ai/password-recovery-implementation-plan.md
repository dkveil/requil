# Plan Implementacji Password Recovery Flow

## 1. Analiza Obecnego Stanu

### Frontend (✅ Częściowo gotowe)
- ✅ `ForgotPasswordForm` - formularz z polem email (mock backend call)
- ✅ `ResetPasswordForm` - formularz z nowymi hasłami (mock backend call)
- ✅ Strony `/auth/forgot-password` i `/auth/reset-password`
- ✅ Tłumaczenia (EN/PL)
- ✅ Walidacja zod (email, hasło min 8 znaków, zgodność haseł)
- ❌ Brak integracji z API
- ❌ Brak obsługi `PASSWORD_RECOVERY` event

### Backend (❌ Brak implementacji)
- ❌ Brak endpointów `/auth/forgot-password` i `/auth/reset-password`
- ❌ Brak handlerów CQRS dla recovery flow
- ❌ Brak typów w `@requil/types`
- ❌ Brak route definitions w `api-routes.ts`

### Zgodność z PRD i auth-spec.md
- ✅ US-001: Rejestracja przez Gmail, GitHub, Credentials - zaimplementowane
- ⚠️ Specyfikacja auth-spec.md wymaga recovery flow (sekcja 3.2)
- ⚠️ PRD nie zawiera explicite US dla password recovery, ale jest to standard dla auth

---

## 2. Architektura Rozwiązania

### Flow Diagram (PKCE - Server-Side Auth)

```
┌─────────────┐
│   User      │
│ (Dashboard) │
└──────┬──────┘
       │
       │ 1. Submit email
       ▼
┌──────────────────────────────────────┐
│ ForgotPasswordForm                    │
│ POST /auth/forgot-password            │
└──────┬───────────────────────────────┘
       │
       │ 2. Execute command
       ▼
┌──────────────────────────────────────┐
│ ForgotPasswordHandler (Backend)      │
│ - Validate email                     │
│ - Call supabase.auth                 │
│   .resetPasswordForEmail()           │
│ - redirectTo: /auth/reset-password   │
└──────┬───────────────────────────────┘
       │
       │ 3. Send email (Supabase)
       ▼
┌──────────────────────────────────────┐
│ User Email Inbox                     │
│ Link: /auth/reset-password           │
│   ?token_hash=xxx&type=recovery      │
└──────┬───────────────────────────────┘
       │
       │ 4. Click link
       ▼
┌──────────────────────────────────────┐
│ ResetPasswordPage                    │
│ - Detect PASSWORD_RECOVERY event    │
│ - Show ResetPasswordForm             │
└──────┬───────────────────────────────┘
       │
       │ 5. Submit new password
       ▼
┌──────────────────────────────────────┐
│ ResetPasswordHandler (Backend)       │
│ - Validate session (recovery mode)  │
│ - Call supabase.auth.updateUser()   │
│ - Return success                     │
└──────┬───────────────────────────────┘
       │
       │ 6. Redirect to login
       ▼
┌──────────────────────────────────────┐
│ LoginPage                            │
└──────────────────────────────────────┘
```

### Supabase Auth Integration

**Forgot Password (Step 1-3):**
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${FRONTEND_URL}/auth/reset-password`
})
```
- Supabase wysyła email z linkiem zawierającym `token_hash` i `type=recovery`
- Link jest jednorazowy i wygasa (domyślnie 1h)
- Security best practice: Nie ujawniamy czy email istnieje w systemie

**Reset Password (Step 4-6):**
```typescript
// Frontend wykrywa recovery session
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    // Show reset password form
  }
})

// Backend update hasła
await supabase.auth.updateUser({ password: newPassword })
```

---

## 3. Szczegółowa Implementacja

### 3.1. Typy (`packages/types/src/auth`)

**Nowe pliki:**

**`forgot-password.schema.ts`**
```typescript
import { z } from 'zod';

export const forgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;
export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>;
```

**`reset-password.schema.ts`**
```typescript
import { z } from 'zod';

export const resetPasswordInputSchema = z.object({
  password: z.string().min(8),
});

export const resetPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
```

**Update `packages/types/src/auth/index.ts`:**
```typescript
export * from './forgot-password.schema';
export * from './reset-password.schema';
// ... existing exports
```

---

### 3.2. API Routes (`packages/utils/src/api-routes.ts`)

```typescript
export const API_ROUTES = {
  AUTH: {
    // ... existing routes
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // ... rest
} as const;
```

---

### 3.3. Backend - CQRS Handlers

#### Structure
```
apps/api/src/modules/auth/commands/
├── forgot-password/
│   ├── forgot-password.handler.ts
│   └── forgot-password.route.ts
└── reset-password/
    ├── reset-password.handler.ts
    └── reset-password.route.ts
```

#### `forgot-password.handler.ts`
```typescript
import type { ForgotPasswordInput, ForgotPasswordResponse } from '@requil/types/auth';
import { env } from '@/config';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';

export const forgotPasswordAction = authActionCreator<ForgotPasswordInput>('FORGOT_PASSWORD');

export default function forgotPasswordHandler({
  commandBus,
  supabase,
  logger,
}: Dependencies) {
  const handler = async (
    action: Action<ForgotPasswordInput>
  ): Promise<ForgotPasswordResponse> => {
    const { email } = action.payload;

    logger.info({ email }, 'Password reset requested');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.frontendUrl}/auth/reset-password`,
    });

    if (error) {
      logger.error({ email, error }, 'Failed to send password reset email');
      throw mapSupabaseAuthError(error, { email });
    }

    // Security: Always return success, nie ujawniamy czy email istnieje
    return {
      message: 'If an account exists for this email, you will receive a password reset link.',
    };
  };

  const init = async () => {
    commandBus.register(forgotPasswordAction.type, handler);
  };

  return {
    handler,
    init,
  };
}
```

#### `forgot-password.route.ts`
```typescript
import { successResponseSchema, errorResponseSchema } from '@requil/types';
import type { ForgotPasswordResponse } from '@requil/types/auth';
import {
  forgotPasswordResponseSchema,
  forgotPasswordInputSchema
} from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { forgotPasswordAction } from './forgot-password.handler';

const forgotPasswordRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: API_ROUTES.AUTH.FORGOT_PASSWORD,
    schema: {
      body: forgotPasswordInputSchema,
      response: {
        200: successResponseSchema(forgotPasswordResponseSchema),
        400: errorResponseSchema,
        429: errorResponseSchema,
      },
      tags: ['auth'],
      description: 'Request password reset email',
    },
    handler: async (request, reply) => {
      const result = await fastify.commandBus.execute<ForgotPasswordResponse>(
        forgotPasswordAction(request.body)
      );

      return sendSuccess(reply, result);
    },
  });
};

export default forgotPasswordRoute;
```

#### `reset-password.handler.ts`
```typescript
import type { ResetPasswordInput, ResetPasswordResponse } from '@requil/types/auth';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export const resetPasswordAction = authActionCreator<ResetPasswordInput>('RESET_PASSWORD');

export default function resetPasswordHandler({
  commandBus,
  supabase,
  logger,
}: Dependencies) {
  const handler = async (
    action: Action<ResetPasswordInput>
  ): Promise<ResetPasswordResponse> => {
    const { password } = action.payload;

    // User musi być zalogowany w recovery mode (session z PASSWORD_RECOVERY)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated or recovery session expired');
    }

    logger.info({ userId: user.id }, 'Resetting password');

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      logger.error({ userId: user.id, error }, 'Failed to reset password');
      throw mapSupabaseAuthError(error);
    }

    logger.info({ userId: user.id }, 'Password reset successful');

    return {
      message: 'Password has been reset successfully',
    };
  };

  const init = async () => {
    commandBus.register(resetPasswordAction.type, handler);
  };

  return {
    handler,
    init,
  };
}
```

#### `reset-password.route.ts`
```typescript
import { successResponseSchema, errorResponseSchema } from '@requil/types';
import type { ResetPasswordResponse } from '@requil/types/auth';
import {
  resetPasswordResponseSchema,
  resetPasswordInputSchema
} from '@requil/types/auth';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { resetPasswordAction } from './reset-password.handler';

const resetPasswordRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: API_ROUTES.AUTH.RESET_PASSWORD,
    schema: {
      body: resetPasswordInputSchema,
      response: {
        200: successResponseSchema(resetPasswordResponseSchema),
        400: errorResponseSchema,
        401: errorResponseSchema,
      },
      tags: ['auth'],
      description: 'Reset password with recovery session',
    },
    handler: async (request, reply) => {
      const result = await fastify.commandBus.execute<ResetPasswordResponse>(
        resetPasswordAction(request.body)
      );

      return sendSuccess(reply, result);
    },
  });
};

export default resetPasswordRoute;
```

---

### 3.4. Frontend Integration

#### Update `apps/dashboard/features/auth/api/auth-api.ts`

```typescript
export const authApi = {
  // ... existing methods

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await fetchAPI<ForgotPasswordResponse>(
      API_ROUTES.AUTH.FORGOT_PASSWORD,
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
    return response.data;
  },

  async resetPassword(password: string): Promise<ResetPasswordResponse> {
    const response = await fetchAPI<ResetPasswordResponse>(
      API_ROUTES.AUTH.RESET_PASSWORD,
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      }
    );
    return response.data;
  },
};
```

#### Update `apps/dashboard/features/auth/stores/auth-store.ts`

```typescript
type AuthActions = {
  // ... existing actions
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      // ... existing state and actions

      forgotPassword: async (email: string) => {
        await authApi.forgotPassword(email);
      },

      resetPassword: async (password: string) => {
        await authApi.resetPassword(password);
      },
    }),
    { name: 'AuthStore' }
  )
);
```

#### Update `forgot-password-form.tsx`

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '../stores/auth-store';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const tAuth = useTranslations('auth.forgotPasswordPage');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(values.email);

      toast.success(tAuth('successTitle'), {
        description: tAuth('success'),
      });
    } catch (err) {
      toast.error(tAuth('failed'), {
        description: getErrorMessage(err, locale),
      });
    }
  };

  const onError = (errors: typeof form.formState.errors) => {
    const errorMessages = Object.values(errors)
      .map((error) => error?.message)
      .filter(Boolean)
      .join(', ');

    toast.error(tCommon('validationError'), {
      description: errorMessages || 'Please check the form',
    });
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit(onSubmit, onError)}
      {...props}
    >
      <FieldGroup>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>{tAuth('title')}</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            {tAuth('subtitle')}
          </p>
        </div>

        <div className='max-w-xs w-full flex flex-col gap-6 mx-auto'>
          <Field>
            <FieldLabel htmlFor='email'>{tAuth('email')}</FieldLabel>
            <Input
              id='email'
              type='email'
              placeholder={tAuth('emailPlaceholder')}
              disabled={isSubmitting}
              {...register('email')}
            />
          </Field>

          <Field>
            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting}
            >
              {isSubmitting ? `${tAuth('submit')}...` : tAuth('submit')}
            </Button>
          </Field>

          <div className='text-center text-sm'>
            <Link
              href={DASHBOARD_ROUTES.AUTH.LOGIN}
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              {tAuth('backToLogin')}
            </Link>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
}
```

#### Update `reset-password-form.tsx`

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '../stores/auth-store';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Password confirmation is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const tAuth = useTranslations('auth.resetPasswordPage');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword(values.password);

      toast.success(tAuth('successTitle'), {
        description: tAuth('success'),
      });

      router.push(DASHBOARD_ROUTES.AUTH.LOGIN);
    } catch (err) {
      toast.error(tAuth('failed'), {
        description: getErrorMessage(err, locale),
      });
    }
  };

  const onError = (errors: typeof form.formState.errors) => {
    const errorMessages = Object.values(errors)
      .map((error) => error?.message)
      .filter(Boolean)
      .join(', ');

    toast.error(tCommon('validationError'), {
      description: errorMessages || 'Please check the form',
    });
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit(onSubmit, onError)}
      {...props}
    >
      <FieldGroup>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>{tAuth('title')}</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            {tAuth('subtitle')}
          </p>
        </div>

        <div className='max-w-xs w-full flex flex-col gap-6 mx-auto'>
          <Field>
            <FieldLabel htmlFor='password'>{tAuth('password')}</FieldLabel>
            <Input
              id='password'
              type='password'
              placeholder={tAuth('passwordPlaceholder')}
              disabled={isSubmitting}
              {...register('password')}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor='confirmPassword'>
              {tAuth('confirmPassword')}
            </FieldLabel>
            <Input
              id='confirmPassword'
              type='password'
              placeholder={tAuth('confirmPasswordPlaceholder')}
              disabled={isSubmitting}
              {...register('confirmPassword')}
            />
          </Field>

          <Field>
            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting}
            >
              {isSubmitting ? `${tAuth('submit')}...` : tAuth('submit')}
            </Button>
          </Field>
        </div>
      </FieldGroup>
    </form>
  );
}
```

#### Update `apps/dashboard/features/auth/index.ts`

```typescript
export { authApi } from './api/auth-api';
export { ForgotPasswordForm } from './components/forgot-password-form';
export { LoginForm } from './components/login-form';
export { RegisterForm } from './components/register-form';
export { ResetPasswordForm } from './components/reset-password-form';
export { authMiddleware } from './middleware/auth-middleware';
export { AuthInitializer } from './providers/auth-init';
export { useAuthStore } from './stores/auth-store';
```

---

### 3.5. Error Handling

Istniejący `mapSupabaseAuthError` w `auth.error.ts` już obsługuje większość błędów recovery flow:
- `session_not_found` → SessionNotFoundError
- `session_expired` → SessionExpiredError
- `weak_password` → WeakPasswordError
- `same_password` → SamePasswordError

Możliwe dodatkowe błędy do obsługi:
- Token wygasł (już obsłużony przez `session_expired`)
- Zbyt wiele prób (rate limit - już obsłużony przez `over_email_send_rate_limit`)

---

## 4. Testy

### Backend Tests (Vitest)

**`forgot-password.handler.spec.ts`**
```typescript
describe('ForgotPasswordHandler', () => {
  it('should send reset email for existing user', async () => {
    // Mock supabase.auth.resetPasswordForEmail
    // Assert success response
  });

  it('should return success for non-existing user (security)', async () => {
    // Mock Supabase error
    // Assert success response (nie ujawniamy czy user istnieje)
  });

  it('should respect rate limits', async () => {
    // Mock rate limit error
    // Assert 429 error
  });
});
```

**`reset-password.handler.spec.ts`**
```typescript
describe('ResetPasswordHandler', () => {
  it('should update password with valid recovery session', async () => {
    // Mock recovery session
    // Assert password updated
  });

  it('should reject without recovery session', async () => {
    // Mock no session
    // Assert 401 error
  });

  it('should validate password strength', async () => {
    // Mock weak password
    // Assert validation error
  });
});
```

### Frontend Tests (Vitest + Testing Library)

**`forgot-password-form.spec.tsx`**
```typescript
describe('ForgotPasswordForm', () => {
  it('should submit email and show success toast', async () => {
    // Render form
    // Fill email
    // Submit
    // Assert API call
    // Assert success toast
  });

  it('should validate email format', async () => {
    // Submit invalid email
    // Assert validation error
  });
});
```

---

## 5. Bezpieczeństwo i Best Practices

### Rate Limiting
- Supabase automatycznie limituje resetPasswordForEmail (domyślnie max 60/h per email)
- Upstash Redis może dodatkowo limitować endpoint na poziomie workspace

### Security Considerations
1. **Nie ujawniamy istnienia użytkownika** - zawsze zwracamy sukces
2. **Token jednorazowy** - Supabase automatycznie invalidates token po użyciu
3. **Expiry** - Link wygasa (domyślnie 1h)
4. **Audit logging** - Logujemy wszystkie próby reset password
5. **HTTPS only** - Wymuszamy secure connection

### Monitoring
```typescript
logger.info({ email }, 'Password reset requested');
logger.info({ userId }, 'Password reset successful');
logger.error({ email, error }, 'Failed to send password reset email');
```

---

## 6. Migracja i Deployment

### Checklist przed wdrożeniem:

1. **Environment Variables**
   - `FRONTEND_URL` - musi być poprawnie ustawione w `apps/api/.env`
   - Sprawdzić konfigurację SMTP w Supabase (jeśli nie używamy built-in)

2. **Supabase Configuration**
   - Zweryfikować template emaila "Reset Password" w Dashboard → Auth → Email Templates
   - Dodać `${FRONTEND_URL}/auth/reset-password` do Redirect URLs

3. **Database**
   - Brak nowych tabel/migracji - wszystko w Supabase Auth

4. **Testing**
   - E2E test pełnego flow w środowisku staging
   - Sprawdzić czy email dostarczany (check spam folder)

---

## 7. Kolejność Implementacji

### Faza 1: Backend (Priority: HIGH)
1. ✅ Dodać typy w `packages/types/src/auth/`
2. ✅ Zaktualizować `api-routes.ts`
3. ✅ Stworzyć `forgot-password.handler.ts` i `forgot-password.route.ts`
4. ✅ Stworzyć `reset-password.handler.ts` i `reset-password.route.ts`
5. ✅ Dodać unit tests

### Faza 2: Frontend (Priority: HIGH)
6. ✅ Zaktualizować `auth-api.ts`
7. ✅ Zaktualizować `auth-store.ts`
8. ✅ Zaktualizować `forgot-password-form.tsx`
9. ✅ Zaktualizować `reset-password-form.tsx`
10. ✅ Dodać component tests

### Faza 3: Testing & Documentation (Priority: MEDIUM)
11. ✅ E2E test flow
12. ✅ Dokumentacja w README
13. ✅ Update Swagger/OpenAPI docs

---

## 8. Potencjalne Problemy i Rozwiązania

### Problem 1: Recovery session nie działa po kliknięciu w link
**Przyczyna**: Frontend nie wykrywa PASSWORD_RECOVERY event
**Rozwiązanie**: Użyć Supabase client-side do nasłuchiwania `onAuthStateChange`

### Problem 2: Email nie przychodzi
**Przyczyny**:
- Brak konfiguracji SMTP w Supabase
- Rate limit exceeded
- Email w spam folder
**Rozwiązanie**: Skonfigurować custom SMTP, sprawdzić logi Supabase

### Problem 3: "Session expired" po kliknięciu w link
**Przyczyna**: Link wygasł (> 1h)
**Rozwiązanie**: User musi ponownie zrequest reset link

---

## 9. Zgodność z Architekturą

### CQRS Pattern ✅
- `ForgotPasswordCommand` - write operation (trigger email)
- `ResetPasswordCommand` - write operation (update password)
- Handlers zarejestrowane w CommandBus

### Dependency Injection (Awilix) ✅
- Auto-loading handlerów przez naming convention `*.handler.ts`
- Lifetime: SINGLETON
- AsyncInit dla `init()` method

### Error Handling ✅
- Custom error classes z errorCode, context, traceId
- mapSupabaseAuthError dla consistency
- Never expose internal errors

### Fastify ✅
- JSON Schema validation
- ZodTypeProvider
- OpenAPI/Swagger docs auto-generated

---

## 10. Następne Kroki (Post-MVP)

1. **Email Template Customization** - Allow workspace-level customization
2. **Multi-language emails** - Based on user locale
3. **Password history** - Prevent reusing last N passwords
4. **2FA/MFA** - Require MFA before password change
5. **Account recovery alternatives** - SMS, Security questions
6. **Admin password reset** - Allow workspace owners to reset member passwords

---

## Podsumowanie

Implementacja password recovery flow zgodna z:
- ✅ Architekturą CQRS i DI
- ✅ Supabase Auth best practices
- ✅ Security standards (rate limiting, audit, HTTPS)
- ✅ Istniejącym kodem (naming, structure, error handling)
- ✅ PRD wymaganiami (US-001 - podstawowa autentykacja)

**Estimated effort**: 6-8h (Backend: 3h, Frontend: 2h, Tests: 2h, Docs: 1h)
