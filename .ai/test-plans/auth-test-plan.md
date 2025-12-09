# Plan Testów - Moduł Autentykacji Requil

## 1. Przegląd i Cele

### 1.1 Cel Planu Testów

Plan testów definiuje kompleksową strategię weryfikacji modułu autentykacji w systemie Requil, obejmującą rejestrację, logowanie, odzyskiwanie hasła oraz integrację z Supabase Auth. Celem jest zapewnienie bezpieczeństwa, niezawodności i zgodności z wymaganiami biznesowymi oraz specyfikacją techniczną.

### 1.2 Zakres Testowania

Moduł autentykacji odpowiada za:
- Zarządzanie tożsamością użytkowników (rejestracja, logowanie, wylogowanie)
- Odzyskiwanie dostępu do konta (forgot password, reset password)
- Uwierzytelnianie OAuth (Google, GitHub)
- Synchronizację danych między Supabase Auth (`auth.users`) a tabelą aplikacji (`public.accounts`)
- Zarządzanie sesjami i tokenami
- Ochronę zasobów przez middleware

## 2. Zakres Testowania

### 2.1 W Zakresie (In Scope)

**Frontend (Next.js Dashboard)**:
- Komponenty formularzy: `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`
- Walidacja kliencka (react-hook-form + zod)
- Obsługa błędów i komunikatów użytkownika
- Middleware ochrony tras (`middleware.ts`)
- Przekierowania po akcjach autentykacji
- Layouts: Auth Layout i Dashboard Layout

**Backend (Fastify API)**:
- Endpointy REST:
  - `POST /v1/auth/register`
  - `POST /v1/auth/login`
  - `POST /v1/auth/logout`
  - `POST /v1/auth/recover` (nowy)
  - `POST /v1/auth/reset-password` (nowy)
- Handlery CQRS: `RegisterHandler`, `LoginHandler`, `LogoutHandler`
- Walidacja payloadów (Zod/TypeBox)
- Transakcyjność operacji (Supabase + Postgres)
- Mapowanie i obsługa błędów
- Rate limiting (Upstash Redis)

**Integracja z Supabase**:
- Synchronizacja `auth.users` ↔ `public.accounts`
- Operacje: `signUp()`, `signInWithPassword()`, `signOut()`, `resetPasswordForEmail()`, `updateUser()`
- OAuth flow (Google, GitHub)
- PKCE flow dla recovery
- Zarządzanie sesjami i tokenami

**Bezpieczeństwo**:
- Row Level Security (RLS)
- Haszowanie haseł (Supabase)
- Ochrona przed Brute Force
- Walidacja tokenów i sesji
- CSRF protection

### 2.2 Poza Zakresem (Out of Scope)

- Zarządzanie workspace'ami (zakładamy istniejący workspace dla testów auth)
- API Keys i ich zarządzanie (osobny moduł)
- Wysyłka e-maili (obsługiwana przez Supabase)
- UI/UX design review
- Testy obciążeniowe (performance testing w późniejszej fazie)

## 3. Strategia Testowania

### 3.1 Typy Testów

#### A. Unit Testing (Vitest)
- **Zakres**: Walidatory, pomocnicze funkcje, izolowane handlery CQRS
- **Framework**: Vitest z `vi.mock()` dla zewnętrznych zależności
- **Cel**: >80% pokrycia logiki biznesowej
- **Lokalizacja**: `apps/api/src/modules/auth/**/*.test.ts`

#### B. Integration Testing (Vitest + Supertest)
- **Zakres**: Endpointy API, integracja z Supabase i Postgres
- **Framework**: Vitest + Supertest + Testcontainers (Postgres)
- **Cel**: Weryfikacja przepływów end-to-end na poziomie API
- **Lokalizacja**: `apps/api/src/modules/auth/**/*.integration.test.ts`

#### C. E2E Testing (Playwright)
- **Zakres**: Krytyczne ścieżki użytkownika przez UI
- **Framework**: Playwright (Chromium/Desktop Chrome)
- **Cel**: Weryfikacja kompletnych flow'ów w przeglądarce
- **Lokalizacja**: `apps/dashboard/e2e/auth/*.spec.ts`

#### D. Security Testing
- **Zakres**: Testy penetracyjne, weryfikacja podatności
- **Narzędzia**: Manualne + OWASP ZAP (opcjonalnie)
- **Cel**: Weryfikacja standardów bezpieczeństwa

### 3.2 Narzędzia i Frameworki

| Typ Testu | Framework/Narzędzie | Wersja | Uwagi |
|-----------|---------------------|--------|-------|
| Unit | Vitest | latest | `vi.mock()`, `vi.spyOn()` |
| Integration | Vitest + Supertest | latest | Testcontainers dla Postgres |
| E2E | Playwright | latest | Chromium only (MVP) |
| Lint/Format | BiomeJS | 2.x | CI/CD pipeline |
| Type Check | TypeScript | 5.x | `tsc --noEmit` |
| Code Coverage | Vitest Coverage | - | >80% business logic |

### 3.3 Środowiska Testowe

#### Lokalne (Development)
- **Backend**: `NODE_ENV=test`, Testcontainers (Postgres), mock Supabase Auth (opcjonalnie real instance)
- **Frontend**: `next dev`, mock API responses lub lokalne API
- **Baza**: Izolowana instancja Postgres w Docker

#### CI/CD (GitHub Actions)
- **Backend**: Testcontainers, Redis mock
- **Frontend**: `next build`, Playwright w headless mode
- **Baza**: Ephemeral Postgres container
- **Secrets**: Test Supabase project keys z GitHub Secrets

#### Staging (Pre-production)
- **Backend/Frontend**: Deploy na Railway/Vercel
- **Baza**: Dedykowana Supabase test instance
- **Cel**: Smoke tests przed production

### 3.4 Zarządzanie Danymi Testowymi

- **Test Fixtures**: `packages/db/src/test-fixtures/` - seedowe dane dla testów
- **Factory Pattern**: Generowanie losowych użytkowników z `faker.js`
- **Cleanup**: `beforeEach` i `afterEach` hooks czyszczące bazę
- **Izolacja**: Każdy test ma własną transakcję (rollback po teście)
- **Test Organization**: Dedykowane organizacje Supabase dla testów

## 4. Przypadki Testowe według Funkcjonalności

### 4.1 Rejestracja Użytkownika (Registration)

#### Feature: POST /v1/auth/register

**Opis**: Użytkownik tworzy nowe konto za pomocą email i hasła.

**Test Scenarios**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-REG-001 | Prawidłowa rejestracja nowego użytkownika | 1. POST /v1/auth/register z poprawnym email i hasłem<br>2. Weryfikacja odpowiedzi | - Status 201<br>- Użytkownik w `auth.users`<br>- Rekord w `public.accounts` z planem FREE<br>- Zwrócone dane użytkownika | **Critical** | Integration |
| AUTH-REG-002 | Rejestracja z istniejącym emailem | 1. Utwórz użytkownika<br>2. Spróbuj zarejestrować ponownie tym samym emailem | - Status 400<br>- Komunikat "Email already exists" | **Critical** | Integration |
| AUTH-REG-003 | Rejestracja z nieprawidłowym formatem email | 1. POST z emailem "invalid-email" | - Status 400<br>- ValidationError z kodem EMAIL_INVALID | **High** | Unit |
| AUTH-REG-004 | Rejestracja z za krótkim hasłem | 1. POST z hasłem "123" (< 8 znaków) | - Status 400<br>- ValidationError z kodem PASSWORD_TOO_SHORT | **High** | Unit |
| AUTH-REG-005 | Rejestracja z pustym hasłem | 1. POST z hasłem "" | - Status 400<br>- ValidationError z kodem PASSWORD_REQUIRED | **High** | Unit |
| AUTH-REG-006 | Rollback przy błędzie tworzenia konta lokalnego | 1. Mock error przy zapisie do `accounts`<br>2. POST /v1/auth/register | - Status 500<br>- Użytkownik NIE istnieje w `auth.users`<br>- Brak rekordu w `accounts` | **Critical** | Integration |
| AUTH-REG-007 | Rate limiting przy wielu próbach rejestracji | 1. Wykonaj 10 żądań POST /v1/auth/register w krótkim czasie | - Po przekroczeniu limitu: Status 429<br>- Header Retry-After | **High** | Integration |
| AUTH-REG-008 | Transakcyjność: Supabase sukces, Postgres fail | 1. Mock błąd Drizzle ORM insert<br>2. POST /v1/auth/register | - Użytkownik usunięty z Supabase<br>- Status 500 z jasnym komunikatem | **Critical** | Integration |

**Dodatkowe Testy Unit**:
- Walidacja schematu `RegisterDto` (Zod)
- Handler `RegisterHandler.execute()` z mockowanym Supabase i DB
- Mapowanie błędów Supabase na `AuthError`

---

### 4.2 Logowanie (Login)

#### Feature: POST /v1/auth/login

**Opis**: Użytkownik loguje się emailem i hasłem lub przez OAuth.

**Test Scenarios**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-LOGIN-001 | Prawidłowe logowanie email/password | 1. Utwórz użytkownika<br>2. POST /v1/auth/login z poprawnymi credentials | - Status 200<br>- Zwrócone tokeny (`access_token`, `refresh_token`)<br>- Profil użytkownika w response | **Critical** | Integration |
| AUTH-LOGIN-002 | Logowanie z nieprawidłowym hasłem | 1. POST /v1/auth/login z błędnym hasłem | - Status 401<br>- Komunikat "Invalid credentials" | **Critical** | Integration |
| AUTH-LOGIN-003 | Logowanie z nieistniejącym emailem | 1. POST /v1/auth/login z nieistniejącym emailem | - Status 401<br>- Komunikat "Invalid credentials" (bez wycieku informacji) | **Critical** | Integration |
| AUTH-LOGIN-004 | Logowanie z niepotwierdzoną skrzynką email | 1. Zarejestruj użytkownika (bez potwierdzenia)<br>2. POST /v1/auth/login | - Status 401 lub 403<br>- Komunikat "Email not confirmed" | **High** | Integration |
| AUTH-LOGIN-005 | Rate limiting przy Brute Force | 1. Wykonaj 20 błędnych prób logowania | - Po przekroczeniu limitu: Status 429<br>- Blokada czasowa (lockout) | **Critical** | Integration |
| AUTH-LOGIN-006 | Logowanie po wylogowaniu | 1. Login → Logout → Login ponownie | - Status 200<br>- Nowe tokeny sesji | **Medium** | Integration |
| AUTH-LOGIN-007 | Walidacja pustych pól | 1. POST bez email lub password | - Status 400<br>- ValidationError z listą brakujących pól | **High** | Unit |

**OAuth Scenarios**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-OAUTH-001 | Logowanie przez Google OAuth | 1. Inicjuj OAuth flow<br>2. Mock callback z Google<br>3. Weryfikuj utworzenie/pobranie konta | - Użytkownik zalogowany<br>- Rekord w `accounts` utworzony (jeśli nowy) | **High** | Integration |
| AUTH-OAUTH-002 | Logowanie przez GitHub OAuth | 1. Inicjuj OAuth flow<br>2. Mock callback z GitHub<br>3. Weryfikuj utworzenie/pobranie konta | - Użytkownik zalogowany<br>- Rekord w `accounts` utworzony (jeśli nowy) | **High** | Integration |
| AUTH-OAUTH-003 | OAuth z już istniejącym emailem | 1. Utwórz użytkownika email/password<br>2. Spróbuj OAuth z tym samym emailem | - Link kont lub błąd zgodnie z polityką Supabase | **Medium** | Integration |

**Dodatkowe Testy Unit**:
- Walidacja schematu `LoginDto`
- Handler `LoginHandler.execute()` z mockowanym Supabase
- Transformacja tokenów Supabase → API response

---

### 4.3 Wylogowanie (Logout)

#### Feature: POST /v1/auth/logout

**Opis**: Użytkownik kończy sesję i inwaliduje tokeny.

**Test Scenarios**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-LOGOUT-001 | Prawidłowe wylogowanie | 1. Login<br>2. POST /v1/auth/logout z tokenem | - Status 200<br>- Sesja inwalidowana w Supabase<br>- Kolejne żądania z tym tokenem zwracają 401 | **Critical** | Integration |
| AUTH-LOGOUT-002 | Wylogowanie bez tokenu | 1. POST /v1/auth/logout bez Authorization header | - Status 401<br>- Komunikat "Unauthorized" | **High** | Integration |
| AUTH-LOGOUT-003 | Wylogowanie z nieważnym tokenem | 1. POST /v1/auth/logout z fake tokenem | - Status 401<br>- Komunikat "Invalid token" | **High** | Integration |
| AUTH-LOGOUT-004 | Wylogowanie już wylogowanego użytkownika | 1. Logout → Logout ponownie | - Status 401 lub 200 (idempotentne) | **Medium** | Integration |

---

### 4.4 Odzyskiwanie Hasła (Password Recovery)

#### Feature: POST /v1/auth/recover (nowy endpoint)

**Opis**: Użytkownik inicjuje proces resetowania hasła.

**Test Scenarios**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-RECOVER-001 | Wysłanie linku resetującego do istniejącego użytkownika | 1. POST /v1/auth/recover z emailem użytkownika | - Status 200<br>- Supabase `resetPasswordForEmail()` wywołane<br>- Email wysłany (weryfikacja w mockach) | **Critical** | Integration |
| AUTH-RECOVER-002 | Żądanie recovery dla nieistniejącego email | 1. POST /v1/auth/recover z nieistniejącym emailem | - Status 200 (bez wycieku informacji)<br>- Brak wysyłki email | **Critical** | Integration |
| AUTH-RECOVER-003 | Rate limiting recovery requests | 1. Wykonaj 10 żądań /v1/auth/recover w krótkim czasie | - Po przekroczeniu: Status 429<br>- Lockout czasowy | **High** | Integration |
| AUTH-RECOVER-004 | Walidacja nieprawidłowego email | 1. POST z emailem "invalid" | - Status 400<br>- ValidationError EMAIL_INVALID | **High** | Unit |
| AUTH-RECOVER-005 | Prawidłowy redirectTo URL | 1. POST /v1/auth/recover<br>2. Weryfikuj parametr redirectTo w wywołaniu Supabase | - redirectTo: `${FRONTEND_URL}/auth/reset-password` | **High** | Integration |

---

### 4.5 Resetowanie Hasła (Password Reset)

#### Feature: POST /v1/auth/reset-password (nowy endpoint) + Frontend Flow

**Opis**: Użytkownik ustawia nowe hasło po kliknięciu linku z emaila.

**Test Scenarios (Backend)**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-RESET-001 | Prawidłowe ustawienie nowego hasła | 1. Mock recovery session (kod PKCE)<br>2. POST /v1/auth/reset-password z nowym hasłem | - Status 200<br>- Hasło zaktualizowane w Supabase<br>- Użytkownik może się zalogować nowym hasłem | **Critical** | Integration |
| AUTH-RESET-002 | Reset z nieprawidłowym/wygasłym kodem | 1. POST z nieważnym kodem recovery | - Status 401 lub 403<br>- Komunikat "Invalid or expired recovery code" | **Critical** | Integration |
| AUTH-RESET-003 | Nowe hasło identyczne ze starym | 1. POST z hasłem takim samym jak poprzednie | - Status 400<br>- Komunikat "Password must be different" (opcjonalnie) | **Low** | Integration |
| AUTH-RESET-004 | Walidacja siły nowego hasła | 1. POST z hasłem "123" (za krótkie) | - Status 400<br>- ValidationError PASSWORD_TOO_SHORT | **High** | Unit |
| AUTH-RESET-005 | Reset hasła bez aktywnej recovery session | 1. POST /v1/auth/reset-password bez sesji recovery | - Status 401<br>- Komunikat "No active recovery session" | **High** | Integration |

**Test Scenarios (Frontend E2E)**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-RESET-E2E-001 | Pełny flow odzyskiwania hasła | 1. Kliknij "Forgot password" na /login<br>2. Wpisz email, wyślij<br>3. Symuluj kliknięcie linku z email (navigate do /auth/reset-password?code=...)<br>4. Ustaw nowe hasło<br>5. Zaloguj się nowym hasłem | - Użytkownik przekierowany do Dashboardu<br>- Sesja aktywna | **Critical** | E2E |
| AUTH-RESET-E2E-002 | Walidacja frontendu dla nowego hasła | 1. Na stronie reset, wpisz za krótkie hasło<br>2. Zatwierdź formularz | - Błąd walidacji wyświetlony bez wysyłki API | **High** | E2E |
| AUTH-RESET-E2E-003 | Wygasły kod recovery | 1. Navigate do /auth/reset-password z wygasłym kodem<br>2. Spróbuj ustawić hasło | - Komunikat błędu<br>- Sugestia ponownego żądania recovery | **High** | E2E |

---

### 4.6 Middleware i Ochrona Tras

#### Feature: `middleware.ts` w Next.js

**Opis**: Middleware weryfikuje sesję przed dostępem do chronionych stron.

**Test Scenarios**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-MW-001 | Dostęp do chronionej strony bez sesji | 1. Navigate do /dashboard (bez logowania) | - Przekierowanie do /login<br>- Query param `redirectTo=/dashboard` | **Critical** | E2E |
| AUTH-MW-002 | Dostęp do chronionej strony z ważną sesją | 1. Login<br>2. Navigate do /dashboard | - Dostęp przyznany<br>- Dashboard renderowany | **Critical** | E2E |
| AUTH-MW-003 | Odświeżenie wygasłego tokenu (token rotation) | 1. Login<br>2. Mock wygaśnięcie access_token<br>3. Navigate do /dashboard | - Middleware odświeża token<br>- Użytkownik pozostaje zalogowany | **High** | Integration |
| AUTH-MW-004 | Dostęp do strony publicznej (/login) gdy zalogowany | 1. Login<br>2. Navigate do /login | - Przekierowanie do /dashboard | **Medium** | E2E |
| AUTH-MW-005 | Middleware nie blokuje publicznych zasobów | 1. Navigate do /_next/static/... (bez logowania) | - Zasoby załadowane bez przekierowania | **Medium** | E2E |

---

### 4.7 Synchronizacja Danych (Supabase ↔ Postgres)

#### Feature: Spójność `auth.users` i `public.accounts`

**Test Scenarios**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-SYNC-001 | Utworzenie konta w obu tabelach przy rejestracji | 1. POST /v1/auth/register | - Rekord w `auth.users`<br>- Rekord w `public.accounts` z `user_id` = `auth.users.id`<br>- Plan = FREE | **Critical** | Integration |
| AUTH-SYNC-002 | Rollback Supabase przy błędzie Postgres | 1. Mock błąd insert do `accounts`<br>2. POST /v1/auth/register | - Użytkownik NIE istnieje w `auth.users`<br>- Brak rekordu w `accounts` | **Critical** | Integration |
| AUTH-SYNC-003 | Brak duplikacji przy ponownym wywołaniu (idempotencja) | 1. POST /v1/auth/register (sukces)<br>2. Spróbuj ponownie tym samym emailem | - Status 400<br>- Tylko 1 rekord w obu tabelach | **High** | Integration |
| AUTH-SYNC-004 | OAuth sync - nowy użytkownik | 1. OAuth login (pierwszy raz) | - Użytkownik w `auth.users` (przez Supabase)<br>- Rekord w `accounts` utworzony przez backend | **High** | Integration |

---

### 4.8 Formularze Frontend (React Components)

#### Feature: `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`

**Test Scenarios (Unit - React Testing Library)**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-FORM-001 | Renderowanie LoginForm | 1. Render `<LoginForm />` | - Widoczne pola Email i Password<br>- Przycisk "Login"<br>- Linki "Register" i "Forgot Password" | **High** | Unit |
| AUTH-FORM-002 | Walidacja email w czasie rzeczywistym | 1. Wpisz nieprawidłowy email<br>2. Opuść pole (blur) | - Komunikat błędu pod polem | **High** | Unit |
| AUTH-FORM-003 | Walidacja hasła w czasie rzeczywistym | 1. Wpisz hasło < 8 znaków<br>2. Opuść pole | - Komunikat "Password must be at least 8 characters" | **High** | Unit |
| AUTH-FORM-004 | Submit LoginForm z poprawnymi danymi | 1. Wpisz dane<br>2. Kliknij "Login"<br>3. Mock success response | - Loading state podczas wysyłki<br>- Przekierowanie do /dashboard | **Critical** | Unit |
| AUTH-FORM-005 | Obsługa błędu API (401) | 1. Submit LoginForm<br>2. Mock 401 response | - Toast/komunikat błędu "Invalid credentials"<br>- Formularz pozostaje wypełniony | **Critical** | Unit |
| AUTH-FORM-006 | OAuth buttons w LoginForm | 1. Render<br>2. Kliknij "Login with Google" | - Inicjowanie OAuth flow (mock) | **Medium** | Unit |

**Test Scenarios (E2E - Playwright)**:

| ID | Scenariusz | Kroki | Oczekiwany Wynik | Priorytet | Typ |
|----|-----------|-------|------------------|-----------|-----|
| AUTH-FORM-E2E-001 | Pełny flow rejestracji | 1. Navigate do /register<br>2. Wpisz email i hasło<br>3. Submit<br>4. Weryfikuj przekierowanie | - Komunikat sukcesu lub przekierowanie do dashboard/email confirmation | **Critical** | E2E |
| AUTH-FORM-E2E-002 | Pełny flow logowania | 1. Navigate do /login<br>2. Wpisz credentials<br>3. Submit | - Przekierowanie do /dashboard<br>- Topbar pokazuje awatar użytkownika | **Critical** | E2E |
| AUTH-FORM-E2E-003 | Forgot password flow | 1. /login → "Forgot Password"<br>2. Wpisz email<br>3. Submit | - Komunikat "Check your email" | **High** | E2E |
| AUTH-FORM-E2E-004 | Keyboard navigation w LoginForm | 1. Tab przez pola<br>2. Enter na przycisku Login | - Formularz działa bez myszy | **Low** | E2E |

---

## 5. Testy Bezpieczeństwa

### 5.1 Authentication Bypass Attempts

| ID | Scenariusz | Oczekiwany Wynik | Priorytet |
|----|-----------|------------------|-----------|
| SEC-001 | Próba dostępu do API bez tokenu | Status 401, brak wycieku danych | **Critical** |
| SEC-002 | Próba użycia wygasłego tokenu | Status 401, "Token expired" | **Critical** |
| SEC-003 | Próba użycia zmodyfikowanego tokenu JWT | Status 401, "Invalid signature" | **Critical** |
| SEC-004 | Replay attack - ponowne użycie starego tokenu po logout | Status 401, sesja inwalidowana | **High** |

### 5.2 Password Security

| ID | Scenariusz | Oczekiwany Wynik | Priorytet |
|----|-----------|------------------|-----------|
| SEC-010 | Weryfikacja haszowania haseł w bazie | Hasła nigdy nie są plain text | **Critical** |
| SEC-011 | Wymuszone minimalne wymagania hasła | Min. 8 znaków (opcjonalnie complexity) | **High** |
| SEC-012 | Timing attack - porównanie haseł | Stały czas odpowiedzi niezależnie od błędu | **Medium** |
| SEC-013 | Brak hasła w logach | Przeszukaj logi - brak plain passwords | **Critical** |

### 5.3 Session & Token Security

| ID | Scenariusz | Oczekiwany Wynik | Priorytet |
|----|-----------|------------------|-----------|
| SEC-020 | Token rotation przy odświeżeniu | Stary refresh token inwalidowany | **High** |
| SEC-021 | HttpOnly cookies dla sesji (jeśli używane) | Cookie nie dostępne z JavaScript | **High** |
| SEC-022 | Secure flag na cookies w production | Cookies tylko przez HTTPS | **High** |
| SEC-023 | SameSite attribute na cookies | SameSite=Lax lub Strict | **Medium** |

### 5.4 Authorization & RLS

| ID | Scenariusz | Oczekiwany Wynik | Priorytet |
|----|-----------|------------------|-----------|
| SEC-030 | Próba dostępu do zasobów innego workspace | Status 403 lub 404 (RLS enforcement) | **Critical** |
| SEC-031 | Weryfikacja RLS policies w Supabase | Query jako user A nie zwraca danych user B | **Critical** |
| SEC-032 | Próba modyfikacji `user_id` w żądaniu | Ignorowane lub status 403 | **High** |

### 5.5 Common Vulnerabilities

| ID | Scenariusz | Oczekiwany Wynik | Priorytet |
|----|-----------|------------------|-----------|
| SEC-040 | SQL Injection w parametrach auth | Parametryzowane queries, brak wykonania SQL | **Critical** |
| SEC-041 | XSS w komunikatach błędów | Output escaped, brak wykonania skryptów | **High** |
| SEC-042 | CSRF protection w formach | CSRF tokens lub SameSite cookies | **High** |
| SEC-043 | Clickjacking (X-Frame-Options) | Header `X-Frame-Options: DENY` | **Medium** |
| SEC-044 | Open redirect w redirectTo params | Whitelist dozwolonych URL | **High** |

### 5.6 Rate Limiting & Brute Force

| ID | Scenariusz | Oczekiwany Wynik | Priorytet |
|----|-----------|------------------|-----------|
| SEC-050 | Brute force login (20+ prób) | Status 429, lockout 15 min | **Critical** |
| SEC-051 | Brute force recovery (10+ prób) | Status 429, lockout | **High** |
| SEC-052 | Rate limit per IP vs per user | Oddzielne liczniki | **Medium** |
| SEC-053 | Bypass rate limit przez różne IP | Implementacja captcha/challenge (post-MVP) | **Low** |

---

## 6. Testy Integracyjne

### 6.1 Integracja z Supabase Auth

| ID | Komponent | Test | Oczekiwany Wynik | Priorytet |
|----|-----------|------|------------------|-----------|
| INT-001 | RegisterHandler | `signUp()` sukces | User w `auth.users`, zwrócony UUID | **Critical** |
| INT-002 | RegisterHandler | `signUp()` failure (duplicate email) | AuthError, brak rekordu w `accounts` | **Critical** |
| INT-003 | LoginHandler | `signInWithPassword()` sukces | Tokeny zwrócone, sesja utworzona | **Critical** |
| INT-004 | LoginHandler | `signInWithPassword()` failure | AuthError 401, brak sesji | **Critical** |
| INT-005 | LogoutHandler | `signOut()` sukces | Sesja inwalidowana | **High** |
| INT-006 | RecoverHandler | `resetPasswordForEmail()` sukces | Email wysłany, status 200 | **High** |
| INT-007 | ResetPasswordHandler | `updateUser({ password })` sukces | Hasło zaktualizowane | **High** |

### 6.2 Integracja z Postgres (Drizzle ORM)

| ID | Komponent | Test | Oczekiwany Wynik | Priorytet |
|----|-----------|------|------------------|-----------|
| INT-010 | RegisterHandler | Insert do `accounts` | Rekord z `user_id`, `plan=FREE`, timestamps | **Critical** |
| INT-011 | RegisterHandler | Insert failure (constraint violation) | Error handled, rollback Supabase | **Critical** |
| INT-012 | GetSessionQuery | Select user by `user_id` | Profil zwrócony z workspace | **High** |
| INT-013 | GetSessionQuery | User nie istnieje | Null lub NotFoundError | **Medium** |

### 6.3 Integracja z Upstash Redis (Rate Limiting)

| ID | Komponent | Test | Oczekiwany Wynik | Priorytet |
|----|-----------|------|------------------|-----------|
| INT-020 | RateLimitMiddleware | Login rate limit | Po 20 próbach: 429, key w Redis | **High** |
| INT-021 | RateLimitMiddleware | Recovery rate limit | Po 10 próbach: 429, TTL w Redis | **High** |
| INT-022 | RateLimitMiddleware | Wygaśnięcie TTL | Po czasie limiter resetowany | **Medium** |

### 6.4 Integracja Next.js Middleware ↔ Supabase

| ID | Test | Oczekiwany Wynik | Priorytet |
|----|------|------------------|-----------|
| INT-030 | Middleware weryfikuje sesję | Wywołanie `getSession()`, sprawdzenie tokenu | **Critical** |
| INT-031 | Middleware odświeża wygasły token | `refreshSession()` wywołane, nowy token w cookies | **High** |
| INT-032 | Middleware przekierowuje niezalogowanych | Redirect do `/login` z `redirectTo` | **Critical** |

---

## 7. Wymagania Dotyczące Danych Testowych

### 7.1 Test Fixtures

**Lokalizacja**: `packages/db/src/test-fixtures/auth.fixtures.ts`

```typescript
export const testUsers = {
  validUser: {
    email: "test@example.com",
    password: "SecurePassword123!",
    plan: "FREE"
  },
  adminUser: {
    email: "admin@example.com",
    password: "AdminPass123!",
    plan: "PRO"
  },
  unconfirmedUser: {
    email: "unconfirmed@example.com",
    password: "Password123!",
    emailConfirmed: false
  }
}
```

### 7.2 Factory Functions

**Narzędzie**: `@faker-js/faker`

```typescript
import { faker } from '@faker-js/faker';

export const createRandomUser = () => ({
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName()
});
```

### 7.3 Test Database Seeding

**Strategia**:
- `beforeAll`: Seed podstawowych użytkowników (fixtures)
- `beforeEach`: Cleanup poprzednich testów (transakcja rollback)
- `afterEach`: Opcjonalny cleanup Redis keys
- `afterAll`: Teardown testcontainers

### 7.4 Mock Data dla OAuth

**Google OAuth Mock**:
```typescript
export const mockGoogleProfile = {
  id: "google-123456",
  email: "oauth.user@gmail.com",
  verified_email: true,
  name: "OAuth User",
  picture: "https://example.com/avatar.jpg"
}
```

### 7.5 Supabase Test Instance

**Konfiguracja**:
- Dedykowany projekt Supabase dla testów
- Environment variables: `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`
- Automated cleanup script po testach E2E

---

## 8. Kryteria Sukcesu

### 8.1 Kryteria Funkcjonalne

- ✅ Wszystkie critical i high priority test cases przechodzą (0 failures)
- ✅ 100% pokrycie critical paths (rejestracja, logowanie, recovery)
- ✅ Brak regression bugs w istniejących flow

### 8.2 Kryteria Niefunkcjonalne

- ✅ Code coverage >80% dla modułu auth (business logic)
- ✅ Czas wykonania testów unit <30s
- ✅ Czas wykonania testów integration <2min
- ✅ Czas wykonania testów E2E <5min
- ✅ Brak flaky tests (stabilność >98%)

### 8.3 Kryteria Bezpieczeństwa

- ✅ Wszystkie security test cases przechodzą
- ✅ OWASP Top 10 mitigated (SQL Injection, XSS, CSRF, etc.)
- ✅ Rate limiting działa poprawnie (429 po przekroczeniu)
- ✅ RLS policies weryfikowane i działające

### 8.4 Kryteria CI/CD

- ✅ Testy uruchamiane w pipeline (GitHub Actions)
- ✅ Pipeline fails przy nieprzechodzących testach
- ✅ Coverage report generowany i archiwizowany
- ✅ Deployment blokowany przy failures

---

## 9. Ryzyka i Mitigacje

### 9.1 Ryzyko: Flaky Tests w E2E

**Opis**: Testy E2E mogą być niestabilne z powodu warunków sieciowych, timeoutów Supabase.

**Mitigacja**:
- Użycie `waitForSelector` zamiast fixed timeouts
- Mock Supabase w E2E gdzie to możliwe
- Retry logic w Playwright (max 2 retries)
- Deterministic test data

### 9.2 Ryzyko: Supabase Rate Limiting w Testach

**Opis**: Duża liczba testów może przekroczyć limity Supabase test instance.

**Mitigacja**:
- Użycie dedykowanego projektu Supabase dla CI/CD
- Throttling testów (run in batches)
- Mock Supabase Client w większości unit testów
- Monitoring quota w Supabase dashboard

### 9.3 Ryzyko: Testcontainers Resource Leak

**Opis**: Containery Postgres mogą nie być czyszczone po testach.

**Mitigacja**:
- Explicit `afterAll` cleanup hooks
- Timeout na containery (auto-stop po 10min)
- Monitoring Docker w CI

### 9.4 Ryzyko: Asynchroniczność w Next.js Middleware

**Opis**: Middleware może nie czekać na zakończenie operacji asynchronicznych.

**Mitigacja**:
- Explicit `await` w middleware
- Unit testy middleware z mockowanym Supabase
- E2E weryfikacja przepływów z refresh token

### 9.5 Ryzyko: Brak Izolacji między Testami

**Opis**: Testy mogą wpływać na siebie nawzajem (shared state w Redis/DB).

**Mitigacja**:
- Transactional tests (rollback po każdym)
- Unique test data (faker + UUID)
- Redis namespaces dla testów (`test:{testId}:...`)
- Parallel execution z izolacją (Vitest workspaces)

### 9.6 Ryzyko: OAuth Testing Complexity

**Opis**: Testowanie OAuth flow wymaga symulacji zewnętrznych providerów.

**Mitigacja**:
- Mock OAuth callbacks w testach integration
- Użycie Playwright dla E2E OAuth (dev mode Google/GitHub)
- Dokumentacja setup OAuth test accounts

---

## 10. Harmonogram Testowania

### Faza 1: Unit Tests (Tydzień 1)
- Walidatory, schematy Zod
- Handlery CQRS z mockami
- React components (formularze)
- **Cel**: >80% coverage

### Faza 2: Integration Tests (Tydzień 2)
- API endpoints z Testcontainers
- Integracja Supabase (real instance)
- Rate limiting z Redis
- Transakcyjność i rollback

### Faza 3: E2E Tests (Tydzień 3)
- Krytyczne flow użytkownika
- Playwright setup i page objects
- Test data management
- CI/CD pipeline integration

### Faza 4: Security Testing (Tydzień 4)
- Penetration testing (manual)
- OWASP checklist verification
- Rate limit stress tests
- Security audit

### Faza 5: Regression & Stabilization (Ongoing)
- Fix flaky tests
- Optimize test execution time
- Documentation update
- Continuous monitoring

---

## 11. Metryki i Raportowanie

### 11.1 Metryki Zbierane

- **Test Coverage**: Statement, Branch, Function coverage (Vitest)
- **Test Execution Time**: Per suite i total
- **Pass Rate**: % testów przechodzących w każdym pipeline run
- **Flakiness Rate**: % testów, które przeszły po retry
- **Bug Detection Rate**: Liczba bugów wykrytych przez testy vs manual QA

### 11.2 Narzędzia Raportowania

- **Coverage**: Vitest Coverage HTML report
- **CI/CD**: GitHub Actions artifacts (test results, coverage)
- **Dashboard**: Optional - Codecov/Coveralls integration
- **Alerts**: Slack notification na failures w main branch

### 11.3 Frequency

- **Pull Request**: Run all tests, block merge on failure
- **Main Branch**: Run all tests + generate report
- **Nightly**: Extended E2E + security checks
- **Pre-release**: Full regression suite

---

## 12. Załączniki

### 12.1 Przykładowa Struktura Testów

```
apps/
  api/
    src/
      modules/
        auth/
          commands/
            register/
              register.handler.ts
              register.handler.test.ts          # Unit
              register.integration.test.ts      # Integration
          queries/
            get-session/
              get-session.handler.test.ts       # Unit
  dashboard/
    app/
      (auth)/
        login/
          page.tsx
          components/
            LoginForm.tsx
            LoginForm.test.tsx                  # React Testing Library
    e2e/
      auth/
        login.spec.ts                           # Playwright
        register.spec.ts
        recovery.spec.ts
```

### 12.2 Przykładowy Test Integration (Supertest)

```typescript
// apps/api/src/modules/auth/commands/register/register.integration.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '@/test-utils/create-app';
import { createTestSupabaseClient } from '@/test-utils/supabase';

describe('POST /v1/auth/register', () => {
  let app: any;
  let supabase: any;

  beforeAll(async () => {
    app = await createTestApp();
    supabase = createTestSupabaseClient();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register new user and create account record', async () => {
    const payload = {
      email: 'newuser@example.com',
      password: 'SecurePass123!'
    };

    const response = await request(app.server)
      .post('/v1/auth/register')
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(payload.email);

    // Verify account record
    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', response.body.user.id)
      .single();

    expect(account).toBeDefined();
    expect(account.plan).toBe('FREE');
  });

  it('should return 400 for duplicate email', async () => {
    // ... test implementation
  });
});
```

### 12.3 Przykładowy Test E2E (Playwright)

```typescript
// apps/dashboard/e2e/auth/login.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');

    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user avatar visible
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();

    // Verify still on login page
    await expect(page).toHaveURL('/login');
  });
});
```

---

## 13. Podsumowanie

Niniejszy plan testów definiuje kompleksową strategię weryfikacji modułu autentykacji w systemie Requil. Obejmuje wszystkie kluczowe funkcjonalności (rejestracja, logowanie, recovery) oraz aspekty bezpieczeństwa i integracji z Supabase.

**Kluczowe priorytety**:
1. **Critical paths**: Rejestracja, logowanie, recovery - 100% coverage
2. **Security**: Rate limiting, RLS, authentication bypass prevention
3. **Integration**: Synchronizacja Supabase ↔ Postgres, transakcyjność
4. **UX**: Formularze frontend, walidacja, komunikaty błędów

**Next Steps**:
1. Setup test infrastructure (Testcontainers, Playwright, fixtures)
2. Implementacja unit tests dla walidatorów i handlerów
3. Implementacja integration tests dla API endpoints
4. Implementacja E2E tests dla critical flows
5. Security audit i penetration testing
6. CI/CD pipeline integration
7. Continuous monitoring i maintenance

**Odpowiedzialność**:
- **Backend Team**: Unit + Integration tests (API)
- **Frontend Team**: Unit tests (React) + E2E assistance
- **QA/Security**: Security testing, test plan review
- **DevOps**: CI/CD setup, infrastructure

---

**Wersja dokumentu**: 1.0
**Data utworzenia**: 2024-12-09
**Autor**: AI Assistant
**Status**: Draft - Do Review

