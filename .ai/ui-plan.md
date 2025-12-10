# Architektura UI dla Requil (Email API Engine MVP)

## 1. Przegląd struktury UI

Interfejs użytkownika Requil został zaprojektowany jako "API-first Dashboard". Głównym celem jest umożliwienie deweloperom i małym zespołom jak najszybszego skonfigurowania infrastruktury e-mail (Time-to-first-send), stworzenia szablonów i monitorowania wysyłek.

Architektura opiera się na separacji trybów pracy:
1.  **Tryb Zarządzania (Dashboard/Settings/Logs):** Klasyczny interfejs administracyjny do konfiguracji i monitoringu.
2.  **Tryb Projektowania (Editor):** Pełnoekranowe środowisko "Focus Mode" do pracy nad treścią i kodem szablonu.

Kluczowe decyzje architektoniczne (zgodne z ustaleniami MVP):
*   Brak skomplikowanego cyklu wydawniczego (Draft/Publish) – model "Save & Go".
*   Brak dedykowanego zarządzania odbiorcami (CRM) – focus na logach transakcyjnych.
*   Logika "Click-to-Copy" dla zmiennych w edytorze.
*   Centralizacja danych technicznych (API Snippets) w widoku szczegółów szablonu.

## 2. Lista widoków

### A. Authentication & Onboarding
**(auth) / (welcome)**

1.  **Login / Register**
    *   **Ścieżka:** `/auth/login`, `/auth/register`
    *   **Cel:** Uwierzytelnienie użytkownika i dostęp do workspace.
    *   **Kluczowe informacje:** Formularz logowania (Email/Hasło, OAuth Github/Google).
    *   **UX/Security:** Walidacja haseł, obsługa błędów logowania, przekierowanie do ostatniego workspace.

2.  **Onboarding (Welcome)**
    *   **Ścieżka:** `/welcome` (lub stan pusty Dashboardu)
    *   **Cel:** Przeprowadzenie użytkownika przez "Golden Path".
    *   **Kluczowe komponenty:** Widget "Getting Started" z checklistą:
        1.  Setup Transport (SMTP/Resend).
        2.  Create Template.
        3.  Create API Key.
        4.  Send Test Email (cURL).
    *   **UX:** Dismissible widget (z możliwością zamknięcia), paski postępu.

### B. Dashboard
**(dashboard)**

3.  **Home (Overview)**
    *   **Ścieżka:** `/`
    *   **Cel:** Szybki wgląd w stan systemu i zużycie limitów.
    *   **Kluczowe informacje:**
        *   Widget "Getting Started" (jeśli nie ukończono).
        *   Statystyki "At a glance": Ilość wysłanych e-maili (24h/30d), zużycie limitu planu (prosty licznik).
        *   Ostatnie błędy (skrócona lista logów z błędem).
    *   **Kluczowe komponenty:** `StatsCard`, `ActivityFeed`, `OnboardingWidget`.

### C. Templates (Design)
**(dashboard) / (editor)**

4.  **Template List**
    *   **Ścieżka:** `/templates`
    *   **Cel:** Zarządzanie kolekcją szablonów.
    *   **Kluczowe informacje:** Tabela z kolumnami: Nazwa, `stableId` (kliknij, by skopiować), Ostatnia modyfikacja.
    *   **Akcje:** Create New, Delete.
    *   **UX:** Wyszukiwarka po nazwie/ID.

5.  **Create Template (Wizard)**
    *   **Ścieżka:** `/templates/create`
    *   **Cel:** Utworzenie nowego szablonu z wyborem metody startowej (Pusty, AI, Galeria).
    *   **Layout:** Formularz metadanych + Selektor metody startowej (poniżej).
    *   **Kluczowe komponenty:**
        *   **Metadata Form:** Pola z obecnego formularza (Nazwa, `stableId` auto-generowane, Opis).
        *   **Source Selector (Tabs/Grid):**
            *   **Opcja A: Blank Draft (Domyślna):** Tworzy pusty szablon. Karta aktywna.
            *   **Opcja B: AI Generate (Disabled):**
                *   UI: Textarea na prompt (disabled) z placeholderem (np. "Create a welcome email for new SaaS users...").
                *   UX: Label z Tooltipem informującym, że funkcjonalność jest w trakcie budowy ("Work in Progress").
            *   **Opcja C: Template Gallery:**
                *   UI: Grid z kartami szablonów.
                *   Stan Startowy: Wyświetla kartę "Blank Template" oraz `EmptyState` dla reszty z informacją "More templates coming soon".
    *   **Akcja:** Przycisk "Create Template" tworzy szkic i przekierowuje do Edytora (`/templates/[stableId]/edit`).

6.  **Template Details (The Hub)**
    *   **Ścieżka:** `/templates/[stableId]`
    *   **Cel:** Punkt centralny dla dewelopera integrującego szablon.
    *   **Kluczowe informacje:**
        *   Nagłówek: Nazwa, `stableId` (Copy button).
        *   Podgląd: Iframe/Image ostatnio zapisanej wersji.
        *   **Sekcja API Integration:** Dynamicznie generowany snippet cURL/Node.js z wypełnionym `stableId` i strukturą zmiennych zdefiniowanych w szablonie.
        *   Statystyki: Last sent (data).
    *   **Akcje:** Główny przycisk "Open Editor".

7.  **Template Editor (Focus Mode)**
    *   **Ścieżka:** `/templates/[stableId]/edit`
    *   **Cel:** Tworzenie i edycja struktury maila.
    *   **Layout:** Pełny ekran, brak nawigacji bocznej dashboardu.
    *   **Kluczowe komponenty:**
        *   **Top Bar:** Przycisk "Back" (do Details), Nazwa szablonu, Przycisk "Save" (atomowy zapis do DB).
        *   **Left Panel (Blocks):** Drag & drop komponentów (Text, Image, Button, Columns).
        *   **Center Canvas:** Wizualny edytor (WYSIWYG/React Email render).
        *   **Right Panel (Properties & Variables):**
            *   Tab *Properties*: Edycja stylów bloku.
            *   Tab *Variables*: Lista zdefiniowanych zmiennych. Przycisk "Copy {{var}}" przy każdej zmiennej. Pola input "Dummy Data" do podglądu w czasie rzeczywistym.
    *   **UX:** Toasty po zapisie ("Saved"), walidacja live (ale bez hard stop). Dane "Dummy" przechowywane w LocalStorage dla komfortu pracy.

### D. Monitoring (Logs)
**(dashboard)**

8.  **Send Logs (List)**
    *   **Ścieżka:** `/logs`
    *   **Cel:** Monitoring wysyłek i debugowanie problemów z dostarczalnością.
    *   **Kluczowe informacje:** Tabela: Status (Badge: Delivered/Bounced/Failed), Recipient Email, Template Name, Timestamp.
    *   **Filtry (Krytyczne):**
        *   Status (Multiselect).
        *   Date Range (Picker).
        *   Template (Dropdown).
        *   Recipient Search (Text input - pełne dopasowanie lub 'contains').
    *   **UX:** Paginacja (cursor-based), auto-refresh (opcjonalnie).

9.  **Log Details (Single View)**
    *   **Ścieżka:** `/logs/[jobId]`
    *   **Cel:** Głęboka analiza konkretnego zdarzenia wysyłki.
    *   **Kluczowe informacje:**
        *   **Timeline:** Wizualizacja kroków: Request Received -> Validated -> Rendered -> Sent to Transport -> Delivered/Bounced.
        *   **Request Payload:** Widok JSON ze zmiennymi przekazanymi w requeście (możliwość kopiowania do reprodukcji błędu).
        *   **Transport Response:** Surowa odpowiedź od SMTP/Resend (np. "550 User unknown", MessageID).
    *   **Bezpieczeństwo:** Maskowanie danych wrażliwych (jeśli dotyczy), dostęp tylko dla członków workspace.

### E. Configuration (Settings)
**(dashboard)**

10. **Settings Layout**
    *   **Ścieżka:** `/settings`
    *   **Struktura:** Pionowe zakładki (Vertical Tabs) po lewej stronie.

11. **Settings: General**
    *   **Ścieżka:** `/settings/general`
    *   **Cel:** Zarządzanie workspace'm.
    *   **Kluczowe informacje:** Nazwa Workspace, ID Workspace'u.

12. **Settings: Email Setup (Transport)**
    *   **Ścieżka:** `/settings/transport`
    *   **Cel:** Konfiguracja bramki wyjściowej e-mail (Single Active Transport).
    *   **Kluczowe komponenty:**
        *   Provider Selector (Radio/Dropdown: Resend / SMTP).
        *   Formularz konfiguracyjny (zależny od wyboru). Pola haseł maskowane.
        *   Action Bar: "Verify Connection" (wysyła test email na adres zalogowanego usera).
    *   **UX:** Jasny status weryfikacji (Verified / Unverified).

13. **Settings: Developers**
    *   **Ścieżka:** `/settings/developers`
    *   **Cel:** Zarządzanie dostępem API.
    *   **Sekcja API Keys:**
        *   Lista kluczy (Nazwa, Prefix `rq_live_...`, Created At, Last Used).
        *   Akcja "Create Key": Modal (Nazwa, Scopes) -> Modal "View Once" (Pełny klucz do skopiowania).
        *   Akcja "Revoke".
    *   **Sekcja Webhooks:** Input na URL endpointu, `Signing Secret` (ukryty, copyable).

## 3. Mapa podróży użytkownika (User Journey)

### Główny Scenariusz: "From Zero to First Email" (Onboarding)

1.  **Rejestracja:** Użytkownik zakłada konto i trafia na **Dashboard**.
2.  **Konfiguracja:** Widzi widget "Getting Started". Klika "Configure Transport".
3.  **Setup Transportu:** Przeniesienie do **Settings > Email Setup**. Wybiera "Resend", wkleja klucz, klika "Verify". Sukces -> Powrót do Dashboardu.
4.  **Projektowanie:** Klika "Create Template". Nadaje nazwę ("Welcome Email").
5.  **Edycja:** Trafia do **Template Editor**.
    *   Przeciąga blok tekstu.
    *   W panelu Variables dodaje zmienną `first_name`.
    *   Kopiuje `{{first_name}}` i wkleja do tekstu.
    *   W panelu Variables wpisuje "Damian" w pole Dummy Data -> Podgląd się aktualizuje.
    *   Klika "Save".
6.  **Integracja:** Klika "Back". Trafia na **Template Details**.
    *   Widzi sekcję "API Snippet". Kopiuje kod cURL.
7.  **Klucz API:** Zauważa, że potrzebuje klucza. Klika link w snippecie lub idzie do **Settings > Developers**. Generuje klucz, kopiuje go.
8.  **Wysyłka (Terminal):** Wykonuje request cURL w swoim terminalu.
9.  **Weryfikacja:** Wraca do aplikacji, klika **Logs**. Widzi swój request ze statusem "Delivered".

## 4. Układ i struktura nawigacji

### Global Navigation (Sidebar - Dashboard Layout)
Menu boczne widoczne we wszystkich widokach poza Edytorem i Auth.

*   **Logo / Workspace Switcher** (góra)
*   **Menu Items:**
    *   Dashboard (ikona Home) -> `/`
    *   Templates (ikona File/Layout) -> `/templates`
    *   Logs (ikona Activity/List) -> `/logs`
    *   Settings (ikona Settings) -> `/settings`
*   **User Profile / Logout** (dół)

### Editor Navigation (Top Bar)
Dedykowana nawigacja dla trybu skupienia.

*   **Left:** `< Back` (ikona strzałki + nazwa szablonu) -> powrót do `/templates/[id]`
*   **Center:** Nazwa szablonu (Editable) / Status zapisu
*   **Right:** `Save` (Primary Button), `Preview` (Toggle: Desktop/Mobile)

### Settings Navigation (Vertical Tabs)
Lokalna nawigacja wewnątrz sekcji `/settings`.

*   General
*   Email Setup (Transport)
*   Developers (API Keys & Webhooks)

## 5. Kluczowe komponenty

1.  **`DataGrid`**: Uniwersalna tabela z obsługą filtrowania, sortowania i paginacji. Używana w *Template List*, *Logs*, *API Keys List*. Musi wspierać "Empty States" z jasnym CTA.
2.  **`CodeSnippet`**: Komponent do wyświetlania kodu (cURL, JSON) z kolorowaniem składni i przyciskiem "Copy to Clipboard". Kluczowy w *Template Details* i *Log Details*.
3.  **`StatusBadge`**: Wizualna reprezentacja stanów (Success/Green, Error/Red, Warning/Yellow). Używana dla statusów logów, weryfikacji transportu.
4.  **`VariableManager`**: Komponent w sidebarze edytora. Lista zmiennych, przycisk kopiowania, inputy dla dummy data.
5.  **`OnboardingWidget`**: Progresywna lista zadań na Dashboardzie. Stan ukończenia każdego kroku musi być pobierany z backendu (np. `hasTransport`, `hasTemplates`).
6.  **`CopyButton`**: Mały, powtarzalny komponent (ikona schowka), umieszczany przy ID szablonów, kluczach API, zmiennych. Musi dawać feedback (tooltip "Copied!").

