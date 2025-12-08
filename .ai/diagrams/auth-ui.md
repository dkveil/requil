<architecture_analysis>
1. **Komponenty zidentyfikowane w specyfikacji (.ai/auth-spec.md):**
   - **Layouty:** `AuthLayout` (publiczny), `DashboardLayout` (chroniony).
   - **Strony (Server Components):** `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`.
   - **Formularze (Client Components):** `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`.
   - **Ochrona:** `Next.js Middleware` (weryfikacja sesji Supabase).
   - **Backend API:** `RegisterHandler`, `LoginHandler`, `LogoutHandler`, `RecoveryHandler` (proponowany).
   - **Baza danych/Auth:** `Supabase Auth` (tabela `auth.users`), `Postgres` (tabela `accounts`).

2. **Główne strony i komponenty:**
   - `/login` -> `LoginPage` -> `LoginForm`
   - `/register` -> `RegisterPage` -> `RegisterForm`
   - `/dashboard/*` -> `DashboardLayout` -> `DashboardPage`
   - `/auth/reset-password` -> `ResetPasswordPage` -> `ResetPasswordForm`

3. **Przepływ danych:**
   - Użytkownik wchodzi na stronę -> Middleware weryfikuje tokeny.
   - Formularze (Client) wysyłają żądania do API (Fastify).
   - API (CQRS) komunikuje się z Supabase Auth (Sign In/Up) i Bazą Danych (tworzenie konta).
   - Supabase zwraca tokeny sesji, które API przekazuje do Frontendu.

4. **Opis funkcjonalności:**
   - **AuthLayout:** Minimalistyczny kontener dla stron logowania/rejestracji.
   - **DashboardLayout:** Główny interfejs aplikacji z nawigacją, dostępny tylko dla zalogowanych.
   - **Middleware:** Strażnik routingu, sprawdza obecność i ważność ciasteczek sesyjnych.
   - **API Auth:** Warstwa pośrednia (BFF) zapewniająca spójność między tożsamością (Supabase) a danymi biznesowymi (tabela accounts).
</architecture_analysis>

```mermaid
flowchart TD
    %% Definicje stylów
    classDef layout fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef page fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    classDef component fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef api fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef external fill:#eeeeee,stroke:#616161,stroke-width:1px,stroke-dasharray: 5 5;
    classDef middleware fill:#ffccbc,stroke:#d84315,stroke-width:2px;

    User((Użytkownik))

    subgraph Client ["Aplikacja Next.js (Frontend)"]
        direction TB

        MW[("Next.js Middleware<br/>(Weryfikacja Sesji)")]:::middleware

        subgraph PublicZone ["Strefa Publiczna (Auth)"]
            AL[AuthLayout]:::layout

            subgraph Pages ["Strony (RSC)"]
                LP[Page: /login]:::page
                RP[Page: /register]:::page
                FPP[Page: /forgot-password]:::page
                RSP[Page: /reset-password]:::page
            end

            subgraph Forms ["Komponenty Klienckie (Forms)"]
                LF["LoginForm<br/>(useAuth)"]:::component
                RF["RegisterForm<br/>(zod + react-hook-form)"]:::component
                FPF["ForgotPasswordForm"]:::component
                RSF["ResetPasswordForm"]:::component
            end
        end

        subgraph PrivateZone ["Strefa Chroniona (Dashboard)"]
            DL[DashboardLayout]:::layout
            DP[Dashboard Page]:::page
            Nav[Sidebar / Topbar]:::component
        end
    end

    subgraph Server ["Backend API (Fastify)"]
        direction TB

        subgraph Handlers ["Auth Handlers (CQRS)"]
            H_Login["POST /v1/auth/login<br/>(LoginHandler)"]:::api
            H_Reg["POST /v1/auth/register<br/>(RegisterHandler)"]:::api
            H_Rec["POST /v1/auth/recover<br/>(RecoveryHandler)"]:::api
            H_Logout["POST /v1/auth/logout"]:::api
        end

        DB_Sync["Synchronizacja<br/>(Create Account)"]:::api
    end

    subgraph Infrastructure ["Infrastruktura Zewnętrzna"]
        Supabase[("Supabase Auth<br/>(Identity Provider)")]:::external
        Postgres[("Postgres DB<br/>(Tabela: accounts)")]:::external
        Email[("Email Service<br/>(Magic Link)")]:::external
    end

    %% Połączenia - Flow Użytkownika
    User --> MW
    MW -- "Brak Sesji" --> AL
    MW -- "Sesja OK" --> DL

    %% Połączenia - Layouty i Strony
    AL --> LP & RP & FPP & RSP
    DL --> Nav & DP

    LP --> LF
    RP --> RF
    FPP --> FPF
    RSP --> RSF

    %% Połączenia - Formularze do API
    LF -- "Credentials" --> H_Login
    RF -- "Dane Rejestracyjne" --> H_Reg
    FPF -- "Email" --> H_Rec
    RSF -- "Nowe Hasło" --> Supabase
    Nav -- "Wyloguj" --> H_Logout

    %% Połączenia - API do Infra
    H_Login -- "signInWithPassword" --> Supabase
    H_Reg -- "signUp" --> Supabase
    H_Reg -- "INSERT" --> Postgres
    H_Rec -- "resetPasswordForEmail" --> Supabase

    %% Połączenia - Infra zwrotne
    Supabase -- "Tokeny Sesji (JWT)" --> H_Login & H_Reg
    Supabase -- "Email Odzyskiwania" --> Email
    Email -- "Link z kodem" --> User

    %% Logika Transakcyjna
    H_Reg -.-> DB_Sync
    DB_Sync -.-> Postgres

    %% Stylizacja linków
    linkStyle default stroke:#333,stroke-width:1px;
```
