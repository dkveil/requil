# Plan implementacji widoku Kreator Szablonów (Create Template Wizard)

## 1. Przegląd
Widok ten służy do tworzenia nowych szablonów e-mail w systemie. Działa jako "Wizard", pozwalając użytkownikowi zdefiniować metadane szablonu (nazwa, unikalny identyfikator, opis) oraz wybrać metodę startową (Pusty szablon, Generowanie AI, lub Galeria). W fazie MVP, opcja generowania AI i Galeria są widoczne, ale zablokowane lub ograniczone.

## 2. Routing widoku
- **Ścieżka:** `/templates/create`
- **Dostęp:** Wymaga uwierzytelnienia i aktywnego workspace.

## 3. Struktura komponentów

```text
apps/dashboard/app/[locale]/(app)/templates/create/page.tsx (Server Page)
└── CreateTemplateForm (Client Component - Container)
    ├── FormHeader (Tytuł i opis sekcji)
    ├── MetadataSection (Grupa pól formularza)
    │   ├── NameInput (Input text)
    │   ├── StableIdInput (Input text z logiką auto-slug)
    │   └── DescriptionInput (Textarea)
    ├── SourceSelector (Wybór metody startowej)
    │   ├── SelectionCard (Karta opcji: Blank/AI/Gallery)
    │   └── EmptyState (Dla opcji Gallery)
    └── FormActions (Przycisk Submit i Cancel)
```

## 4. Szczegóły komponentów

### `CreateTemplatePage`
- **Opis:** Główny wrapper strony. Pobiera `workspaceId` (z parametrów lub kontekstu serwerowego) i przekazuje go do formularza.
- **Odpowiedzialność:** Layout i SEO.

### `CreateTemplateForm`
- **Opis:** Główny komponent kliencki zawierający logikę formularza.
- **Główne elementy:** `Form` (z `shadcn/ui`), `useForm` hook.
- **Obsługiwane interakcje:**
    - Submit formularza.
    - Obsługa błędów API (np. duplikat `stableId`).
- **Walidacja:** Pełna walidacja Zod zgodna z `@relettr/types`.
- **Typy:** `CreateTemplateInput`.
- **Propsy:** `workspaceId: string`.

### `MetadataSection`
- **Opis:** Sekcja zawierająca pola tekstowe.
- **Kluczowa logika:**
    - Pole `Name`: Standardowy input.
    - Pole `StableId`: Input, który automatycznie generuje "slug" (kebab-case) na podstawie pola `Name`, dopóki użytkownik nie zmodyfikuje go ręcznie.
    - Pole `Description`: Opcjonalny opis.
- **Walidacja:**
    - `stableId`: Regex `^[a-z0-9-]+$`, min 3 znaki.

### `SourceSelector`
- **Opis:** Wizualny selektor metody startowej (Grid 3 kart).
- **Stany kart:**
    - **Blank Draft:** Aktywna, domyślnie wybrana.
    - **AI Generate:** Disabled (zablokowana), posiada Tooltip "Work in Progress".
    - **Template Gallery:** Wyświetla listę (na razie pustą/mock) z informacją "Coming soon".
- **Interakcja:** Zmienia wewnętrzny stan wyboru (choć w MVP zawsze finalnie tworzymy "Blank").

## 5. Typy

Wykorzystujemy istniejące typy z pakietu `@relettr/types`.

```typescript
// Import z @relettr/types
import { CreateTemplateInput, createTemplateSchema } from '@relettr/types';

// Typy pomocnicze dla UI
type TemplateSourceType = 'blank' | 'ai' | 'gallery';

interface CreateTemplateFormProps {
  workspaceId: string;
}
```

## 6. Zarządzanie stanem

Stan jest zarządzany lokalnie przez `react-hook-form`:
- **Form State:** Przechowuje wartości `name`, `stableId`, `description`, `workspaceId`.
- **Watchers:**
    - Obserwacja pola `name` w celu auto-uzupełniania `stableId`.
- **Local State:**
    - `isStableIdTouched`: boolean (useState) - zapobiega nadpisywaniu `stableId` przez auto-slug, jeśli użytkownik wpisał własną wartość.
    - `selectedSource`: TemplateSourceType (useState) - domyślnie 'blank'.

Hooki:
- `useForm<CreateTemplateInput>` z `zodResolver(createTemplateSchema)`.
- Custom hook `useCreateTemplate` (oparty na `fetch` lub server actions) do obsługi żądania POST.

## 7. Integracja API

**Endpoint:** `POST /v1/templates`

**Żądanie (Request Body):**
```json
{
  "workspaceId": "uuid",
  "name": "Welcome Email",
  "stableId": "welcome-email",
  "description": "Optional description",
  "document": {} // Opcjonalnie, dla 'blank' puste
}
```

**Odpowiedź (Response Success):**
```json
{
  "id": "uuid",
  "stableId": "welcome-email",
  ...
}
```

**Obsługa błędów:**
- `409 Conflict`: Jeśli `stableId` jest zajęty -> ustawienie błędu formularza `setError('stableId', ...)`.
- `400 Bad Request`: Błędy walidacji.

## 8. Interakcje użytkownika

1.  **Wejście na stronę:** Użytkownik widzi formularz z domyślnie wybraną opcją "Blank Draft".
2.  **Wpisanie nazwy:**
    - Użytkownik wpisuje "Newsletter Grudzień".
    - Pole `stableId` automatycznie zmienia się na "newsletter-grudzien".
3.  **Edycja ID (Opcjonalnie):**
    - Użytkownik ręcznie zmienia `stableId` na "news-12".
    - Auto-generowanie zostaje wyłączone dla tej sesji.
4.  **Próba wyboru AI:**
    - Użytkownik najeżdża na kartę "AI Generate".
    - Pojawia się tooltip "Funkcjonalność dostępna wkrótce".
    - Kliknięcie jest zablokowane.
5.  **Zatwierdzenie:**
    - Kliknięcie "Create Template".
    - Wyświetlenie stanu loading na przycisku.
    - Po sukcesie: Przekierowanie do `/templates/news-12/edit`.

## 9. Warunki i walidacja

Walidacja realizowana przez schemat Zod (`createTemplateSchema`):
- **Name:** Wymagane, min 1 znak.
- **Stable ID:** Wymagane, min 3 znaki, tylko małe litery, cyfry i myślniki (regex).
- **Workspace ID:** UUID (musi być wstrzyknięte do formularza).

## 10. Obsługa błędów

- **Globalne:** Toast (Sonner) z komunikatem "Failed to create template".
- **Polowe (Field-level):** Komunikaty pod inputami (np. "Stable ID is already taken").
- **Sieciowe:** Obsługa w hooku `useCreateTemplate`.

## 11. Kroki implementacji

1.  **Przygotowanie Struktury:**
    - Utworzenie folderu `apps/dashboard/app/[locale]/(app)/templates/create/`.
    - Utworzenie `page.tsx`.

2.  **Implementacja Formularza (Skeleton):**
    - Utworzenie `apps/dashboard/features/templates/components/create-template-form.tsx`.
    - Konfiguracja `useForm` z `zodResolver` i schematem z `@relettr/types`.

3.  **Implementacja Logiki Auto-Slug:**
    - Dodanie `useEffect` nasłuchującego na zmiany `name`.
    - Implementacja prostej funkcji `slugify` (lub użycie biblioteki, jeśli dostępna).
    - Aktualizacja pola `stableId` przez `setValue`.

4.  **Budowa UI Selektora Źródła:**
    - Implementacja kart wyboru przy użyciu komponentów `Card` z `shadcn/ui`.
    - Ostylowanie stanu disabled dla karty AI.

5.  **Integracja z API:**
    - Implementacja funkcji fetchującej do `/api/v1/templates` (lub użycie istniejącego klienta API).
    - Obsługa przekierowania `router.push`.

6.  **Finalizacja i Style:**
    - Dopracowanie odstępów i typografii zgodnie z design systemem.
    - Dodanie tooltipów dla zablokowanych elementów.

