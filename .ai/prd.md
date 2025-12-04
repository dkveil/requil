# Dokument wymagań produktu (PRD) - Requil

## 1. Przegląd produktu

ReLettr to API-first engine do generowania (AI), walidacji, renderowania i wysyłki e‑maili transakcyjnych i kampanijnych. MVP konsoliduje rozproszony dziś proces: od tworzenia szablonów React Email (komponenty TSX) i twardej walidacji jakości, przez per‑odbiorcę render, po niezawodną wysyłkę przez adaptery Resend lub SMTP. Orkiestrację retry i batchów zapewnia QStash, a rate‑limiting, idempotencję i cache realizuje Upstash Redis. Nad silnikiem działa prosty edytor z guardrails.

Zakres MVP
- Silnik szablonów: AI Generate, walidacja zmiennych i jakości, publikacja snapshotu (immutable), render, automatyczny plaintext
- API: POST /v1/send (walidacja → render → wysyłka, idempotencja), POST /v1/templates/:stableId/validate (pre‑check), proste /v1/usage
- Wysyłka: adaptery Resend i SMTP, podstawowe deliverability (SPF/DKIM, List‑Unsubscribe, suppression)
- Orkiestracja i odporność: QStash retry z backoff, fan‑out batchów, proste planowanie
- Redis: rate limit per workspace/transport, idempotencja żądań, cache, progres kampanii
- Edytor: drag‑and‑drop, AI‑refine, panel variables, checklista jakości, publish (snapshot)
- Bezpieczeństwo: API Keys ze scope'ami, RLS (Supabase), szyfrowanie SMTP creds, HMAC webhooków, audyt
- SDK typów: @relettr/types generowane z OpenAPI (bez klienta HTTP)

Grupa docelowa
- Programiści, którzy chcą skupić w jednym miejscu szybkie tworzenie i wysyłkę e‑mail oraz małe i średnie zespoły produktowo‑marketingowe

Golden path
- Edytor/AI → publish szablonu → jeden POST do /v1/send → monitoring statusów

Wysokopoziomowa architektura
- Monolit aplikacyjny (API + render + wysyłka + endpointy workerowe wywoływane przez QStash; bez osobnego serwisu worker w MVP) w turborepo, QStash do retry/batch, Upstash Redis do limitów i cache, adaptery transportów (Resend/SMTP) i dashboard podstawowy
- Front: dwa niezależne fronty – Dashboard (Next.js App Router) i Website (Astro lub Next.js SSG)


## 2. Problem użytkownika

Kontekst i bolączki
- Rozproszenie narzędzi: edytory, walidatory, silniki renderujące i wysyłkowe nie są zintegrowane
- Brak twardej walidacji jakości (kontrast, alt‑texty, HTTPS), niespójna walidacja zmiennych
- Trudna obsługa retry/limiterów i kolejek w dużych kampaniach; brak odporności na błędy i idempotencji
- Brak wersjonowania szablonów i przewidywalnego DX; duże ryzyko regresji copy/HTML

Pożądane rezultaty
- Jedno, przewidywalne miejsce do generacji, walidacji i wysyłki e‑maili
- Twarde guardrails jakości i walidacja zmiennych przed każdym renderem/wysyłką
- Stabilna orkiestracja batchów i retry, brak duplikatów dzięki idempotencji
- Deterministyczna publikacja snapshotu w MVP; pełne wersjonowanie i changelog po MVP

Ograniczenia i założenia
- API‑first, serwerowy render, transport po stronie ReLettr (Resend/SMTP)
- W MVP brak pełnego SDK HTTP, brak journey builder i A/B testów
- Koszty pod kontrolą dzięki QStash + Redis i rozliczaniu renderów/sendów/AI


## 3. Wymagania funkcjonalne

3.1 Silnik szablonów
- AI Generate (serwerowo): prompt + brandKit → React Email (TSX), variablesSchema, subjectLines[], preheader, notes[], safety.flags[]
- Guardrails jakości: WCAG AA (kontrast z auto‑fixem), alt‑texty 100%, tylko HTTPS + rel="noopener", limity długości (nagłówek/CTA/akapit), HTML < 150 kB (hard‑stop), automatyczny plaintext
- Publikacja snapshotu: stableId + template_snapshot_id (immutable), audyt publikacji; pełne wersjonowanie/changelog/compatibility check po MVP
- Walidacja zmiennych w czasie żądania; tryby strict/permissive; defaulty w schemacie; breaking change = nowa wersja schematu
 - Walidacja zmiennych w czasie żądania; tryby strict/permissive; defaulty w schemacie; breaking change = nowy snapshot schematu (pełne wersjonowanie po MVP)
- Cache: skompilowany HTML (z React Email) i brandKit w Redis

3.2 API
- POST /v1/send: centralny endpoint (walidacja → render per odbiorca → wysyłka transportem)
  - Body: transport ('resend'|'smtp'), stableId, subject, preheader, to[]: { email, variables }
  - Używa opublikowanego snapshotu; w MVP brak możliwości override wersji
  - Idempotencja przez nagłówek Idempotency‑Key: lock:send:{key} w Redis (TTL) + utrwalenie wyniku pod result:send:{key}; klucz powiązany z hash(ciała żądania). Identyczne żądanie w TTL zwraca ten sam wynik; różne body z tym samym kluczem → 409
  - Odpowiedź: { ok, jobId, sent, failed, failed_recipients?, used_template_snapshot_id, warnings[] } lub 400 ValidationError (bez wysyłki)
  - 409 gdy brak opublikowanego snapshotu dla stableId
- POST /v1/templates/:stableId/validate: pre‑check (sprawdza variables vs schema + guardrails; nie wysyła)
  - Odpowiedź: { ok, errors[], warnings[] }
- /v1/usage: prosty odczyt zużycia renderów/sendów/AI i progi planu (alert przy 80%)
- Taksonomia błędów: ValidationError, TransportError‑Transient/Permanent, Bounce‑Hard/Soft

3.3 Wysyłka i transporty
- Adaptery: Resend (szybki start, deliverability) oraz własny SMTP (dedykowane IP/tuning)
- Konfiguracja per workspace: brandKit i dane firmy do AI Generate, klucz Resend (BYOK) lub dane SMTP (szyfrowane), weryfikacja nadawcy, API Keys do używania endpointów
 - Deliverability: kreator SPF/DKIM, List‑Unsubscribe, suppression list (hard bounce/complaint)
 - Webhooki (HMAC): delivered, opened, clicked, bounced; payload zawiera template_version, recipient, transport; retry via QStash

3.4 Orkiestracja i odporność
- QStash: retry z exponential backoff (do 5 prób, max backoff 15 min), fan‑out kampanii na porcje (np. 500 odbiorców), proste planowanie (cron/at)
- W MVP QStash wywołuje endpointy HTTP monolitu (worker‑as‑HTTP); wydzielenie osobnego serwisu worker po MVP
- DLQ w Redis (proste), ręczny replay po MVP

3.5 Redis i limity
- Rate limiting (token bucket) per workspace i per transport; startowe RPS według planu
- Idempotencja: lock:send:{Idempotency‑Key} + hash(ciała) + result:send:{key} (utrwalony wynik) z TTL; deduplikacja żądań i statusy per‑recipient dla częściowych sukcesów
- Cache: variablesSchema, skompilowany HTML (z React Email), brandKit; liczniki progresu kampanii i checkpointy

3.6 Edytor
- Drag‑and‑drop oparty na React Email – presety bloków (tekst, obraz, CTA, kolumny 2/3, divider, stopka)
- Spójność między widokiem w edytorze a generowanym HTML dzięki współdzielonym komponentom React Email
- AI‑refine fragmentów (skrót, ton, tłumaczenie, regeneracja sekcji)
- Panel Variables z żywą walidacją wg variablesSchema
- Checklista jakości: kontrast/alt/linki/rozmiar/placeholdery
- Publikacja: draft → published snapshot (immutable); audyt publikacji; bez pełnego rollback w MVP (opcjonalnie: 1‑step rollback do poprzedniego snapshotu)

3.7 Newsletter demo (poza zakresem MVP – do rozważenia w przyszłości)
- Formularze: hostowana strona i embed; double opt‑in
- Subskrybenci: atrybuty (JSONB), tagi, statusy; suppression i List‑Unsubscribe honorowane
- Kampania jednorazowa: wybór szablonu/segmentu → /v1/send transportem wybranym przez workspace
- Tracking: piksel open (wyłączenie po MVP), redirect click; podstawowe dashboardy

Uwaga: Funkcjonalność newsletter demo została przeniesiona poza zakres MVP. Decyzja o wprowadzeniu tej funkcjonalności zostanie podjęta w przyszłości na podstawie feedbacku użytkowników i priorytetów biznesowych.

3.8 Bezpieczeństwo i zgodność
- API Keys (hash + scopes), RLS (Supabase), role minimalne: owner/member
- Szyfrowanie SMTP creds (KMS: AES‑256‑GCM envelope; alternatywnie libsodium/XChaCha20‑Poly1305), rotacja sekretów
- Rate limit (Redis), idempotencja sendów (Redis locks + Idempotency‑Key)
- Audyt: tworzenie kluczy, wysyłki, publikacje snapshotów; metryki p95 render/send; retencja logów 90 dni
 - Webhook HMAC; wyłączenie open trackingu – po MVP

3.9 SDK – tylko typy
- Pakiet NPM @relettr/types generowany z OpenAPI: typy request/response dla /v1/send, /v1/templates/:stableId/validate i eventów webhooków; typy błędów

3.10 Wymagania niefunkcjonalne
- Wydajność: render p95 < 300 ms (po rozgrzaniu, cache Redis), send accept p95 < 1 s
- Jakość: HTML < 150 kB, 100% alt‑textów, brak krytycznych błędów kontrastu
- Odporność: ≥98% delivered (poza hard bounce), brak duplikatów (idempotencja), 0 stucked jobs
- Skalowanie: stabilne RPS zgodnie z planem; fan‑out batchów; brak degradacji DX
- Obserwowalność: pino (JSON + traceId) i Sentry (errors), logi audytowe, metryki, alert 80% zużycia planu; OpenTelemetry po MVP


## 4. Granice produktu

Poza zakresem MVP
- Newsletter demo (double opt‑in, lista subskrybentów, kampanie, tracking) – do rozważenia w przyszłości
- Pełne SDK (klient HTTP), CLI, rozszerzenia IDE
- Zaawansowane automations/drip, journey builder, A/B testy
- Szerokie integracje CRM/ESP (poza Resend/SMTP)
- RBAC enterprise (poza owner/member), SSO, SLA multi‑region
- Wielokanałowość (SMS/push), personalizacja 1:1 w locie
- Kafka/Redpanda i realtime event streaming/analityka (QStash + Redis wystarczą w MVP)

Odkładane decyzje i uproszczenia
- Standard variablesSchema: rekomendacja JSON Schema, możliwość konwersji z/do Zod
- Idempotencja/deduplikacja: hash ciała + TTL i retencja wyników (per‑recipient); parametry TTL/retencji do finalizacji
- Startowe limity batch/concurrency i progi rate‑limit per plan (min/24h) do finalizacji
- Minimalny payload webhooków + HMAC; opened/clicked mogą być opcjonalne w pierwszej iteracji
- i18n stopek (EN/PL) oraz prosty podział ról przy publikacji – w najprostszym kształcie


Priorytety (MVP vs po MVP)
- MVP (must‑have, fokus na developera):
  - /v1/send z to[] (jawni odbiorcy), idempotencja, walidacja i guardrails, render per odbiorca, adapter Resend/SMTP (BYOK), HMAC webhooki (delivered, bounced), suppression list, publikacja snapshotu
  - /v1/templates/:stableId/validate (pre‑check), cache, rate‑limit, minimalne logi audytowe (US‑028 MVP‑min)
  - Bezpieczeństwo: API Keys + scopes, szyfrowanie SMTP creds, RLS
- Po MVP (nice‑to‑have, marketer/operator):
  - Newsletter demo: double opt‑in, lista subskrybentów, jednorazowa kampania, tracking (do rozważenia)
  - Wyłączenie open trackingu (US‑023), advanced dashboardy, opened/clicked w pełnym zakresie
  - Planowanie kampanii w UI, zaawansowane segmentacje, rozbudowane metryki p95 i raporty
  - Pełne wersjonowanie/changelog, rollback wielopoziomowy


## 5. Historyjki użytkowników

Poniżej komplet historyjek z unikalnymi identyfikatorami i kryteriami akceptacji. Każda historia jest testowalna.

1) ID: US-001
Tytuł: Rejestracja i utworzenie workspace
Opis: Jako developer chcę utworzyć konto i pierwszy workspace, aby zarządzać kluczami i szablonami.
Kryteria akceptacji:
- Mamy możliwość rejestracji za pomocą Gmail, Github oraz zwykłych Credentials.
- Po rejestracji tworzymy swój pierwszy workspace
- Klucz API ma co najmniej jeden scope i można go dezaktywować/rotować
- RLS gwarantuje, że zasoby są odizolowane per workspace

1) ID: US-002
Tytuł: AI Generate szablonu
Opis: Jako developer chcę wygenerować bazowy szablon React Email na podstawie promptu i brandKit.
Kryteria akceptacji:
- Wejście: prompt, brandKit; wyjście zawiera React Email (TSX), variablesSchema, subjectLines[], preheader
- Wynik zawiera safety.flags[] i notes[]
- Wygenerowany HTML po kompilacji przechodzi guardrails lub zwraca ostrzeżenia/błędy

1) ID: US-003
Tytuł: Edycja szablonu w edytorze
Opis: Jako marketer chcę modyfikować blokami treści i wstawiać zmienne (props).
Kryteria akceptacji:
- Dostępne bloki: tekst, obraz, CTA, 2/3 kolumny, divider, stopka
- Podgląd mobile/desktop odzwierciedla zmienne (React Email props) z przykładowymi wartościami
- Zmiany zapisują się jako draft; brak wpływu na opublikowane wersje
- Spójność między widokiem w edytorze a generowanym HTML dzięki komponentom React Email

1) ID: US-004
Tytuł: Checklista jakości w edytorze
Opis: Jako użytkownik chcę widzieć problemy jakości i mieć auto‑fix kontrastu.
Kryteria akceptacji:
- Wykrywane: brak alt‑text, link HTTP, kontrast, rozmiar HTML, placeholdery
- Auto‑fix kontrastu nie łamie brandKit (tolerancja w granicach WCAG AA)
- Hard‑stop dla HTML ≥ 150 kB; inne jako warnings

1) ID: US-005
Tytuł: Publikacja snapshotu szablonu
Opis: Jako owner chcę opublikować niezmienny snapshot, który będzie używany w wysyłkach.
Kryteria akceptacji:
- Draft → published snapshot (immutable), zapis audytowy
- Brak wymogu changelog i compatibility check w MVP
- 409 przy /v1/send, jeśli nie ma opublikowanego snapshotu dla stableId



1) ID: US-007
Tytuł: Pre‑check walidacji przez API
Opis: Jako developer chcę sprawdzić variables i guardrails bez wysyłki.
Kryteria akceptacji:
- POST /v1/templates/:stableId/validate zwraca { ok, errors[], warnings[] }
- Errors zawiera konkretne ścieżki pól i kody reguł
- Brak efektów ubocznych (żadnych sendów ani billing za send)

1) ID: US-008
Tytuł: Wysyłka przez /v1/send z opublikowanym snapshotem
Opis: Jako developer chcę wysłać e‑maile renderowane per odbiorca.
Kryteria akceptacji:
- Wysyłka używa ostatniego opublikowanego snapshotu dla stableId
- Render i walidacja wykonywane są dla każdego odbiorcy; błędy blokują wysyłkę
- Response zawiera sent, failed, failed_recipients? oraz used_template_snapshot_id



1)  ID: US-010
Tytuł: Idempotencja żądań send
Opis: Jako developer chcę bezpiecznie ponawiać żądania bez duplikatów.
Kryteria akceptacji:
- Nagłówek Idempotency‑Key tworzy blokadę w Redis (lock:send:{key})
- Identyczne żądanie w TTL zwraca ten sam wynik bez ponownej wysyłki
- Zmiana ciała żądania z tym samym kluczem skutkuje 409 lub nowym kluczem

1)  ID: US-011
Tytuł: Rate limiting per plan i transport
Opis: Jako operator chcę chronić system i plany przed nadużyciami.
Kryteria akceptacji:
- Token bucket per workspace i per transport, limity zależne od planu
- Przekroczenie limitu zwraca 429 z Retry‑After
- Zdarzenia są audytowane, a UI pokazuje przekroczenia

1)  ID: US-012
Tytuł: Retry z exponential backoff
Opis: Jako operator chcę automatycznych retry dla transient errors.
Kryteria akceptacji:
- QStash wykonuje do 5 prób z backoffem do 15 minut
- Permanentne błędy nie są ponawiane i trafiają do DLQ
- Metadane retry są dostępne w logach i progresie kampanii

1)  ID: US-013
Tytuł: Wybór transportu Resend vs SMTP
Opis: Jako owner chcę konfigurować transport per workspace.
Kryteria akceptacji:
- Konfiguracja zawiera poprawne klucze/poświadczenia i status weryfikacji
- BYOK: wprowadzam własny klucz Resend albo własny Custom SMTP zgodny z Transport API
- Zapis konfiguracji waliduje poświadczenia (ping/test) i stan dostawcy
- Wysyłka używa transportu z konfiguracji lub jawnie wskazanego w żądaniu
- Błędna konfiguracja skutkuje czytelnym TransportError

1)  ID: US-014
Tytuł: Szyfrowanie poświadczeń SMTP
Opis: Jako administrator chcę bezpiecznie przechowywać dane SMTP.
Kryteria akceptacji:
- Poświadczenia zapisywane są w postaci zaszyfrowanej (np. libsodium/XChaCha20-Poly1305 lub AES-256-GCM w KMS)
- Rotacja sekretów nie ujawnia danych w logach
- Odczyt następuje wyłącznie w kontekście wysyłki

15) ID: US-015
Tytuł: Weryfikacja nadawcy i DNS
Opis: Jako owner chcę przejść kreator SPF/DKIM i wykonać test send.
Kryteria akceptacji:
- UI/API raportuje status rekordów SPF/DKIM
- Test send kończy się accepted by transport lub zwraca jasny błąd
- List‑Unsubscribe wstawiany dla zweryfikowanych nadawców

1)  ID: US-016
Tytuł: Webhooki zdarzeń z HMAC
Opis: Jako integrator chcę bezpiecznie konsumować delivered/opened/clicked/bounced.
Kryteria akceptacji:
- Podpis HMAC jest weryfikowalny po stronie odbiorcy
- Retry webhooków zarządzany przez QStash aż do sukcesu lub limitu prób
- Payload zawiera recipient, template_snapshot_id, transport i event‑time

1)  ID: US-017
Tytuł: Suppression list
Opis: Jako operator chcę nie wysyłać do odbiorców z hard bounce/complaint.
Kryteria akceptacji:
- Odbiorcy na suppression są pomijani przed wysyłką
- Response enumeruje failed_recipients z powodem suppression
- Lista aktualizuje się na podstawie webhooków bounce/complaint

1)  ID: US-018
Tytuł: Nagłówek List‑Unsubscribe
Opis: Jako odbiorca chcę mieć prostą ścieżkę rezygnacji.
Kryteria akceptacji:
- List‑Unsubscribe dodawany do wszystkich kampanii
- Link prowadzi do hostowanej strony rezygnacji i aktualizuje status
- Zmiana statusu wpływa na suppression list

1)  ID: US-019 (po MVP – do rozważenia)
Tytuł: Formularz double opt‑in (hostowany)
Opis: Jako marketer chcę zbierać subskrybentów z potwierdzeniem.
Kryteria akceptacji:
- Rejestracja tworzy rekord w statusie pending; wysyłany jest e‑mail potwierdzający
- Kliknięcie w link potwierdza i ustawia status active
- Próba wielokrotna respektuje idempotencję i suppression

1)  ID: US-020 (po MVP – do rozważenia)
Tytuł: Embed formularza na stronie
Opis: Jako developer chcę łatwo osadzić formularz.
Kryteria akceptacji:
- Dostępny skrypt embed z dokumentacją a11y i RODO
- Walidacja e‑mail po stronie klienta i serwera
- CORS i rate limit chronią endpointy

1)  ID: US-021 (po MVP – do rozważenia)
Tytuł: Zarządzanie subskrybentami i tagami
Opis: Jako marketer chcę atrybuty JSONB, tagi i statusy.
Kryteria akceptacji:
- CRUD subskrybentów z walidacją danych
- Filtrowanie po tagach i atrybutach przy kampanii
- Zmiana statusu wpływa na wysyłkę i suppression

1)  ID: US-022 (po MVP – do rozważenia)
Tytuł: Kampania jednorazowa przez /v1/send
Opis: Jako marketer chcę wysłać kampanię do segmentu.
Kryteria akceptacji:
- Segment tłumaczony jest na listę odbiorców to[]
- Kampania używa wybranego szablonu i transportu
- Dashboard pokazuje sent/failed oraz podstawowe wskaźniki

1)  ID: US-023 (po MVP)
Tytuł: Wyłączenie open trackingu
Opis: Jako administrator chcę móc wyłączyć piksel open.
Kryteria akceptacji (po MVP):
- Flaga na workspace lub kampanii wyłącza wstrzykiwanie piksela
- Webhook opened nie jest generowany przy wyłączonej opcji
- Zmiana jest audytowana

1)  ID: US-024
Tytuł: Click tracking z redirectem
Opis: Jako operator chcę mierzyć kliknięcia bez naruszania prywatności.
Kryteria akceptacji:
- Linki są przepuszczane przez redirect z minimalnym parametryzowaniem
- Webhook clicked generowany po udanym redirect
- HTTPS i rel="noopener" wymagane dla wszystkich linków

1)  ID: US-025
Tytuł: /v1/usage i alert 80%
Opis: Jako owner chcę kontrolować zużycie planu.
Kryteria akceptacji:
- Endpoint zwraca liczniki renderów/sendów/AI i limity planu
- Alert e‑mail przy 80% zużycia
- Po przekroczeniu twardy stop z jasnym komunikatem 402/429

1)  ID: US-026
Tytuł: Cache renderu i brandKit
Opis: Jako developer chcę niskich czasów p95 renderu.
Kryteria akceptacji:
- Cache skompilowanego HTML (z React Email) w Redis z sensownym TTL
- P95 render < 300 ms po rozgrzaniu
- Miss cache nie powoduje błędów guardrails

1)  ID: US-027
Tytuł: Uwierzytelnianie i autoryzacja przez API Keys (bezpieczny dostęp)
Opis: Jako developer chcę bezpiecznie wzywać API przez klucze ze scope’ami.
Kryteria akceptacji:
- Klucze są przechowywane w postaci hasha; scope wymuszany na każdym żądaniu
- Błędny lub nieaktywny klucz zwraca 401/403 bez wycieku szczegółów
- RLS uniemożliwia dostęp między workspace’ami

1)  ID: US-028 (MVP-min)
Tytuł: Minimalne logi audytowe
Opis: Jako operator chcę podstawowy audyt dla kluczowych zdarzeń.
Kryteria akceptacji:
- Logowane minimum: tworzenie/rotacja kluczy API, publikacje snapshotów, start/koniec wysyłki, błędy walidacji/transportu (z kodami)
- Każde zdarzenie ma timestamp i traceId
- Retencja min. 30 dni (p95 metryki po MVP)

1)  ID: US-029
Tytuł: Spójne błędy API
Opis: Jako integrator chcę przewidywalnych kodów i struktur błędów.
Kryteria akceptacji:
- 400 dla ValidationError z listą pól i kodami reguł
- 5xx/502/503 dla transient transport errors; 422/409 dla konfliktów
- Każdy błąd posiada kod, message, traceId i kategorie

1)  ID: US-030
Tytuł: Fan‑out dużych kampanii
Opis: Jako operator chcę dzielić kampanie na porcje dla stabilności.
Kryteria akceptacji:
- Kampanie > N odbiorców dzielone na paczki (np. 500)
- Każda paczka ma własny jobId i checkpointy w Redis
- Retry dotyczy wyłącznie paczek, nie całej kampanii

1)  ID: US-031
Tytuł: Planowanie wysyłki
Opis: Jako marketer chcę ustawić prosty termin wysyłki.
Kryteria akceptacji:
- Możliwość ustawienia at/cron; żądanie kolejkowane do QStash
- Wysyłka w przeszłości jest odrzucana z jasnym błędem
- Zaplanowane joby są widoczne w podstawowym dashboardzie

1)  ID: US-032
Tytuł: Idempotencja a częściowy sukces
Opis: Jako operator chcę przewidywalnego zachowania przy częściowych porażkach.
Kryteria akceptacji:
- Powtórka żądania z tym samym Idempotency‑Key nie powiela już wysłanych
- failed_recipients zawiera powody; retry dotyczy tylko nieudanych odbiorców
- Klucz wygasa po TTL; po tym czasie wymagana jest nowa decyzja użytkownika

1)  ID: US-033
Tytuł: Brak opublikowanego snapshotu a /v1/send
Opis: Jako developer chcę jasnego błędu, gdy szablon nie ma opublikowanego snapshotu.
Kryteria akceptacji:
- /v1/send zwraca 409, jeśli stableId nie ma opublikowanego snapshotu
- Komunikat wskazuje wymagane akcje (publish snapshot)
- Zdarzenie jest audytowane

1)  ID: US-034
Tytuł: Automatyczny plaintext
Opis: Jako odbiorca chcę czytelnej wersji tekstowej.
Kryteria akceptacji:
- Generowany plaintext odzwierciedla główne treści i linki
- Długość plaintext kontrolowana i wolna od artefaktów HTML
- Brak plaintext skutkuje wygenerowaniem domyślnego fallbacku

35) ID: US-035
Tytuł: Limit HTML < 150 kB
Opis: Jako operator chcę egzekwować twardy limit rozmiaru.
Kryteria akceptacji:
- Render przekraczający 150 kB jest odrzucany przed wysyłką
- Komunikat zawiera sekcje z największym wkładem w rozmiar
- W edytorze ostrzeżenie pojawia się w czasie rzeczywistym

1)  ID: US-036
Tytuł: Kontrast WCAG AA
Opis: Jako użytkownik chcę dostępnych kolorów i auto‑fixu.
Kryteria akceptacji:
- Detekcja par kolorów niespełniających AA dla tekstu i CTA
- Auto‑fix nie zmienia kontrastu poniżej progu i respektuje brandKit
- Zmiana jest widoczna w porównaniu przed/po

37) ID: US-037
Tytuł: Alt‑texty 100%
Opis: Jako użytkownik chcę, aby każdy obraz miał alt‑text.
Kryteria akceptacji:
- Brak alt‑text powoduje błąd walidacji
- Edytor proponuje auto‑uzupełnienie alt na bazie kontekstu
- Wysyłka blokowana do czasu uzupełnienia

1)  ID: US-038
Tytuł: Wymuszanie HTTPS i rel="noopener"
Opis: Jako operator chcę bezpiecznych linków w e‑mailach.
Kryteria akceptacji:
- Linki HTTP są odrzucane lub auto‑naprawiane do HTTPS, jeśli dostępne
- rel="noopener" dodawane do wszystkich linków
- Lista wyjątków jest konfigurowalna na poziomie workspace (opcjonalnie)

1)  ID: US-039
Tytuł: Walidacja variablesSchema strict/permissive
Opis: Jako developer chcę kontrolować rygor walidacji.
Kryteria akceptacji:
- Tryb strict odrzuca brakujące/nieznane pola; permissive loguje jako warning
- Defaulty ze schematu są stosowane przed renderem
- Zmiana schematu breaking wymaga nowej wersji szablonu

1)  ID: US-040
Tytuł: Automatyczna stopka z BrandKit
Opis: Jako marketer chcę spójnej, zgodnej ze znakiem stopki.
Kryteria akceptacji:
- Stopka może być generowana za pomocą AI z użyciem danych firmy
- Stopka zawiera dane firmy, linki prawne i preferencje
- Kolory i typografia z brandKit; zgodność WCAG AA
- Możliwość lokalizacji EN/PL w stopce

1)  ID: US-041
Tytuł: AI‑refine treści
Opis: Jako marketer chcę skracać, zmieniać ton i tłumaczyć fragmenty.
Kryteria akceptacji:
- Operacje: skrót, ton, tłumaczenie, regeneracja sekcji
- Limit miesięczny według planu; rozliczanie w usage
- Zmiany nie łamią guardrails i schematu

1)  ID: US-042
Tytuł: Pakiet typów @relettr/types
Opis: Jako developer chcę mieć typy TS generowane z OpenAPI.
Kryteria akceptacji:
- Typy dla /v1/send, /validate i eventów webhooków
- Typy błędów ValidationError/TransportError
- Proste funkcję klienckie do wysyłki do określonych odbiorców
- typy i ewentualne helpery literal types


## 6. Metryki sukcesu

Użyteczność i AI fit
- TTFS (time‑to‑first‑send) ≤ 30 min od rejestracji
- ≥ 70% nowych szablonów startuje od AI Generate
- ≤ 2% błędów walidacji w renderach produkcyjnych

Wydajność i jakość
- Render p95 < 300 ms (po rozgrzaniu, cache Redis)
- Send accept p95 < 1 s
- HTML < 150 kB, 100% alt‑textów, brak krytycznych błędów kontrastu

Odporność i skalowanie
- ≥ 98% delivered (poza hard bounce), brak duplikatów (idempotencja)
- 0 stucked jobs dzięki QStash retry + checkpointom w Redis
- Stabilne RPS zgodnie z planem (rate‑limit per workspace/transport)

Adopcja i aktywność
- ≥ 5 zespołów wysyła w produkcji przez /v1/send
- ≥ 10 kampanii end‑to‑end + kilkaset transakcyjnych wysyłek

Biznes i satysfakcja
- ≥ 3 płacące zespoły (Starter/Pro) w pierwszym miesiącu
- NPS ≥ 30 po pierwszym wdrożeniu
- Dodatnia marża przy cenach 5–10 USD/mies. dzięki rozliczaniu renderów, sendów i AI oraz kontroli kosztów przez QStash + Redis

Lista kontrolna PRD
- Każda historia użytkownika jest testowalna z jasnymi kryteriami akceptacji
- Kryteria akceptacji są konkretne i mierzalne
- Zestaw historyjek pokrywa pełną funkcjonalność MVP (core + demo)
- Ujęto wymagania dot. uwierzytelniania, autoryzacji i bezpieczeństwa


