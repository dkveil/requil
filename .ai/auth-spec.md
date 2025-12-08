# Specyfikacja Architektury Autentykacji - Requil

Dokument ten opisuje szczegółową architekturę modułu autentykacji (Rejestracja, Logowanie, Odzyskiwanie Konta) w systemie Requil. Obejmuje warstwę interfejsu użytkownika (Next.js), logikę backendową (Fastify + CQRS) oraz integrację z Supabase Auth.

## 1. Architektura Interfejsu Użytkownika (Frontend)

Frontend aplikacji oparty jest o **Next.js App Router** i wykorzystuje podział na komponenty serwerowe (RSC) oraz klienckie (Client Components).

### 1.1. Layouty i Struktura Stron

Wyróżniamy dwa główne układy (Layouts) obsługujące różne stany użytkownika:

1.  **Auth Layout (`apps/dashboard/app/(auth)/layout.tsx`)**:
    *   **Przeznaczenie**: Obsługa stron publicznych związanych z procesem logowania i rejestracji.
    *   **Wygląd**: Minimalistyczny design, centrowany kontener (karta) na tle (np. gradient lub jednolity kolor), brak paska bocznego i nawigacji aplikacji.
    *   **Elementy**: Logo produktu, kontener formularza, linki pomocnicze (np. "Wróć do strony głównej").

2.  **Dashboard Layout (`apps/dashboard/app/(dashboard)/layout.tsx`)**:
    *   **Przeznaczenie**: Obsługa stron chronionych (wymagających zalogowania).
    *   **Mechanizm ochrony**: Middleware (`middleware.ts`) weryfikujący obecność sesji Supabase przed renderowaniem layoutu.
    *   **Elementy**: Sidebar nawigacyjny, Topbar z awatarem użytkownika (obsługa wylogowania), obszar roboczy (`children`).

### 1.2. Podział Odpowiedzialności: Strony vs Komponenty

Zgodnie z paradygmatem Next.js App Router:

*   **Strony (`page.tsx`)**: Są **Server Components**. Odpowiadają za:
    *   Zdefiniowanie metadanych SEO (`metadata`).
    *   Wstępne pobranie danych (jeśli dotyczy).
    *   Wyrenderowanie odpowiedniego komponentu klienckiego (formularza).
    *   Przykład: `apps/dashboard/app/(auth)/login/page.tsx` importuje i renderuje `<LoginForm />`.

*   **Formularze (`components/auth/*`)**: Są **Client Components** (`"use client"`). Odpowiadają za:
    *   Zarządzanie stanem formularza (`react-hook-form`).
    *   Walidację danych wejściowych (`zod` resolver).
    *   Komunikację z API backendowym (fetch / server actions).
    *   Obsługę interakcji UI (loading state, error messages).
    *   Przekierowanie po sukcesie (używając `useRouter`).

### 1.3. Kluczowe Komponenty i Formularze

1.  **`LoginForm`**:
    *   Pola: Email, Hasło.
    *   Akcje: Logowanie email/hasło, Logowanie OAuth (Google/GitHub).
    *   Linki: "Zarejestruj się", "Zapomniałeś hasła?".

2.  **`RegisterForm`**:
    *   Pola: Email, Hasło.
    *   Akcje: Rejestracja nowego konta.
    *   Logika: Po sukcesie wyświetla komunikat o konieczności potwierdzenia adresu email lub automatycznie loguje (zależnie od konfiguracji Supabase).

3.  **`ForgotPasswordForm`** (Nowy):
    *   Pola: Email.
    *   Akcje: Wysłanie linku resetującego hasło.

4.  **`ResetPasswordForm`** (Nowy):
    *   Pola: Nowe hasło, Potwierdź nowe hasło.
    *   Akcje: Ustawienie nowego hasła dla sesji odzyskanej z linku.

### 1.4. Walidacja i Obsługa Błędów (Frontend)

*   **Biblioteki**: `react-hook-form` do obsługi formularzy, `zod` do definicji schematów walidacji, `sonner` (lub inny toast) do powiadomień.
*   **Walidacja Kliencka**: Natychmiastowa informacja o błędnym formacie emaila, zbyt krótkim haśle itp.
*   **Obsługa Błędów API**: Przechwytywanie wyjątków z backendu i mapowanie ich na przyjazne komunikaty (np. "Nieprawidłowe dane logowania" zamiast 401).

---

## 2. Logika Backendowa (API)

Backend (`apps/api`) realizuje logikę biznesową w architekturze **CQRS (Command Query Responsibility Segregation)**, pośrednicząc między frontendem a usługą Supabase Auth i bazą danych.

### 2.1. Wzorzec CQRS

Struktura modułu `auth` jest podzielona na:
*   **Commands (Zapis)**: Obsługa akcji zmieniających stan (Logowanie, Rejestracja).
    *   `CreateUserCommand` / `RegisterHandler`
    *   `LoginUserCommand` / `LoginHandler`
*   **Queries (Odczyt)**: Pobieranie danych sesji lub profilu.
    *   `GetSessionQuery`

Taka separacja ułatwia testowanie, skalowanie i utrzymanie czystości kodu.

### 2.2. Modele i Endpointy API

API wystawia endpointy REST, które są wywoływane przez frontend:

1.  **POST `/v1/auth/register`**
    *   **Handler**: `RegisterHandler`.
    *   **Proces**:
        1.  Walidacja payloadu (Email, Password).
        2.  Wywołanie `supabase.auth.signUp()`.
        3.  **Transakcyjność**: Jeśli rejestracja w Supabase się powiedzie, handler tworzy rekord w lokalnej tabeli `accounts` (Postgres) z domyślnym planem (`FREE`).
        4.  Rollback: Jeśli utworzenie konta lokalnego się nie powiedzie, użytkownik w Supabase jest usuwany.
    *   **Odpowiedź**: Status 201, dane użytkownika.

2.  **POST `/v1/auth/login`**
    *   **Handler**: `LoginHandler`.
    *   **Proces**:
        1.  Wywołanie `supabase.auth.signInWithPassword()`.
        2.  Zwrócenie tokenów sesji (`access_token`, `refresh_token`) do klienta.
    *   **Odpowiedź**: Status 200, Tokeny + Profil użytkownika.

3.  **POST `/v1/auth/logout`**
    *   **Handler**: `LogoutHandler`.
    *   **Proces**: Inwalidacja sesji w Supabase.

### 2.3. Walidacja i Wyjątki

*   **Input Validation**: Wykorzystanie biblioteki walidacyjnej (np. Zod/TypeBox) na poziomie routera Fastify przed przekazaniem do Handlera.
*   **Error Handling**:
    *   Błędy z Supabase są przechwytywane i mapowane na domeny błędów aplikacji (np. `AuthError`).
    *   Globalny `ErrorHandler` w Fastify formatuje odpowiedź do jednolitego JSON-a z kodem błędu i wiadomością.

---

## 3. System Autentykacji (Supabase Integration)

Rdzeniem systemu tożsamości jest **Supabase Auth**. Backend API działa jako zaufany pośrednik (BFF - Backend for Frontend) lub orkiestrator procesów, zapewniając spójność danych.

### 3.1. Rejestracja i Logowanie

*   **Synchronizacja Danych**: Kluczowym aspektem jest synchronizacja tabeli `auth.users` (wewnętrzna tabela Supabase) z tabelą `public.accounts` (tabela aplikacji).
    *   Realizowane jest to w `RegisterHandler` w API.
    *   Alternatywnie (jako fallback) można wykorzystać Supabase Database Webhooks / Triggers, aby tworzyć rekord `accounts` po wstawieniu wiersza do `auth.users`. W obecnej architekturze API podejście imperatywne w Handlerze jest preferowane dla lepszej kontroli błędów.

### 3.2. Propozycja Rozwiązania: Odzyskiwanie Konta (Recovery Flow)

Obecnie system nie posiada zaimplementowanego flow odzyskiwania hasła. Proponuję następujące rozwiązanie:

#### A. Nowy Endpoint Backendowy: `POST /v1/auth/recover`

*   **Input**: `{ email: string }`
*   **Logika**:
    *   Handler wywołuje `supabase.auth.resetPasswordForEmail(email, { redirectTo: '${FRONTEND_URL}/auth/reset-password' })`.
    *   Supabase wysyła email systemowy do użytkownika z magic linkiem zawierającym kod autoryzacyjny (PKCE flow).

#### B. Nowa Strona Frontendowa: `/auth/reset-password`

*   **Działanie**:
    1.  Użytkownik klika w link z emaila -> trafia na tę stronę.
    2.  Supabase Auth Helper (na poziomie Middleware lub `useEffect`) wykrywa kod w URL i wymienia go na sesję użytkownika.
    3.  Użytkownik widzi formularz `ResetPasswordForm` (podaj nowe hasło).
    4.  Wysłanie formularza wywołuje update hasła (`supabase.auth.updateUser({ password: newPassword })`).

#### C. Ścieżka Użytkownika (User Journey)

1.  Użytkownik klika "Zapomniałem hasła" na ekranie logowania.
2.  Wpisuje email i zatwierdza.
3.  Otrzymuje email z linkiem.
4.  Klika link, zostaje przekierowany do aplikacji (automatyczne zalogowanie w trybie recovery).
5.  Ustawia nowe hasło.
6.  Zostaje przekierowany do Dashboardu.

---

## 4. Sugestie Usprawnień

1.  **Rate Limiting na Endpointach Auth**: Zabezpieczenie `/v1/auth/login` oraz `/v1/auth/recover` przed atakami Brute Force (wykorzystując np. Redis rate limiter w Fastify).
2.  **Obsługa OAuth po stronie Serwera**: Obecnie `login.handler.ts` obsługuje email/pass. Warto dodać endpoint lub logikę dla OAuth, aby po callbacku z Google/Github również następowała weryfikacja/utworzenie konta w tabeli `accounts`.
3.  **Middleware w Next.js**: Upewnienie się, że `middleware.ts` w Next.js poprawnie odświeża tokeny sesji (token rotation), aby użytkownik nie został wylogowany w trakcie pracy.
