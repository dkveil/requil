# Plan implementacji widoków Ustawień (Settings)

## 1. Przegląd
Moduł Ustawień umożliwia zarządzanie konfiguracją Workspace'u. Składa się z trzech głównych sekcji dostępnych przez nawigację boczną:
1.  **General:** Podstawowe dane workspace'u (nazwa, identyfikator).
2.  **Email Setup (Transport):** Konfiguracja dostawcy wysyłki e-maili (Resend lub SMTP) oraz weryfikacja połączenia.
3.  **Developers:** Zarządzanie kluczami API oraz konfiguracja Webhooków.

## 2. Routing widoku

Struktura oparta na Next.js App Router z Layoutem dla sekcji settings.

- **Layout:** `/settings` (renderuje pasek boczny i dzieci).
- **Przekierowanie:** Wejście na `/settings` powinno przekierować na `/settings/general`.
- **Podstrony:**
    - `/settings/general` - Ustawienia ogólne.
    - `/settings/transport` - Konfiguracja wysyłki.
    - `/settings/developers` - Klucze API i Webhooki.

## 3. Struktura komponentów

```text
apps/dashboard/app/[locale]/(app)/settings/
├── layout.tsx (SettingsLayout - SidebarNav + Children)
├── general/
│   └── page.tsx (GeneralSettingsPage)
│       └── UpdateWorkspaceForm (Formularz edycji nazwy/slug)
├── transport/
│   └── page.tsx (TransportSettingsPage)
│       ├── TransportStatusBadge (Wskaźnik weryfikacji)
│       ├── TransportProviderSelector (RadioGroup: Resend/SMTP)
│       ├── ResendConfigForm (Gdy wybrano Resend)
│       ├── SmtpConfigForm (Gdy wybrano SMTP)
│       └── VerifyConnectionButton (Akcja testowa)
└── developers/
    └── page.tsx (DevelopersSettingsPage)
        ├── ApiKeysSection (Card)
        │   ├── ApiKeysTable (Lista kluczy)
        │   └── CreateApiKeyDialog (Modal z flow: Form -> Success)
        └── WebhooksSection (Card)
            └── WebhookConfigForm (URL + Signing Secret)
```

## 4. Szczegóły komponentów

### `SettingsLayout`
- **Opis:** Wrapper zapewniający spójną nawigację boczną (Vertical Tabs).
- **Elementy:** `SidebarNav` (lista linków), `main` (content area).
- **Propsy:** `children: React.ReactNode`.

### `UpdateWorkspaceForm` (General)
- **Opis:** Formularz do zmiany nazwy i sluga workspace'u.
- **Elementy:** Inputy dla `name` i `slug`.
- **Walidacja:** Zgodna z `updateWorkspaceSchema` (slug regex, min/max length).
- **Interakcje:** Zmiana sluga może wymagać przeładowania/przekierowania, jeśli slug jest częścią URL (w tym projekcie `workspaceId` jest w URL lub sesji).

### `TransportSettingsPage` (Email Setup)
- **Opis:** Zarządza konfiguracją wysyłki.
- **Logika:**
    - **Wewnętrzny Resend (Domyślny/Aktywny):** Obecnie jedyna aktywna metoda wysyłki.
    - **Własny Resend (BYOK) (Coming Soon):** Opcja widoczna w UI, ale zablokowana (disabled) z informacją "Dostępne wkrótce". Pozwoli na podanie własnego klucza API Resend.
    - **Custom SMTP (Coming Soon):** Opcja widoczna w UI, ale zablokowana (disabled) z informacją "Dostępne wkrótce".
    - Wybór providera (Internal Resend / Custom Resend / SMTP).
    - Dla Custom Resend (Planowane): Pole na API Key.
    - Dla SMTP (Planowane): Host, Port, User, Password (pole hasła maskowane, edycja tylko nadpisuje).
    - Akcja "Verify Connection": Wysyła żądanie testowe do backendu.
- **Typy:** `TransportConfig` (union type).

### `ApiKeysSection` (Developers)
- **Opis:** Lista kluczy API i tworzenie nowych.
- **Główne elementy:**
    - Tabela: Name, Prefix (np. `rq_live_...`), Created At, Last Used.
    - Dialog Tworzenia:
        - **Krok 1:** Formularz (Nazwa).
        - **Krok 2 (Sukces):** Wyświetlenie pełnego klucza (`rq_live_xyz...`) z przyciskiem "Copy". Ostrzeżenie, że klucz nie zostanie pokazany ponownie.

### `WebhooksSection` (Developers)
- **Opis:** Konfiguracja endpointu do odbierania zdarzeń.
- **Elementy:** Input na URL, Pole `readOnly` z `Signing Secret` (z opcją "Copy" i "Roll Secret").

## 5. Typy

Wykorzystanie typów z `@relettr/types` oraz definicja nowych dla UI.

```typescript
// Import z @relettr/types
import { UpdateWorkspaceInput } from '@relettr/types';

// Typy Transportu (do dodania w types/src/transport/index.ts)
type TransportType = 'resend' | 'smtp';

interface ResendConfig {
  apiKey: string; // Przy odczycie z API może być zamaskowane lub puste
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass?: string; // Opcjonalne przy update (jeśli nie zmieniamy)
  secure: boolean;
}

// Typy API Keys
interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}
```

## 6. Zarządzanie stanem

- **Formularze:** `react-hook-form` + `zodResolver`.
- **API Data:** `useQuery` (pobranie konfiguracji) i `useMutation` (zapis).
- **Transport Security:** Hasła w formularzach są traktowane jako "write-only" przy edycji. Jeśli backend zwraca konfigurację, pole hasła jest puste lub zawiera placeholder `********`. Jeśli użytkownik je edytuje, wysyłamy nową wartość. Jeśli zostawi puste, nie wysyłamy pola `pass`.
- **Create Key Modal:** Lokalny stan kroku (`step`: 'form' | 'success') oraz przechowanie nowo utworzonego klucza (`newKey`: string | null) do wyświetlenia.

## 7. Integracja API

Wymagane endpointy (zakładane na podstawie konwencji):

1.  **Workspace Update:**
    - `PATCH /v1/workspaces/:id`
    - Body: `UpdateWorkspaceInput`
2.  **Transport:**
    - `GET /v1/workspaces/:id/transport`
    - `PUT /v1/workspaces/:id/transport` (Body: `{ type: 'resend' | 'smtp', config: ... }`)
    - `POST /v1/workspaces/:id/transport/verify` (Trigger test email)
3.  **API Keys:**
    - `GET /v1/api-keys?workspaceId=...`
    - `POST /v1/api-keys` (Response: `{ id, key: 'rq_live_...' }` - klucz wraca tylko tutaj)
    - `DELETE /v1/api-keys/:id`

## 8. Interakcje użytkownika

- **Kopiowanie:** Kliknięcie ikony "Copy" przy kluczu/sekrecie kopiuje treść do schowka i pokazuje toast "Copied!".
- **Weryfikacja Transportu:**
    1. Użytkownik klika "Verify Connection".
    2. Przycisk wchodzi w stan `loading`.
    3. Backend próbuje nawiązać połączenie SMTP lub Resend ping.
    4. Sukces -> Toast "Connection verified" + zmiana statusu na "Verified".
    5. Błąd -> Toast "Connection failed" ze szczegółami błędu.
- **Tworzenie klucza:** Użytkownik musi ręcznie zamknąć modal po skopiowaniu klucza.

## 9. Warunki i walidacja

- **Workspace Slug:** Regex `^[a-z0-9-]+$`.
- **Transport:**
    - SMTP Port: liczba.
    - Resend API Key: wymagany format (zaczyna się od `re_` zazwyczaj).
- **Uprawnienia:** Tylko rola `OWNER` może widzieć i edytować sekcję Developers oraz Transport.

## 10. Obsługa błędów

- **Formularze:** Walidacja inline (pod polami).
- **API Errors:** Globalny Toast (Sonner).
- **Critical Errors:** Jeśli nie można załadować ustawień, wyświetlenie komponentu `ErrorState` z przyciskiem "Retry".

## 11. Kroki implementacji

1.  **Setup Routingu:**
    - Utworzenie struktury katalogów w `apps/dashboard/app/[locale]/(app)/settings`.
    - Utworzenie `layout.tsx` z `SidebarNav`.

2.  **Implementacja General Settings:**
    - Utworzenie `general/page.tsx`.
    - Implementacja `UpdateWorkspaceForm` z wykorzystaniem `updateWorkspaceSchema`.

3.  **Implementacja Transport Settings:**
    - Utworzenie `transport/page.tsx`.
    - Stworzenie komponentów formularzy (`ResendForm`, `SmtpForm`).
    - **Zmiana:** Zablokowanie opcji SMTP w UI (status "Coming Soon"). Domyślne ustawienie na Resend.
    - Obsługa logiki przełączania i wysyłania konfiguracji (z uwzględnieniem maskowania haseł).
    - Implementacja akcji weryfikacji (`VerifyConnectionButton`).

4.  **Implementacja Developers Settings:**
    - Utworzenie `developers/page.tsx`.
    - Implementacja tabeli `ApiKeysList` (wykorzystanie `shadcn/ui` Table).
    - Implementacja `CreateApiKeyDialog` z dwuetapowym procesem (Form -> Display Key).
    - Dodanie sekcji `WebhookConfig`.

5.  **Integracja z Backendem:**
    - Podpięcie hooków data-fetching (lub mocków, jeśli endpointy jeszcze nie gotowe).
    - Obsługa stanów loading i error.

