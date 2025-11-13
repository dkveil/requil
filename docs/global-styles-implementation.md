# Implementacja Global Styles (Theme) w Edytorze

Data utworzenia: 2025-11-12

## 📋 Przegląd

Ten dokument opisuje krok po kroku implementację globalnych stylów (theme) dla edytora emaili. System theme obejmuje:
- **Colors** - paleta kolorów brandowych
- **Typography** - domyślne czcionki i rozmiary
- **Spacing** - scale dla paddingów i marginów
- **Border Radius** - zaokrąglenia rogów

---

## Krok 1: Rozszerzenie typów w `packages/types`

### Stwórz nowy plik `packages/types/src/editor/theme.schema.ts`:

```typescript
import { z } from 'zod';

// Color palette
export const ColorPaletteSchema = z.object({
  primary: z.string().default('#3B82F6'),
  secondary: z.string().default('#8B5CF6'),
  accent: z.string().default('#EC4899'),
  text: z.string().default('#1F2937'),
  textSecondary: z.string().default('#6B7280'),
  background: z.string().default('#FFFFFF'),
  backgroundAlt: z.string().default('#F9FAFB'),
  border: z.string().default('#E5E7EB'),
  success: z.string().default('#10B981'),
  warning: z.string().default('#F59E0B'),
  error: z.string().default('#EF4444'),
});

export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

// Typography
export const TypographySchema = z.object({
  fontFamily: z.object({
    primary: z.string().default('Inter, system-ui, sans-serif'),
    heading: z.string().default('Inter, system-ui, sans-serif'),
    mono: z.string().default('monospace'),
  }),
  fontSize: z.object({
    xs: z.string().default('12px'),
    sm: z.string().default('14px'),
    base: z.string().default('16px'),
    lg: z.string().default('18px'),
    xl: z.string().default('20px'),
    '2xl': z.string().default('24px'),
    '3xl': z.string().default('30px'),
    '4xl': z.string().default('36px'),
  }),
  fontWeight: z.object({
    normal: z.number().default(400),
    medium: z.number().default(500),
    semibold: z.number().default(600),
    bold: z.number().default(700),
  }),
  lineHeight: z.object({
    tight: z.number().default(1.25),
    normal: z.number().default(1.5),
    relaxed: z.number().default(1.75),
  }),
});

export type Typography = z.infer<typeof TypographySchema>;

// Spacing scale
export const SpacingScaleSchema = z.object({
  xs: z.string().default('4px'),
  sm: z.string().default('8px'),
  md: z.string().default('16px'),
  lg: z.string().default('24px'),
  xl: z.string().default('32px'),
  '2xl': z.string().default('48px'),
  '3xl': z.string().default('64px'),
});

export type SpacingScale = z.infer<typeof SpacingScaleSchema>;

// Border radius
export const BorderRadiusSchema = z.object({
  none: z.string().default('0px'),
  sm: z.string().default('4px'),
  md: z.string().default('8px'),
  lg: z.string().default('12px'),
  xl: z.string().default('16px'),
  full: z.string().default('9999px'),
});

export type BorderRadius = z.infer<typeof BorderRadiusSchema>;

// Complete theme
export const ThemeSchema = z.object({
  colors: ColorPaletteSchema.default({}),
  typography: TypographySchema.default({}),
  spacing: SpacingScaleSchema.default({}),
  borderRadius: BorderRadiusSchema.default({}),
});

export type Theme = z.infer<typeof ThemeSchema>;
```

### Zaktualizuj `packages/types/src/editor/index.ts`:

```typescript
export * from './block-ir.schema';
export * from './component-registry.schema';
export * from './theme.schema';  // <-- dodaj
```

---

## Krok 2: Rozszerzenie DocumentSchema

W pliku `packages/types/src/editor/block-ir.schema.ts`, dodaj theme do dokumentu:

```typescript
import { ThemeSchema } from './theme.schema';

export const DocumentSchema = z.object({
  version: z.string().default('1.0'),
  root: BlockSchema,
  theme: ThemeSchema.optional(),  // <-- dodaj
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      createdAt: z.iso.datetime().optional(),
      updatedAt: z.iso.datetime().optional(),
    })
    .optional(),
});
```

---

## Krok 3: Rozszerzenie Canvas Store

W `apps/dashboard/features/editor/store/canvas-store.ts`:

### Dodaj do state:

```typescript
interface CanvasState {
  // ... existing state
  theme: Theme | null;
}
```

### Dodaj do actions:

```typescript
interface CanvasActions {
  // ... existing actions
  updateTheme: (updates: Partial<Theme>) => void;
  updateThemeColors: (updates: Partial<ColorPalette>) => void;
  updateThemeTypography: (updates: Partial<Typography>) => void;
  updateThemeSpacing: (updates: Partial<SpacingScale>) => void;
  updateThemeBorderRadius: (updates: Partial<BorderRadius>) => void;
}
```

### W initialState:

```typescript
const initialState: CanvasState = {
  // ... existing
  theme: null,
};
```

### Implementacja akcji w store:

```typescript
// W środku create<CanvasState & CanvasActions>()
setDocument: (doc) => {
  set({
    document: doc,
    theme: doc.theme || null,  // <-- dodaj
    history: {
      past: [],
      present: doc,
      future: [],
    },
    isModified: false,
  });
},

updateTheme: (updates) => {
  const { document, history, theme } = get();
  if (!(document && history)) return;

  const newTheme = { ...theme, ...updates };
  const newDoc = { ...document, theme: newTheme };

  set({
    document: newDoc,
    theme: newTheme,
    history: {
      past: [...history.past, history.present],
      present: newDoc,
      future: [],
    },
    isModified: true,
  });
},

updateThemeColors: (updates) => {
  const { theme } = get();
  get().updateTheme({
    colors: { ...theme?.colors, ...updates },
  });
},

updateThemeTypography: (updates) => {
  const { theme } = get();
  get().updateTheme({
    typography: { ...theme?.typography, ...updates },
  });
},

updateThemeSpacing: (updates) => {
  const { theme } = get();
  get().updateTheme({
    spacing: { ...theme?.spacing, ...updates },
  });
},

updateThemeBorderRadius: (updates) => {
  const { theme } = get();
  get().updateTheme({
    borderRadius: { ...theme?.borderRadius, ...updates },
  });
},
```

---

## Krok 4: Rozszerzenie useCanvas Hook

W `apps/dashboard/features/editor/hooks/use-canvas.ts`, dodaj theme do zwracanych wartości:

```typescript
export const useCanvas = () => {
  const store = useCanvasStore();

  return {
    // ... existing returns
    theme: store.theme,
    updateTheme: store.updateTheme,
    updateThemeColors: store.updateThemeColors,
    updateThemeTypography: store.updateThemeTypography,
    updateThemeSpacing: store.updateThemeSpacing,
    updateThemeBorderRadius: store.updateThemeBorderRadius,
  };
};
```

---

## Krok 5: Stwórz Theme Editor Component

Nowy plik `apps/dashboard/features/editor/components/inspector/theme-editor.tsx`:

```typescript
'use client';

import { useCanvas } from '../../hooks/use-canvas';
import { Section } from './section';
import { useTranslations } from 'next-intl';

export function ThemeEditor() {
  const t = useTranslations('editor.themeEditor');
  const { theme, updateThemeColors, updateThemeTypography, updateThemeSpacing, updateThemeBorderRadius } = useCanvas();

  if (!theme) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Colors Section */}
      <Section title={t('colors')} defaultExpanded>
        <div className="flex flex-col gap-3">
          <ColorInput
            label={t('primaryColor')}
            value={theme.colors.primary}
            onChange={(color) => updateThemeColors({ primary: color })}
          />
          <ColorInput
            label={t('secondaryColor')}
            value={theme.colors.secondary}
            onChange={(color) => updateThemeColors({ secondary: color })}
          />
          <ColorInput
            label={t('accentColor')}
            value={theme.colors.accent}
            onChange={(color) => updateThemeColors({ accent: color })}
          />
          <ColorInput
            label={t('textColor')}
            value={theme.colors.text}
            onChange={(color) => updateThemeColors({ text: color })}
          />
          <ColorInput
            label={t('backgroundColor')}
            value={theme.colors.background}
            onChange={(color) => updateThemeColors({ background: color })}
          />
        </div>
      </Section>

      {/* Typography Section */}
      <Section title={t('typography')}>
        <div className="flex flex-col gap-3">
          <TextInput
            label={t('primaryFont')}
            value={theme.typography.fontFamily.primary}
            onChange={(font) =>
              updateThemeTypography({
                fontFamily: { ...theme.typography.fontFamily, primary: font },
              })
            }
          />
          <TextInput
            label={t('headingFont')}
            value={theme.typography.fontFamily.heading}
            onChange={(font) =>
              updateThemeTypography({
                fontFamily: { ...theme.typography.fontFamily, heading: font },
              })
            }
          />
        </div>
      </Section>

      {/* Spacing Section */}
      <Section title={t('spacing')}>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(theme.spacing).map(([key, value]) => (
            <TextInput
              key={key}
              label={key}
              value={value}
              onChange={(v) => updateThemeSpacing({ [key]: v })}
            />
          ))}
        </div>
      </Section>

      {/* Border Radius Section */}
      <Section title={t('borderRadius')}>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(theme.borderRadius).map(([key, value]) => (
            <TextInput
              key={key}
              label={key}
              value={value}
              onChange={(v) => updateThemeBorderRadius({ [key]: v })}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

// Helper components
function ColorInput({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium flex-1">{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded border cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 px-2 py-1 text-sm border rounded"
      />
    </div>
  );
}

function TextInput({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 text-sm border rounded"
      />
    </div>
  );
}
```

---

## Krok 6: Dodaj Theme Tab do Settings Sidebar

W `apps/dashboard/features/editor/layout/settings-sidebar.tsx`:

### Dodaj import:

```typescript
import { ThemeEditor } from '../components/inspector/theme-editor';
```

### W sekcji tabs:

```typescript
const tabs = [
  { id: 'layout', label: t('tabs.layout') },
  { id: 'animation', label: t('tabs.animation') },
  { id: 'theme', label: t('tabs.theme') },  // <-- dodaj
];
```

### W części renderowania:

```typescript
{activeTab === 'layout' && (
  // ... existing layout content
)}

{activeTab === 'animation' && (
  // ... existing animation content
)}

{activeTab === 'theme' && <ThemeEditor />}  // <-- dodaj
```

---

## Krok 7: Dodaj tłumaczenia

### W `apps/dashboard/features/editor/locale/pl.ts`:

```typescript
export default {
  // ... existing translations
  settingsSidebar: {
    title: 'Ustawienia',
    tabs: {
      layout: 'Układ',
      animation: 'Animacje',
      theme: 'Motywy',  // <-- dodaj
    },
    // ...
  },
  themeEditor: {
    colors: 'Kolory',
    typography: 'Typografia',
    spacing: 'Odstępy',
    borderRadius: 'Zaokrąglenia',
    primaryColor: 'Kolor główny',
    secondaryColor: 'Kolor dodatkowy',
    accentColor: 'Kolor akcentu',
    textColor: 'Kolor tekstu',
    backgroundColor: 'Kolor tła',
    primaryFont: 'Czcionka główna',
    headingFont: 'Czcionka nagłówków',
  },
};
```

### W `apps/dashboard/features/editor/locale/en.ts`:

```typescript
export default {
  // ... existing translations
  settingsSidebar: {
    title: 'Settings',
    tabs: {
      layout: 'Layout',
      animation: 'Animation',
      theme: 'Theme',  // <-- dodaj
    },
    // ...
  },
  themeEditor: {
    colors: 'Colors',
    typography: 'Typography',
    spacing: 'Spacing',
    borderRadius: 'Border Radius',
    primaryColor: 'Primary Color',
    secondaryColor: 'Secondary Color',
    accentColor: 'Accent Color',
    textColor: 'Text Color',
    backgroundColor: 'Background Color',
    primaryFont: 'Primary Font',
    headingFont: 'Heading Font',
  },
};
```

---

## Krok 8: Inicjalizacja theme w block-factory

W `apps/dashboard/features/editor/lib/block-factory.ts`:

### Dodaj import:

```typescript
import { Theme } from '@requil/types';
```

### Dodaj funkcję createDefaultTheme:

```typescript
export function createDefaultTheme(): Theme {
  return {
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      text: '#1F2937',
      textSecondary: '#6B7280',
      background: '#FFFFFF',
      backgroundAlt: '#F9FAFB',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      fontFamily: {
        primary: 'Inter, system-ui, sans-serif',
        heading: 'Inter, system-ui, sans-serif',
        mono: 'monospace',
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
      '3xl': '64px',
    },
    borderRadius: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
  };
}
```

### Zaktualizuj createDefaultDocument:

```typescript
export function createDefaultDocument(): Document {
  const root = createBlock('root', {
    backgroundColor: '#F4F4F5',
  });

  return {
    version: '1.0',
    root,
    theme: createDefaultTheme(),  // <-- dodaj
    metadata: {
      title: 'Untitled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
```

---

## Krok 9 (Opcjonalnie): Użycie theme w komponentach

### Rozszerzenie InspectorField o theme tokens

W `packages/types/src/editor/component-registry.schema.ts`, rozszerz `InspectorFieldSchema`:

```typescript
export const InspectorFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum([
    'text',
    'number',
    'color',
    'select',
    'toggle',
    'slider',
    'spacing',
    'image',
    'textarea',
  ]),
  defaultValue: z.unknown().optional(),
  themeToken: z.boolean().optional(),  // <-- dodaj
  // ... rest of the schema
});
```

### Aktualizacja PropertyControl dla theme colors

W `apps/dashboard/features/editor/components/inspector/property-control.tsx`:

```typescript
{field.type === 'color' && (
  <div className="flex flex-col gap-2">
    {field.themeToken && (
      <select
        value={value?.toString().startsWith('theme.') ? value : 'custom'}
        onChange={(e) => {
          if (e.target.value !== 'custom') {
            onChange(e.target.value);
          }
        }}
        className="px-2 py-1 text-sm border rounded"
      >
        <option value="custom">Custom Color</option>
        <option value="theme.primary">Primary</option>
        <option value="theme.secondary">Secondary</option>
        <option value="theme.accent">Accent</option>
        <option value="theme.text">Text</option>
        <option value="theme.background">Background</option>
      </select>
    )}

    {(!field.themeToken || !value?.toString().startsWith('theme.')) && (
      <div className="flex gap-2">
        <input
          type="color"
          value={value?.toString() || field.defaultValue?.toString() || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border cursor-pointer"
        />
        <input
          type="text"
          value={value?.toString() || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="flex-1 px-2 py-1 text-sm border rounded"
        />
      </div>
    )}
  </div>
)}
```

### Wykorzystanie theme w rendering (BlockRenderer)

W `apps/dashboard/features/editor/components/blocks/block-renderer.tsx`:

```typescript
import { useCanvas } from '../../hooks/use-canvas';

export function BlockRenderer({ block, isCanvas = false }: BlockRendererProps) {
  const { theme } = useCanvas();

  // Resolve theme tokens in props
  const resolvedProps = useMemo(() => {
    if (!theme) return block.props;

    const resolved = { ...block.props };
    Object.keys(resolved).forEach((key) => {
      const value = resolved[key];
      if (typeof value === 'string' && value.startsWith('theme.')) {
        const [, category, token] = value.split('.');
        if (category === 'colors' && theme.colors[token as keyof typeof theme.colors]) {
          resolved[key] = theme.colors[token as keyof typeof theme.colors];
        }
        // Add similar logic for typography, spacing, borderRadius
      }
    });

    return resolved;
  }, [block.props, theme]);

  // Use resolvedProps instead of block.props in rendering
}
```

---

## 🚀 Kolejność implementacji

1. ✅ **Krok 1-2**: Typy (5-10 min)
2. ✅ **Krok 3-4**: Store + hook (10-15 min)
3. ✅ **Krok 5**: Theme Editor UI (20-30 min)
4. ✅ **Krok 6**: Integracja z sidebar (5 min)
5. ✅ **Krok 7**: Tłumaczenia (5 min)
6. ✅ **Krok 8**: Inicjalizacja (5 min)
7. ✅ **Krok 9**: (Opcjonalnie) Theme tokens w komponentach (30+ min)

**Szacowany czas całkowity**: 1-2 godziny (bez kroku 9), 2-3 godziny (z krokiem 9)

---

## 💡 Dodatkowe pomysły na przyszłość

### Theme Presets
Gotowe zestawy kolorów:
```typescript
export const THEME_PRESETS = {
  default: createDefaultTheme(),
  material: { /* Material Design colors */ },
  tailwind: { /* Tailwind CSS colors */ },
  monochrome: { /* Black & white palette */ },
};
```

### Dark Mode Variant
```typescript
export const ThemeSchema = z.object({
  colors: ColorPaletteSchema.default({}),
  darkColors: ColorPaletteSchema.optional(),  // Dark mode colors
  // ...
});
```

### Export/Import Theme
```typescript
export function exportTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}

export function importTheme(json: string): Theme | null {
  try {
    return ThemeSchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}
```

### Theme Preview Panel
Komponent pokazujący podgląd jak theme wygląda na różnych komponentach (button, heading, text, etc.)

### CSS Variables Export
Generowanie CSS variables dla łatwej integracji:
```typescript
export function generateCSSVariables(theme: Theme): string {
  return `
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --font-primary: ${theme.typography.fontFamily.primary};
  /* ... */
}
  `.trim();
}
```

### Theme Inheritance
Komponenty mogą dziedziczyć z theme lub override lokalnie:
```typescript
// Block props może mieć:
{
  color: 'theme.primary',  // Use theme
  // OR
  color: '#FF0000',        // Override with custom
}
```

---

## 🔍 Debugowanie

### Sprawdź czy theme jest w document:
```typescript
console.log('Document:', canvas.document);
console.log('Theme:', canvas.theme);
```

### DevTools do sprawdzenia Zustand store:
Redux DevTools powinny pokazywać stan `theme` w canvas-store.

### Validacja schema:
```typescript
import { ThemeSchema } from '@requil/types';

const result = ThemeSchema.safeParse(yourThemeObject);
if (!result.success) {
  console.error('Invalid theme:', result.error);
}
```

---

## 📚 Powiązane pliki

- `packages/types/src/editor/theme.schema.ts` - Typy theme
- `packages/types/src/editor/block-ir.schema.ts` - Document z theme
- `apps/dashboard/features/editor/store/canvas-store.ts` - Store
- `apps/dashboard/features/editor/hooks/use-canvas.ts` - Hook
- `apps/dashboard/features/editor/components/inspector/theme-editor.tsx` - UI
- `apps/dashboard/features/editor/layout/settings-sidebar.tsx` - Integracja
- `apps/dashboard/features/editor/lib/block-factory.ts` - Inicjalizacja
- `apps/dashboard/features/editor/locale/` - Tłumaczenia

---

## ✅ Checklist

- [ ] Krok 1: Stwórz `theme.schema.ts` z typami
- [ ] Krok 2: Rozszerz `DocumentSchema` o `theme`
- [ ] Krok 3: Dodaj `theme` do canvas store (state + actions)
- [ ] Krok 4: Rozszerz `useCanvas` hook
- [ ] Krok 5: Stwórz `ThemeEditor` component
- [ ] Krok 6: Dodaj tab "Theme" do settings sidebar
- [ ] Krok 7: Dodaj tłumaczenia (pl + en)
- [ ] Krok 8: Zaktualizuj `createDefaultDocument()`
- [ ] Krok 9 (opcja): Implementuj theme tokens
- [ ] Testowanie: Sprawdź czy zmiany theme są zapisywane w history (undo/redo)
- [ ] Testowanie: Sprawdź czy theme przetrwa refresh (po dodaniu persistence)

---

**Autor**: Claude Code
**Wersja**: 1.0
**Status**: Ready to implement
