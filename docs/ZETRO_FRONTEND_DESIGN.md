# Zetro — Sistema de diseño frontend

Rama de referencia: `feat/portal-ui`. Stack fijo: Next.js 16.3 · React 19 · TypeScript strict · Tailwind 4 CSS-first · shadcn/ui (base radix, preset nova) · lucide-react · Geist vía `next/font`. Cero dependencias nuevas. Los tokens viven en `app/globals.css` y en ningún otro lado.

Este documento especifica un solo sistema para dos productos con temperaturas distintas: el sitio público que vende y el panel que se usa parado atrás de una barra. Lo que sigue son valores, no adjetivos. Si algo acá no alcanza para implementar sin preguntar, es un bug del documento.

---

## 0. Estado actual: qué hay y qué se ve genérico

Leído en el repo, no supuesto.

**Lo que vale la pena conservar**

- La arquitectura de tokens: `@theme inline` mapeando `--color-*` a variables de `:root` / `.dark`. Es el mecanismo correcto para Tailwind 4 y shadcn; se cambian los valores, no la estructura.
- Los tonos semánticos de estado en `lib/labels.ts` (`neutral | positive | warning | danger | info`) y el vocabulario por rubro en `lib/vertical.ts`. El sistema visual se cuelga de eso, no lo reemplaza.
- `lib/format.ts`: todo pasa por `Intl` con `es-AR` y timezone del negocio. Es exactamente lo que se pide.
- El copy del sitio. Frases como "Un sitio no alcanza si después seguís anotando en un cuaderno" o "Precio cerrado antes de empezar" tienen voz propia. El diseño tiene que estar a la altura de ese texto, no al revés.
- Los gráficos SVG a mano (`components/charts/line-chart.tsx`, `bar-list.tsx`): la idea es correcta, falta criterio visual.
- La lógica de `calendar.tsx` (lanes, gutter, `pxPerHour`). Se retoca la piel, no el algoritmo.

**Lo que se ve genérico hoy** (cada punto tiene su reemplazo en la sección 2)

| Dónde | Qué | Por qué delata la plantilla |
|---|---|---|
| `globals.css` `--primary: oklch(0.52 0.19 267)` | Violeta-azul de shadcn casi sin tocar | Es el color de mil dashboards de 2024 |
| `page.tsx` hero | `bg-[radial-gradient(60%_60%_at_50%_0%,var(--accent),transparent)]` | El halo difuso arriba del h1 es la firma de landing generada |
| `page.tsx` hero | Pill `rounded-full` con `<Rocket />` y "Sitios en línea en dos semanas" | El chip-con-cohete es un tic de starter kit |
| `page.tsx` features | Seis cards iguales `rounded-xl border` con ícono lucide en cuadrado `bg-primary/10` | El patrón "3×2 con iconito" |
| `page.tsx` precios | Plan destacado con `border-2 border-primary shadow-lg shadow-primary/10` y pill "El más elegido" | Pricing table de template |
| `page.tsx` trabajos | Cover de trabajos con `linear-gradient(135deg, accent, dark)` | Placeholder de gradiente en lugar de una captura real |
| `panel-preview.tsx` | Mockup con tres puntitos rojo/amarillo/verde de ventana de Mac | Cliché de "producto SaaS" |
| Todo el repo | `rounded-xl` en cards, secciones, empty states, calendario, listas | Un solo radio para todo = nada tiene jerarquía |
| `card.tsx`, `stat-card.tsx` | `ring-1 ring-foreground/10` + `shadow-xs` en superficies planas | Sombra decorativa sin capa real |
| `sidebar-nav.tsx` | Ítem activo con fondo violeta claro `bg-sidebar-accent` | Activo por relleno, no por marca |
| `status-badge.tsx` | `rounded-full` con `ring-1` y fondo tintado al 10 % | Chip de plantilla; no se lee de reojo a 1 m |
| `line-chart.tsx` | Área con degradado bajo la línea, `preserveAspectRatio="none"` | El área difusa es adorno; el `none` deforma el trazo |
| Headers | `bg-background/85 backdrop-blur-md` en sitio y panel | Blur de header es el default de todos |

---

## 1. Principios

Seis reglas de decisión. Todas se usan en frases del tipo "cuando dudes entre X e Y".

1. **Cuando dudes entre borde y sombra, elegí borde.** Zetro es un sistema plano con hairlines. La sombra existe solo para cosas que flotan de verdad (popover, sheet, dialog, bloque arrastrado). Si el elemento no se mueve sobre otro, no tiene sombra.

2. **Cuando dudes entre color y tipografía para jerarquizar, elegí tipografía.** Peso, tamaño y espacio antes que tinte. El color de marca está reservado para señalar dónde tocar (link, foco, ítem activo, serie principal). Si un elemento no es interactivo y está en terracota, está mal.

3. **Cuando dudes entre una card y una fila con regla, elegí la fila.** Las cards se justifican solo cuando el contenido es una unidad independiente que puede reordenarse (un trabajo, un plan). Listas, agendas, ajustes y tablas van con líneas horizontales de 1 px, sin caja.

4. **Cuando dudes entre densidad y aire en el panel, elegí densidad.** El encargado quiere ver 12 reservas sin scrollear. La regla operativa: fila de lista 48 px en mobile, 44 px en desktop; padding horizontal 16 px; nunca `py-6` en una fila. El aire va en el sitio público, no en el panel.

5. **Cuando dudes entre un componente nuevo y una variante, elegí variante.** Todo lo que hoy es `rounded-xl border bg-card` ad hoc en las páginas pasa a `<Card>` o a `<Section>` con sus variantes. Cero clases de superficie escritas a mano en `app/`.

6. **Cuando dudes entre animar y no animar, no animes.** Se anima solo lo que cambia de lugar o aparece sobre otra cosa (sheet, popover, dialog, hover de link, foco). Nunca se animan números, gráficos al montar, ni cards al hacer scroll.

---

## 2. Antipatrones prohibidos

Cada ítem lleva su reemplazo. Si una propuesta cae en alguno, se rehace.

| Prohibido | Reemplazo |
|---|---|
| Violeta / índigo / azul eléctrico como primario | Tinta cálida para acción; terracota `--brand` solo para señal interactiva (sección 4) |
| Hero con gradiente radial difuso, mesh, blobs, "glow" | Fondo `--paper`, una sola regla horizontal de 1 px, un pictograma o captura real |
| Grilla de 3 o 6 cards iguales con ícono lucide dentro de un cuadrado redondeado | Lista de dos columnas con numeración tabular o título en peso 500 y texto corrido; íconos solo cuando reemplazan una palabra |
| `rounded-xl` / `rounded-2xl` por defecto | Escala de tres radios con regla (sección 6): 0 en tablas y calendario, 4 px en controles, 8 px en cards y overlays |
| `shadow-sm` / `shadow-md` / `shadow-lg` genéricos | Sombras por capas nombradas `--shadow-overlay` y `--shadow-drag` (sección 7); superficies planas sin sombra |
| Emojis en UI o copy | Texto. Si hace falta un ícono, lucide a 16 px en `currentColor` |
| Glassmorphism (`backdrop-blur` + fondo semitransparente) | Headers con fondo sólido `--paper` y borde inferior de 1 px |
| Tres puntitos de ventana Mac en mockups | Barra superior del mockup con la URL real del panel y nada más |
| Pill con ícono de cohete / rayo / chispa arriba del h1 | Eyebrow en mayúsculas pequeñas `text-xs tracking-wide uppercase text-ink-3`, sin ícono |
| Plan "destacado" con borde grueso y sombra de color | Plan destacado con fondo `--paper-2` y un `dt` "Recomendado" en la primera línea; misma caja |
| Covers con `linear-gradient(135deg, …)` | Captura del sitio real (`next/image`, `aspect-[4/3]`) o, si no hay, bloque `--paper-2` con el nombre en display |
| Ícono en círculo gris centrado en empty states | Empty state alineado a la izquierda, sin ícono, con título + una acción |
| `animate-pulse` en indicadores "en vivo" | Punto sólido `--ok` de 8 px, sin animación |
| Texto "Impulsá tu negocio", "al siguiente nivel", "soluciones integrales", "potenciá", "transformá", "experiencia única" | Frases con sujeto y verbo concreto: "El cliente reserva desde tu sitio y entra directo a tu agenda" |
| Título + subtítulo + botón centrados en cada sección | Secciones alineadas a la izquierda sobre la grilla de 12 columnas; los CTA van al final de la sección, no en el medio |
| Números que "cuentan" desde 0 al cargar | El número aparece completo. Siempre |
| Iconos de 20–24 px como decoración en cards | Íconos solo en botones, navegación y estados; 16 px |
| Degradado bajo la línea del gráfico | Línea sola de 1.5 px; sin área |

---

## 3. Tres direcciones y la elegida

### A. Libreta

**Idea.** El panel como una libreta de reservas bien llevada: papel cálido casi blanco, tinta oscura, reglas horizontales de 1 px, números tabulares, un solo color de tinta secundaria (terracota) para marcar lo que se puede tocar. El sitio público usa el mismo lenguaje pero con más aire y un tamaño de display grande.
**Referencia.** Talonarios y libros de reservas impresos; los horarios de tren suizos (Müller-Brockmann); la UI de Linear y de Stripe Dashboard en su uso de reglas en lugar de cajas, sin el look tech.
**Riesgo.** Puede leerse austero o "sin terminar" si el espaciado no es preciso al píxel. Exige disciplina en radios y en no agregar color. En oscuro, el papel cálido tiene que seguir siendo cálido o parece un IDE.

### B. Pizarra

**Idea.** Dark-first: carbón cálido de fondo, texto crema, acento ámbar. Inspirado en la pizarra de un bar a las nueve de la noche. Cards redondeadas, tipografía grande, mucho contraste. El sitio público va oscuro también.
**Referencia.** Pizarras de menú, luces de bar, la app de Resy en su versión nocturna.
**Riesgo.** El panel se usa también a las tres de la tarde en un gimnasio con ventanales: el modo oscuro obligatorio cansa. "Dark mode con ámbar" es un cliché fuerte de 2023–2025. Y un dueño desconfiado ve la landing oscura y piensa "estudio de diseño caro".

### C. Kiosco

**Idea.** Editorial: display muy grande y muy negro (Geist a 700 con tracking negativo fuerte), blanco puro, rojo como único color, mucha numeración y colgado de secciones tipo diario. El panel toma el mismo peso pero baja el tamaño.
**Referencia.** Tapas de diarios argentinos, afiches de kiosco, Bloomberg Terminal en su densidad.
**Riesgo.** Demasiado ruidoso para una herramienta que se mira de reojo. El rojo como marca choca con el rojo de error. Con una sola fuente sans, el "editorial" queda a medio camino.

### Elegida: A. Libreta

Se elige Libreta porque es la única de las tres que resuelve los dos productos con las mismas reglas: el sitio vende confianza (papel, tinta, precio cerrado, sin fuegos artificiales) y el panel se lee de reojo porque no compite con el contenido. Pizarra obliga a un modo y castiga el uso diurno; Kiosco pone la voz visual por encima de los datos, que en el panel son lo único que importa. Libreta además es la que menos se parece a shadcn recién instalado y a la vez la más barata de implementar sobre lo que ya existe: cambia tokens, radios y bordes, no la estructura de los componentes.

---

## 4. Color

Todo en `oklch`. Neutrales cálidos (hue 60–80, chroma 0.004–0.012): son lo que hace que no parezca gris de sistema. El acento es **terracota** (hue 42), y el primario de acción es la **tinta**, no el acento.

### 4.1 Por qué terracota y no el violeta de shadcn

- El violeta de shadcn (`oklch(0.52 0.19 267)`) es reconocible al instante como "default". Un dueño que comparó tres presupuestos ya lo vio en los otros dos.
- Terracota (`oklch(0.56 0.135 42)`) es un color de ladrillo, de barra de madera, de cerámica: pertenece al mundo de los clientes de Zetro, no al de las startups. Nadie más en el rubro lo usa.
- Está a 40° del ámbar de atención (hue 80) y a 15° del rojo de error (hue 27) pero con la mitad de croma y más claridad: se distinguen a simple vista (ver tabla 4.5).
- Se usa poco. Al reservarlo para señal interactiva, un solo toque de terracota en una pantalla de tinta y papel pesa más que toda una UI violeta.

### 4.2 Escala de neutrales (10 pasos + papel)

| Token | Claro | Uso |
|---|---|---|
| `--paper` | `oklch(0.985 0.004 80)` | Fondo de página |
| `--paper-2` | `oklch(0.965 0.006 80)` | Franjas alternas, fondo de sidebar, celdas de cabecera |
| `--surface` | `oklch(1 0 0)` | Cards, inputs, popovers |
| `--n-100` | `oklch(0.94 0.006 80)` | Hover de fila, fondo de badge neutro |
| `--n-200` | `oklch(0.905 0.007 80)` | Borde estándar (hairline) |
| `--n-300` | `oklch(0.86 0.008 80)` | Borde fuerte (separadores de sección, borde de tabla) |
| `--n-400` | `oklch(0.72 0.010 75)` | Íconos decorativos, texto deshabilitado |
| `--input` | `oklch(0.64 0.012 75)` | Borde de input (3.22:1 sobre papel, cumple 1.4.11) |
| `--ink-4` | `oklch(0.55 0.010 60)` | Texto secundario chico (labels, hints). 4.66:1 |
| `--ink-3` | `oklch(0.46 0.012 60)` | Texto secundario (muted-foreground). 6.84:1 |
| `--ink-2` | `oklch(0.32 0.012 60)` | Texto de cuerpo en el sitio. 12.18:1 |
| `--ink` | `oklch(0.20 0.012 60)` | Títulos, cuerpo del panel, botón primario. 17.36:1 |

### 4.3 Acento y semánticos

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--brand` | `oklch(0.56 0.135 42)` | `oklch(0.74 0.12 45)` | Links, ítem activo, foco, serie 1 |
| `--brand-strong` | `oklch(0.48 0.135 42)` | `oklch(0.80 0.11 45)` | Hover de link, texto sobre `--brand-soft` |
| `--brand-soft` | `oklch(0.95 0.025 50)` | `oklch(0.30 0.04 45)` | Fondo de selección en calendario, fila seleccionada |
| `--ok` | `oklch(0.50 0.11 155)` | `oklch(0.74 0.12 155)` | Confirmada, pagado, activo |
| `--ok-soft` | `oklch(0.95 0.03 155)` | `oklch(0.28 0.04 155)` | Fondo del bloque/badge |
| `--warn` | `oklch(0.52 0.13 80)` | `oklch(0.80 0.13 85)` | Pendiente, pausado |
| `--warn-soft` | `oklch(0.96 0.04 85)` | `oklch(0.30 0.04 85)` | |
| `--err` | `oklch(0.53 0.19 27)` | `oklch(0.72 0.17 27)` | Cancelada, no vino, vencido, error |
| `--err-soft` | `oklch(0.955 0.025 25)` | `oklch(0.29 0.05 27)` | |
| `--info` | `oklch(0.50 0.10 240)` | `oklch(0.74 0.10 240)` | En el lugar, prueba, nuevo |
| `--info-soft` | `oklch(0.95 0.02 240)` | `oklch(0.28 0.04 240)` | |

### 4.4 Escala oscura

El papel oscuro sigue siendo cálido (hue 70). No es `#0a0a0a`.

| Token | Oscuro |
|---|---|
| `--paper` | `oklch(0.17 0.008 70)` |
| `--paper-2` | `oklch(0.21 0.009 70)` |
| `--surface` | `oklch(0.23 0.010 70)` |
| `--n-100` | `oklch(0.27 0.010 70)` |
| `--n-200` | `oklch(0.32 0.010 70)` |
| `--n-300` | `oklch(0.38 0.010 70)` |
| `--n-400` | `oklch(0.50 0.010 70)` |
| `--input` | `oklch(0.50 0.012 70)` (3.18:1 sobre papel) |
| `--ink-4` | `oklch(0.62 0.010 75)` |
| `--ink-3` | `oklch(0.70 0.010 75)` |
| `--ink-2` | `oklch(0.85 0.008 80)` |
| `--ink` | `oklch(0.95 0.006 80)` |

### 4.5 Contraste real (WCAG 2.x, calculado sobre sRGB)

Umbrales: texto normal ≥ 4.5, texto ≥ 18.66 px o bold ≥ 14 px ≥ 3.0, componentes de UI y bordes de input ≥ 3.0.

| Par (claro) | Ratio | Pasa |
|---|---|---|
| `--ink` sobre `--paper` | 17.36 | AAA |
| `--ink-2` sobre `--paper` | 12.18 | AAA |
| `--ink-3` sobre `--paper` | 6.84 | AA (AAA en ≥ 18 px) |
| `--ink-4` sobre `--paper` | 4.66 | AA |
| `--paper` sobre `--ink` (botón primario) | 17.36 | AAA |
| `--brand` sobre `--paper` (link) | 4.72 | AA |
| `--brand` sobre `--surface` | 4.93 | AA |
| `--brand-strong` sobre `--paper` | 6.65 | AA |
| `--ok` sobre `--ok-soft` | 4.96 | AA |
| `--warn` sobre `--warn-soft` | 4.96 | AA |
| `--err` sobre `--err-soft` | 5.04 | AA |
| `--info` sobre `--info-soft` | 5.13 | AA |
| `--input` sobre `--paper` | 3.22 | 1.4.11 |
| `--n-400` sobre `--paper` | 2.38 | Solo decorativo / deshabilitado |

| Par (oscuro) | Ratio | Pasa |
|---|---|---|
| `--ink` sobre `--paper` | 16.53 | AAA |
| `--ink-2` sobre `--paper` | 12.10 | AAA |
| `--ink-3` sobre `--paper` | 7.15 | AAA |
| `--ink-4` sobre `--paper` | 5.25 | AA |
| `--ink-3` sobre `--surface` | 6.32 | AA |
| `--brand` sobre `--paper` | 7.97 | AAA |
| `--brand` sobre `--brand-soft` | 5.75 | AA |
| `--ok` sobre `--ok-soft` | 6.55 | AA |
| `--warn` sobre `--warn-soft` | 7.26 | AA |
| `--err` sobre `--err-soft` | 5.39 | AA |
| `--input` sobre `--paper` | 3.18 | 1.4.11 |
| `--ink` sobre `--brand` (texto sobre botón brand) | 2.07 | **No pasa: por eso el botón primario es tinta, no brand** |

Separación entre semánticos (para que no se confundan de reojo): `--brand` vs `--ok` 1.15, `--brand` vs `--info` 1.20, `--ok` vs `--info` 1.04 de luminancia relativa, es decir, misma claridad: la distinción es puramente de matiz (42° / 155° / 240°), que es lo correcto para que ninguno "pese" más que otro en un gráfico. Por eso los estados nunca se comunican solo con color: el badge lleva texto y el bloque del calendario lleva borde izquierdo de 3 px más el texto.

### 4.6 Bloque listo para pegar en `app/globals.css`

Reemplaza `:root` y `.dark` completos. El `@theme inline` existente se amplía con los alias nuevos y conserva los nombres shadcn para que `components/ui/*` siga funcionando sin tocarlos.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-sans);
  --font-heading: var(--font-sans);
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;

  /* alias shadcn (no cambian de nombre) */
  --color-background: var(--paper);
  --color-foreground: var(--ink);
  --color-card: var(--surface);
  --color-card-foreground: var(--ink);
  --color-popover: var(--surface);
  --color-popover-foreground: var(--ink);
  --color-primary: var(--ink);
  --color-primary-foreground: var(--paper);
  --color-secondary: var(--n-100);
  --color-secondary-foreground: var(--ink);
  --color-muted: var(--paper-2);
  --color-muted-foreground: var(--ink-3);
  --color-accent: var(--brand-soft);
  --color-accent-foreground: var(--brand-strong);
  --color-destructive: var(--err);
  --color-success: var(--ok);
  --color-warning: var(--warn);
  --color-border: var(--n-200);
  --color-input: var(--input);
  --color-ring: var(--brand);
  --color-sidebar: var(--paper-2);
  --color-sidebar-foreground: var(--ink);
  --color-sidebar-primary: var(--ink);
  --color-sidebar-primary-foreground: var(--paper);
  --color-sidebar-accent: var(--n-100);
  --color-sidebar-accent-foreground: var(--ink);
  --color-sidebar-border: var(--n-200);
  --color-sidebar-ring: var(--brand);
  --color-chart-1: var(--brand);
  --color-chart-2: var(--info);
  --color-chart-3: var(--ok);
  --color-chart-4: var(--warn);
  --color-chart-5: var(--ink-3);

  /* tokens propios de Zetro */
  --color-paper: var(--paper);
  --color-paper-2: var(--paper-2);
  --color-surface: var(--surface);
  --color-n-100: var(--n-100);
  --color-n-200: var(--n-200);
  --color-n-300: var(--n-300);
  --color-n-400: var(--n-400);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-ink-4: var(--ink-4);
  --color-brand: var(--brand);
  --color-brand-strong: var(--brand-strong);
  --color-brand-soft: var(--brand-soft);
  --color-ok: var(--ok);
  --color-ok-soft: var(--ok-soft);
  --color-warn: var(--warn);
  --color-warn-soft: var(--warn-soft);
  --color-err: var(--err);
  --color-err-soft: var(--err-soft);
  --color-info: var(--info);
  --color-info-soft: var(--info-soft);

  /* radios: tres valores, no una escala derivada */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 8px;
  --radius-xl: 8px;
  --radius-2xl: 8px;
  --radius-3xl: 8px;
  --radius-4xl: 9999px; /* solo badge y avatar */

  /* sombras por capas */
  --shadow-overlay: var(--shadow-overlay);
  --shadow-drag: var(--shadow-drag);

  /* movimiento */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
}

:root {
  --paper: oklch(0.985 0.004 80);
  --paper-2: oklch(0.965 0.006 80);
  --surface: oklch(1 0 0);
  --n-100: oklch(0.94 0.006 80);
  --n-200: oklch(0.905 0.007 80);
  --n-300: oklch(0.86 0.008 80);
  --n-400: oklch(0.72 0.010 75);
  --input: oklch(0.64 0.012 75);
  --ink-4: oklch(0.55 0.010 60);
  --ink-3: oklch(0.46 0.012 60);
  --ink-2: oklch(0.32 0.012 60);
  --ink: oklch(0.20 0.012 60);

  --brand: oklch(0.56 0.135 42);
  --brand-strong: oklch(0.48 0.135 42);
  --brand-soft: oklch(0.95 0.025 50);
  --ok: oklch(0.50 0.11 155);
  --ok-soft: oklch(0.95 0.03 155);
  --warn: oklch(0.52 0.13 80);
  --warn-soft: oklch(0.96 0.04 85);
  --err: oklch(0.53 0.19 27);
  --err-soft: oklch(0.955 0.025 25);
  --info: oklch(0.50 0.10 240);
  --info-soft: oklch(0.95 0.02 240);

  --shadow-overlay:
    0 0 0 1px oklch(0.20 0.012 60 / 0.06),
    0 2px 4px -1px oklch(0.20 0.012 60 / 0.06),
    0 12px 24px -8px oklch(0.20 0.012 60 / 0.12);
  --shadow-drag:
    0 0 0 1px oklch(0.20 0.012 60 / 0.10),
    0 8px 16px -6px oklch(0.20 0.012 60 / 0.18);

  --radius: 8px; /* lo lee shadcn; no usar directo */
}

.dark {
  --paper: oklch(0.17 0.008 70);
  --paper-2: oklch(0.21 0.009 70);
  --surface: oklch(0.23 0.010 70);
  --n-100: oklch(0.27 0.010 70);
  --n-200: oklch(0.32 0.010 70);
  --n-300: oklch(0.38 0.010 70);
  --n-400: oklch(0.50 0.010 70);
  --input: oklch(0.50 0.012 70);
  --ink-4: oklch(0.62 0.010 75);
  --ink-3: oklch(0.70 0.010 75);
  --ink-2: oklch(0.85 0.008 80);
  --ink: oklch(0.95 0.006 80);

  --brand: oklch(0.74 0.12 45);
  --brand-strong: oklch(0.80 0.11 45);
  --brand-soft: oklch(0.30 0.04 45);
  --ok: oklch(0.74 0.12 155);
  --ok-soft: oklch(0.28 0.04 155);
  --warn: oklch(0.80 0.13 85);
  --warn-soft: oklch(0.30 0.04 85);
  --err: oklch(0.72 0.17 27);
  --err-soft: oklch(0.29 0.05 27);
  --info: oklch(0.74 0.10 240);
  --info-soft: oklch(0.28 0.04 240);

  /* en oscuro la sombra no se ve: se reemplaza por borde más claro */
  --shadow-overlay:
    0 0 0 1px oklch(1 0 0 / 0.10),
    0 12px 24px -8px oklch(0 0 0 / 0.5);
  --shadow-drag:
    0 0 0 1px oklch(1 0 0 / 0.14),
    0 8px 16px -6px oklch(0 0 0 / 0.6);
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    @apply font-sans antialiased;
    font-feature-settings: "cv11", "ss01"; /* Geist: a de un piso, cero con barra */
  }
  body {
    @apply bg-paper text-ink;
  }
  :focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
  ::selection {
    background: var(--brand-soft);
    color: var(--ink);
  }
}

@utility tnum {
  font-variant-numeric: tabular-nums lining-nums;
}

@utility hairline {
  box-shadow: inset 0 0 0 1px var(--n-200);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Notas de implementación:

- `--color-primary` pasa a ser tinta. Todos los `<Button>` default quedan negros sobre papel sin tocar `button.tsx`.
- `--color-accent` (lo que shadcn usa para hover de menú) pasa a `--brand-soft`. Los dropdowns tienen hover terracota muy claro. Es intencional: hover = "esto se puede tocar".
- El `@utility grid-lines` existente se borra; no se usa en la dirección elegida.
- Los `--radius-*` de shadcn se pisan con valores absolutos. Cualquier `rounded-lg` / `rounded-xl` / `rounded-2xl` que quede en el código pasa a rendir 8 px sin refactor. Después se limpian según la regla de la sección 6.

---

## 5. Tipografía

Una sola familia: **Geist** (ya cargada en `app/layout.tsx` con `variable: '--font-sans'`). Sin serif, sin display, sin mono externa: `--font-mono` es la pila del sistema y se usa solo para rutas (`/reservas`) y códigos.

### 5.1 Pesos

Se usan **tres**: 400 (cuerpo), 500 (énfasis, botones, labels, nombres), 600 (títulos, números grandes). No se usan 300, 700, 800 ni 900. `font-bold` está prohibido en el código: si aparece, es 600.

Actualizar `app/layout.tsx`:

```tsx
const geist = Geist({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600'] })
```

### 5.2 Escala

Base 16 px. Tracking negativo solo desde 24 px hacia arriba; nunca en cuerpo ni en tamaños chicos.

| Nombre | Tamaño | Line-height | Tracking | Peso | Clases Tailwind |
|---|---|---|---|---|---|
| display | 3.5rem (56) | 1.02 | −0.03em | 600 | `text-[3.5rem] leading-[1.02] tracking-[-0.03em] font-semibold` |
| h1-site | 2.75rem (44) | 1.08 | −0.025em | 600 | `text-[2.75rem] leading-[1.08] tracking-[-0.025em] font-semibold` |
| h2-site | 2rem (32) | 1.15 | −0.02em | 600 | `text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold` |
| h1-panel | 1.5rem (24) | 1.2 | −0.015em | 600 | `text-2xl leading-tight tracking-[-0.015em] font-semibold` |
| h2-panel | 1.0625rem (17) | 1.3 | 0 | 500 | `text-[1.0625rem] leading-[1.3] font-medium` |
| stat | 1.75rem (28) | 1 | −0.02em | 600 | `text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum` |
| body-site | 1.0625rem (17) | 1.55 | 0 | 400 | `text-[1.0625rem] leading-[1.55]` |
| body | 0.9375rem (15) | 1.5 | 0 | 400 | `text-[0.9375rem] leading-normal` |
| small | 0.8125rem (13) | 1.4 | 0 | 400/500 | `text-[0.8125rem] leading-[1.4]` |
| eyebrow | 0.75rem (12) | 1 | +0.06em | 500 | `text-xs leading-none tracking-[0.06em] uppercase font-medium` |
| micro | 0.6875rem (11) | 1 | +0.02em | 500 | `text-[0.6875rem] leading-none tracking-[0.02em] font-medium tnum` |

Mobile: `display` baja a 2.5rem (40) con `sm:` para subir; `h1-site` a 2.125rem (34). Todo lo demás no cambia entre breakpoints.

### 5.3 Sitio vs. panel

- **Sitio**: cuerpo `body-site` a 17 px en `--ink-2` (no `--ink`: el negro pleno a 17 px sobre papel cansa en párrafos largos). Títulos en `--ink`. Ancho de medida máximo 60 caracteres (`max-w-[60ch]`).
- **Panel**: cuerpo `body` a 15 px en `--ink`. Secundario en `--ink-3`. Nada por debajo de `small` salvo `micro` en el gutter del calendario y en ejes de gráficos. La regla de legibilidad de reojo: nombre del cliente y hora siempre en `body` 500, nunca en `small`.

### 5.4 Números tabulares

Cualquier número que se compare verticalmente con otro va con la utilidad `tnum`: horas, precios, conteos, porcentajes, columnas de tabla, ejes, gutter del calendario, deltas. La regla operativa: **si el número está en una columna, en una lista, o al lado de otro número, lleva `tnum`.** Solo el cuerpo corrido del sitio ("desde $290.000") va proporcional. `font-feature-settings: "cv11", "ss01"` en `html` da la `a` de un piso y el cero con barra en Geist: el cero nunca se confunde con la O en "20:00".

---

## 6. Espaciado, grilla y radios

### 6.1 Escala

Base 4 px (la de Tailwind). Se usan estos pasos y ninguno más: `1 (4)`, `1.5 (6)`, `2 (8)`, `3 (12)`, `4 (16)`, `5 (20)`, `6 (24)`, `8 (32)`, `10 (40)`, `12 (48)`, `16 (64)`, `20 (80)`, `24 (96)`. Si aparece `p-7`, `gap-9` o `mt-14`, está mal.

### 6.2 Contenedores y gutters

| Contexto | Ancho máximo | Gutter mobile | Gutter ≥ sm | Clases |
|---|---|---|---|---|
| Sitio, ancho completo | 1200 px | 20 px | 32 px | `mx-auto w-full max-w-[75rem] px-5 sm:px-8` |
| Sitio, texto (FAQ, caso) | 720 px | 20 px | 32 px | `mx-auto w-full max-w-[45rem] px-5 sm:px-8` |
| Panel, `<main>` | 1280 px | 16 px | 24 px | `mx-auto w-full max-w-7xl px-4 sm:px-6` |
| Sidebar | 240 px fijo | 12 px | 12 px | `w-60 px-3` |

Ritmo vertical del sitio: secciones con `py-16 lg:py-24`, separadas por regla de 1 px `--n-200` (no por cambio de fondo, salvo la franja de precios que va en `--paper-2`). Ritmo del panel: `space-y-6` entre bloques, `space-y-4` dentro de un bloque.

Grilla del sitio: 12 columnas, `gap-x-6` (24 px) a partir de `lg`, `gap-x-4` antes. Hero: título en columnas 1–7, mockup en 8–12. Lista de ventajas: 2 columnas en `md`, cada ítem `grid-cols-[2rem_1fr]` con número tabular a la izquierda.

### 6.3 Radios: la regla

Tres valores. La decisión se toma por lo que el elemento *es*, no por el tamaño.

| Radio | Token | Se usa en | Nunca en |
|---|---|---|---|
| **0 px** | `rounded-none` | Tablas, calendario y sus celdas, filas de lista, franjas de sección, sidebar, headers, separadores, mockup del panel, capturas | — |
| **4 px** | `rounded-sm` | Botones, inputs, select, checkbox, tabs, ítems de menú, bloques de reserva del calendario, chips de filtro, celdas con fondo tintado | Cards |
| **8 px** | `rounded-md` | Cards (trabajo, plan, stat), dialog, popover, sheet, dropdown, empty state, contenedor de gráfico | Botones, inputs, filas |
| **9999** | `rounded-full` | Badge de estado, avatar, punto de "en vivo" | Botones, cards, inputs, pills de marketing |

Un contenedor con radio 8 y una fila adentro con radio 0: correcto. Un botón con radio 8: incorrecto.

---

## 7. Elevación y bordes

### 7.1 Cuándo borde, cuándo sombra

| Elemento | Resolución |
|---|---|
| Card, stat, contenedor de gráfico, empty state | Borde 1 px `--n-200`, fondo `--surface`. Sin sombra |
| Fila de lista, celda de tabla | Regla inferior 1 px `--n-200`. Sin fondo propio |
| Sección del sitio | Regla superior 1 px `--n-200` |
| Sidebar, header del panel, header del sitio | Fondo sólido (`--paper-2` / `--paper`) + borde 1 px del lado que toca el contenido |
| Input, select, textarea | Borde 1 px `--input` (3.2:1). Foco: outline 2 px `--brand` offset 2 px |
| Dropdown, popover, tooltip | `--shadow-overlay` (incluye el ring de 1 px). Sin borde adicional |
| Dialog, sheet | `--shadow-overlay` + scrim `oklch(0.20 0.012 60 / 0.4)` |
| Bloque de reserva mientras se arrastra (futuro) | `--shadow-drag` |
| Mockup `PanelPreview` en el hero | Borde 1 px `--n-300`, sin sombra. Es una captura, no una ventana flotante |

Clases: `shadow-overlay` y `shadow-drag` quedan disponibles por el `@theme` (`--shadow-*`). `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` no se usan; ESLint no lo va a detectar, se revisa con `grep -rn "shadow-\(xs\|sm\|md\|lg\|xl\)" components app`.

### 7.2 En oscuro

La sombra sobre `--paper` oscuro es invisible. Por eso `.dark` redefine `--shadow-overlay` con un ring blanco al 10 % como primera capa: el borde claro hace el trabajo de separar. Las cards en oscuro usan `--surface` (L 0.23) sobre `--paper` (L 0.17): 1 paso de luz basta; no se agrega borde más claro que `--n-200`.

---

## 8. Movimiento

| Token | Valor | Uso |
|---|---|---|
| `duration-fast` | 120 ms | Hover de link/botón, cambio de color de fondo de fila, foco |
| `duration-base` | 180 ms | Apertura de dropdown, popover, tooltip; cambio de tab |
| `duration-slow` | 240 ms | Sheet y dialog (entrada). Salida siempre a 160 ms |
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` | Todo lo que entra |
| `--ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | Sheet lateral (entra y sale) |

Qué se anima:

- `background-color`, `color`, `border-color`, `outline-color` en hover/foco: `transition-colors duration-[120ms]`.
- Opacidad + translación de 4 px en overlays (`tw-animate-css` ya lo hace en `dialog.tsx`, `dropdown-menu.tsx`, `sheet.tsx`; se ajustan las duraciones con `duration-[180ms]`).
- Flecha de "Ver todos" en hover: `translate-x-0.5`, 120 ms. Es el único micro-movimiento decorativo permitido en el sitio.

Qué nunca se anima:

- Números, contadores, stats al montar.
- Gráficos (el path aparece dibujado, no se "traza").
- Cards al entrar en viewport (nada de `IntersectionObserver` + fade).
- `animate-pulse` en el indicador de visitantes. Se reemplaza por un punto sólido `--ok` de 8 px.
- Altura (`height`) de nada. Los acordeones del FAQ no existen: las preguntas van abiertas.
- Layout: ningún `transition-all`. Si `button.tsx` de shadcn trae `transition-all`, se cambia por `transition-colors`.

`prefers-reduced-motion` está cubierto globalmente por el bloque en `globals.css` (sección 4.6). No hace falta manejarlo por componente.

---

## 9. Componentes

Para cada uno: qué cambia, con qué clases, por qué. Se conserva la API (props) de todos.

### 9.1 Botón (`components/ui/button.tsx`)

Cambios en `buttonVariants`:

```ts
// base: rounded-lg -> rounded-sm; transition-all -> transition-colors; ring de foco -> outline
"group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-[120ms] outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

variant: {
  default:     "bg-ink text-paper hover:bg-ink-2 active:bg-ink",
  outline:     "border-n-300 bg-surface text-ink hover:bg-n-100",
  secondary:   "bg-n-100 text-ink hover:bg-n-200",
  ghost:       "text-ink-2 hover:bg-n-100 hover:text-ink",
  destructive: "bg-err text-paper hover:bg-err/90",
  link:        "text-brand underline underline-offset-[3px] decoration-brand/40 hover:decoration-brand hover:text-brand-strong",
}
size: {
  default: "h-10 gap-2 px-4",                 // 40px: panel desktop
  sm:      "h-8 gap-1.5 px-3 text-[0.8125rem]",
  lg:      "h-12 gap-2 px-5 text-base",       // 48px: sitio y mobile del panel
  icon:    "size-10",
  "icon-sm": "size-8",
  "icon-lg": "size-12",
}
```

Por qué: el primario negro sobre papel es lo que más distancia pone con shadcn de fábrica; el `rounded-sm` de 4 px lee como control y no como card; las alturas de 40/48 cumplen el target táctil de 44 px del panel (`lg` en mobile, `default` en desktop). Se eliminan `xs` e `icon-xs` (24 px): no hay lugar donde un target de 24 px sea aceptable.

Regla de uso: una sola acción primaria por vista (`default`). El resto `outline` o `ghost`. `destructive` solo en confirmación de cancelar/eliminar dentro del dialog, nunca en la lista.

### 9.2 Input (`components/ui/input.tsx`, y por extensión `select`, `textarea`)

```ts
"h-10 w-full min-w-0 rounded-sm border border-input bg-surface px-3 text-[0.9375rem] text-ink placeholder:text-ink-4 transition-colors duration-[120ms] outline-none focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-4 aria-invalid:border-err aria-invalid:focus-visible:outline-err md:h-9"
```

Por qué: `bg-transparent` de shadcn hace que el input se pierda sobre `--paper-2` (sidebar, franjas); `bg-surface` blanco sobre papel lo separa sin borde grueso. `h-10` en mobile / `h-9` en desktop. El placeholder pasa a `--ink-4` (4.66:1): el de shadcn con `--muted-foreground` estaba bien, pero el nuevo `--ink-3` es demasiado oscuro para diferenciarse del valor tipeado. Label siempre arriba, `small` 500 `--ink-2`, `mb-1.5`.

### 9.3 Card (`components/ui/card.tsx`)

```ts
// Card
"group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-md border border-n-200 bg-surface py-(--card-spacing) text-[0.9375rem] text-ink [--card-spacing:--spacing(4)] data-[size=sm]:[--card-spacing:--spacing(3)] ..."
// CardTitle
"text-[1.0625rem] leading-[1.3] font-medium"
// CardFooter
"flex items-center border-t border-n-200 bg-paper-2 p-(--card-spacing)"
```

Se quita `ring-1 ring-foreground/10` (era borde disfrazado) y se pone borde real. Se quita `rounded-t-xl` / `rounded-b-xl` de header/footer: los hijos no redondean, el `overflow-hidden` del padre lo hace.

Regla: en `app/` no se escribe `rounded-* border bg-card` a mano. Todo bloque con borde es `<Card>` o `<Card size="sm">`. Las secciones de `app/panel/[orgSlug]/page.tsx` ("Agenda de hoy", "Visitas al sitio", "Página más vista") pasan a `<Card>` con `<CardHeader className="border-b">`.

### 9.4 Tabla (`components/ui/table.tsx`)

```ts
// TableHead
"h-9 px-4 text-left align-middle text-[0.8125rem] font-medium text-ink-3 whitespace-nowrap first:pl-4 last:pr-4"
// TableRow
"border-b border-n-200 transition-colors duration-[120ms] hover:bg-n-100 data-[state=selected]:bg-brand-soft"
// TableCell
"h-11 px-4 align-middle whitespace-nowrap tnum first:pl-4 last:pr-4"
// TableHeader
"[&_tr]:border-b [&_tr]:border-n-300 bg-paper-2"
```

Cabecera en `--paper-2` con borde inferior `--n-300` (más fuerte que las filas). Filas de 44 px. Columnas numéricas con `text-right tnum`. La tabla nunca va dentro de una card con padding: se apoya directo en el borde de la card (`<Card className="py-0">`). Radio 0 en todo lo interno.

### 9.5 Badge de estado (`components/status-badge.tsx`)

Hoy es un chip redondo con fondo al 10 % y ring. Pasa a **punto + texto**, sin fondo, que se lee a distancia y no compite con el resto de la fila:

```tsx
const tones: Record<StatusTone, string> = {
  neutral:  'text-ink-3 before:bg-n-400',
  positive: 'text-ok before:bg-ok',
  warning:  'text-warn before:bg-warn',
  danger:   'text-err before:bg-err',
  info:     'text-info before:bg-info',
}
// contenedor
'inline-flex items-center gap-1.5 text-[0.8125rem] font-medium whitespace-nowrap before:size-2 before:shrink-0 before:rounded-full before:content-[""]'
```

Variante `solid` (prop nueva `variant?: 'dot' | 'solid'`, default `dot`) para cuando el badge está solo sobre papel y necesita caja, por ejemplo en el header del `BookingDialog`:

```ts
solid: 'rounded-full px-2.5 h-6 bg-{tone}-soft text-{tone} before:hidden'
// con los pares: bg-ok-soft text-ok | bg-warn-soft text-warn | bg-err-soft text-err | bg-info-soft text-info | bg-n-100 text-ink-2
```

Por qué: los cinco tonos tienen la misma luminancia (sección 4.5), así que el punto de 8 px más el texto en color distingue el estado sin que ninguno pese más. El texto siempre acompaña: nunca solo el punto.

### 9.6 Page header (`components/page-header.tsx`)

```tsx
<div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-n-200 pb-4', className)}>
  <div className="min-w-0 space-y-0.5">
    {eyebrow ? <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">{eyebrow}</p> : null}
    <h1 className="text-2xl leading-tight tracking-[-0.015em] font-semibold text-balance">{title}</h1>
    {description ? <p className="text-[0.9375rem] text-ink-3 text-pretty">{description}</p> : null}
  </div>
  {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
</div>
```

Se agrega `eyebrow?: string` (en Inicio: la fecha de hoy va en eyebrow, y el título es el nombre del negocio; hoy la fecha está en `description`, que es el lugar equivocado para un dato que se mira primero). `items-end` alinea el botón con la línea base del título. El borde inferior ancla el header a la grilla; después de él, `space-y-6`.

### 9.7 Empty state (`components/empty-state.tsx`)

Sale el ícono en círculo, sale el centrado, sale el borde punteado.

```tsx
<div className={cn('flex flex-col items-start gap-3 rounded-md border border-n-200 bg-paper-2 px-5 py-8 sm:px-6', className)}>
  <div className="space-y-1">
    <p className="text-[1.0625rem] font-medium">{title}</p>
    {description ? <p className="max-w-[48ch] text-[0.9375rem] text-ink-3 text-pretty">{description}</p> : null}
  </div>
  {action}
</div>
```

El prop `icon` se mantiene en la firma por compatibilidad pero deja de renderizar; se elimina en la etapa 4 del plan. Fondo `--paper-2` (no `bg-card/40` con borde punteado): un vacío es una hoja sin escribir, no un recorte. Alineado a la izquierda como el resto del panel: el ojo no tiene que cambiar de columna para leerlo.

### 9.8 Error state (`components/error-state.tsx`)

Misma anatomía que el empty state con una barra izquierda:

```tsx
'flex flex-col items-start gap-3 rounded-md border border-n-200 border-l-[3px] border-l-err bg-surface px-5 py-6'
// título
'text-[1.0625rem] font-medium'
// descripción
'max-w-[48ch] text-[0.9375rem] text-ink-3'
// acción por defecto si no viene: <Button variant="outline" size="sm">Reintentar</Button>
```

Sin ícono de triángulo, sin fondo rojo al 5 %. La barra de 3 px es la única señal de color: es el mismo lenguaje que el bloque cancelado en el calendario.

### 9.9 Stat card (`components/stat-card.tsx`)

```tsx
<div className={cn('flex flex-col gap-2 rounded-md border border-n-200 bg-surface p-4', className)}>
  <span className="text-[0.8125rem] font-medium text-ink-3">{label}</span>
  <div className="flex items-baseline gap-2">
    <span className="text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum">{value}</span>
    {delta != null ? (
      <span className={cn('text-[0.8125rem] font-medium tnum', up ? 'text-ok' : 'text-err')}>
        {formatDelta(delta)}
      </span>
    ) : null}
  </div>
  {hint ? <span className="text-[0.8125rem] text-ink-4 tnum">{hint}</span> : null}
</div>
```

Sale el ícono (prop `icon` se acepta y se ignora hasta la etapa 4), salen las flechas: el signo `+`/`−` de `formatDelta` más el color alcanza. Sale `shadow-xs`. En mobile las cuatro stats van en `grid-cols-2`; en `lg`, `grid-cols-4`. Variante `<StatCard inline>` para el `PanelPreview`: sin borde, `p-0`.

### 9.10 Sidebar del panel (`components/panel/sidebar-nav.tsx` y `app/panel/[orgSlug]/layout.tsx`)

Layout:

```tsx
<aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-n-200 bg-paper-2 lg:flex">
  <div className="h-14 border-b border-n-200 px-3 flex items-center"><OrgSwitcher … /></div>
  <div className="flex-1 overflow-y-auto px-3 py-4"><SidebarNav … /></div>
  <div className="border-t border-n-200 px-4 py-3 text-[0.8125rem] text-ink-4">Zetro</div>
</aside>
```

Ítem:

```tsx
className={cn(
  'relative flex h-10 items-center gap-2.5 rounded-sm px-3 text-[0.9375rem] font-medium transition-colors duration-[120ms]',
  active
    ? 'bg-surface text-ink before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-r-sm before:bg-brand before:content-[""]'
    : 'text-ink-2 hover:bg-n-100 hover:text-ink',
)}
// ícono
<item.icon className="size-4 shrink-0 text-ink-3 group-aria-[current=page]:text-ink" />
```

Etiqueta de grupo: `eyebrow` (`text-xs tracking-[0.06em] uppercase font-medium text-ink-4 px-3 pb-1.5 pt-2`).

Por qué: el activo se marca con una barra terracota de 3 px pegada al borde izquierdo del sidebar y fondo blanco (la "hoja" que está arriba de la pila), en lugar de un rectángulo tintado. Es la misma barra de 3 px que usan el error state y los bloques del calendario: un solo gesto en todo el sistema.

Header del panel: `h-14 border-b border-n-200 bg-paper` (sólido, sin blur). El `MobileNav` (sheet izquierdo) hereda el mismo `SidebarNav`; el sheet mide `w-72`, fondo `--paper-2`, `--shadow-overlay`.

### 9.11 Bloque de reserva del calendario (`components/panel/calendar.tsx`)

`blockTones` pasa a:

```ts
const blockTones: Record<string, string> = {
  positive: 'bg-ok-soft border-l-ok text-ink',
  warning:  'bg-warn-soft border-l-warn text-ink',
  danger:   'bg-n-100 border-l-err text-ink-3 line-through decoration-ink-4',
  info:     'bg-info-soft border-l-info text-ink',
  neutral:  'bg-n-100 border-l-n-400 text-ink',
}
// Block
'absolute overflow-hidden rounded-sm border-l-[3px] px-2 py-1 text-[0.8125rem] leading-[1.3] transition-colors duration-[120ms] hover:z-10 hover:bg-surface focus-visible:z-10'
```

- Nombre del cliente: `block truncate font-medium`. Hora: `block truncate tnum text-ink-3`.
- Altura mínima 28 px (`Math.max(…, 28)`); por debajo de 44 px se muestra solo el nombre.
- `pxPerHour` sube de 68 a 72 (múltiplo de la escala; 15 min = 18 px).
- Contenedor `DayCalendar`/`WeekCalendar`: `rounded-md border border-n-200 bg-surface` afuera; adentro todo radio 0.
- Cabecera de columnas: `bg-paper-2` sólido (sale `bg-card/95 backdrop-blur-sm`), `border-b border-n-300`, día actual con `text-brand` en el número y una línea de 2 px `--brand` bajo la celda (no fondo tintado en toda la columna).
- `GridLines`: cada hora `border-n-200`; media hora `border-n-100`. Línea de "ahora" en vista día: 1 px `--brand` con un punto de 6 px en el gutter (se calcula con `localMinutes(new Date(), tz)`; se re-renderiza por `router.refresh()` cada 60 s, misma técnica que `LiveVisitors`).
- Gutter de horas: `micro` `tnum text-ink-4`, ancho `w-12`.
- Sale el hover con `shadow-md`; el hover aclara el fondo a `--surface`.

### 9.12 Gráficos SVG (`components/charts/line-chart.tsx`, `bar-list.tsx`)

`LineChart`:

- Sale `preserveAspectRatio="none"`: deforma el trazo y los textos. Se pasa a `viewBox` con ancho fijo 720 y `preserveAspectRatio="xMidYMid meet"`, y el `<svg>` va en un contenedor `overflow-hidden` con `aspect-[720/220]`.
- Sale el `<linearGradient>` y el `<path>` de área.
- Línea: `stroke="var(--brand)" strokeWidth="1.5" vectorEffect="non-scaling-stroke"`.
- Grilla: 3 líneas horizontales `stroke="var(--n-200)"`, sin verticales. Etiquetas de eje Y (mín, medio, máx) a la izquierda en `micro tnum fill-ink-4`, con `pad.left` 32.
- Etiquetas de eje X: primero, medio, último en `micro fill-ink-4`.
- Último punto: círculo `r="3"` `fill="var(--brand)"` con `stroke="var(--surface)" strokeWidth="2"`. Es el único punto marcado.
- Nada de tooltip en v1 (no hay interactividad sin JS cliente y no vale la pena el `'use client'`).

`BarList`:

```tsx
<li className="relative isolate grid h-9 grid-cols-[1fr_auto] items-center gap-4 px-2 text-[0.9375rem]">
  <span className="absolute inset-y-1.5 left-0 -z-10 rounded-sm bg-brand-soft" style={{ width: `${pct}%` }} />
  <span className="truncate">{row.label}</span>
  <span className="tnum text-ink-3">{row.hint ?? formatNumber(row.value)}</span>
</li>
```

Barra en `--brand-soft` con altura de fila menos 12 px, sin radio en el lado izquierdo (`rounded-r-sm rounded-l-none`). Filas de 36 px.

### 9.13 Otros que se ven afectados sin cambio de API

- `components/marketing/panel-preview.tsx`: sale la barra de tres puntos; queda una barra de 32 px `bg-paper-2 border-b` con la URL en `font-mono text-[0.6875rem] text-ink-4`. Borde `--n-300`, sin sombra. Sidebar interior con la barra activa de 3 px.
- `components/marketing/site-header.tsx`: `h-14 border-b border-n-200 bg-paper` sin blur. Links en `text-ink-2 hover:text-ink`. CTA "Pedir presupuesto" `size="sm"` default (tinta).
- `components/marketing/logo.tsx`: el `rect` pasa a `rx="6"` (de 9) y `fill="var(--ink)"`; el trazo `stroke="var(--paper)"`. El logo es tinta, no terracota: la marca es el trazo, el color es para la interfaz.
- `components/panel/live-visitors.tsx`: hereda la anatomía de `StatCard` con `hint` "en tu sitio ahora"; el `<Radio>` con `animate-pulse` se reemplaza por `<span className="size-2 rounded-full bg-ok" />` cuando `count > 0`, `bg-n-400` cuando 0.
- `components/panel/booking-list.tsx`: fila `min-h-12 sm:min-h-11 px-4 gap-3`; hora en `w-12 tnum font-medium`; nombre `font-medium text-ink`; detalle `small text-ink-3`; fuente de la reserva `small text-ink-4 hidden sm:block`; badge `dot`. Hover `bg-n-100`. El `<a>` ocupa toda la fila (`flex w-full`).
- `components/panel/paused-banner.tsx`: `border-l-[3px] border-l-warn bg-warn-soft text-ink rounded-sm px-4 py-3 text-[0.9375rem]`.
- `components/ui/dialog.tsx`, `sheet.tsx`, `popover.tsx`, `dropdown-menu.tsx`: `rounded-md shadow-overlay border-0`; duraciones 180/240 ms; scrim `bg-ink/40`.
- `components/ui/tabs.tsx`: lista con `border-b border-n-200`; trigger `h-10 px-3 text-[0.9375rem] text-ink-3 data-[state=active]:text-ink data-[state=active]:border-b-2 data-[state=active]:border-brand rounded-none`. Sin fondo tipo "segmented".
- `components/ui/skeleton.tsx`: `bg-n-100 rounded-sm animate-none` (sin pulse; se ve al instante y no parpadea).

---

## 10. Data viz

- **Series**: 1 `--brand`, 2 `--info`, 3 `--ok`, 4 `--warn`, 5 `--ink-3`. Máximo 3 series en un gráfico del panel; si hacen falta más, es una tabla.
- **Una serie sola** siempre en `--brand`. Un gráfico de "visitas" en gris es un gráfico que nadie mira.
- **Comparación con período anterior** (cuando exista): la serie anterior en `--n-300` con `strokeDasharray="3 3"`, nunca en color.
- **Ejes**: sin línea de eje. Etiquetas `micro tnum` en `--ink-4`. Eje Y con 3 valores (0, mitad, máximo redondeado a "número lindo": 10, 20, 50, 100, 200, 500, 1k).
- **Grilla**: 3 horizontales `--n-200`, 1 px. Sin verticales.
- **Barras** (`BarList`): fondo `--brand-soft`; texto encima en `--ink`. Si hay que distinguir categorías, se usa texto, no color.
- **Estado vacío**: el mismo `<EmptyState>` de siempre dentro del contenedor del gráfico ("Todavía no hay visitas. Cuando el sitio esté en línea, acá vas a ver cuánta gente entra por día."). Nunca un gráfico con ceros planos.
- **Un solo dato**: si `data.length < 3`, se muestra el número grande (`stat`) y no la línea.
- **En oscuro**: los tokens ya cambian (brand L 0.74, grilla `--n-200` a L 0.32); el trazo se mantiene en 1.5 px. El círculo del último punto usa `stroke="var(--surface)"`, que en oscuro es el fondo de la card, por lo que sigue recortando bien.
- Accesibilidad: cada `<svg>` con `role="img"` y `aria-label` que incluya el valor total y el rango ("Visitas por día, últimos 30 días, total 2.310"). El total está siempre como texto al lado del gráfico, nunca solo dentro del SVG.

---

## 11. Densidad del panel

### 11.1 Alturas

| Elemento | Mobile (< 640) | ≥ sm |
|---|---|---|
| Header del panel | 56 | 56 |
| Fila de lista de reservas | 48 mín. | 44 mín. |
| Fila de tabla | 48 | 44 |
| Ítem de sidebar / menú | 40 (44 de área táctil con gap) | 40 |
| Botón default | 48 (`lg`) | 40 |
| Input | 40 | 36 |
| Chip de filtro | 36 | 32 |
| Hora en calendario | 72 px / hora | 72 px / hora |

Todo lo tocable mide ≥ 44 px de alto en mobile o tiene ≥ 44 px de caja de toque (con `gap` o `py`). Los `size-8` de shadcn para `icon` pasan a `size-10`.

### 11.2 Texto

Nombre de cliente y hora: `body` 500 (15 px). Detalle de fila: `small` (13 px). Nada por debajo de 13 salvo `micro` (11) en gutter y ejes. Los stats a 28 px.

### 11.3 Breakpoints y qué se colapsa primero

| Breakpoint | Qué pasa |
|---|---|
| `< 640` | Sidebar → sheet. Stats en 2 columnas. En `BookingList` se oculta la fuente de la reserva. `ViewSwitcher`: solo "Día / Lista"; "Semana" se oculta (no entra en 360 px). Dashboard: agenda arriba, después visitas, después página más vista (una columna). Filtros de reservas: la búsqueda queda visible, el resto colapsa en un `<Sheet side="bottom">` "Filtros" |
| `640–1023` | Stats en 2 columnas. Dashboard en 1 columna. Calendario semana con `min-w-[760px]` y scroll horizontal |
| `≥ 1024` | Sidebar fija 240. Stats en 4. Dashboard `grid-cols-[1.4fr_1fr]` |
| `≥ 1280` | `<main>` a 1280 máx. No hay más cambios; no se agrega una tercera columna nunca |

Orden de colapso, del primero al último: fuente de la reserva → columna "Recurso" en lista → vista Semana → filtros secundarios → descripción del `PageHeader` (en `< 640` se oculta si hay `actions`). Lo que **nunca** se colapsa: hora, nombre, estado, la acción "Nueva reserva/turno".

### 11.4 Acción principal en mobile

En `< 640`, el botón del `PageHeader` deja el header y se fija abajo: `fixed inset-x-4 bottom-4 z-20` con `size="lg"` y `--shadow-overlay`. Es la única excepción a "las superficies planas no tienen sombra" porque flota de verdad sobre la lista.

---

## 12. Voz y copy

Rioplatense, vos, sin signos de admiración, sin emojis. Un dueño de bar lee el sitio con desconfianza; un encargado lee el panel con apuro. La voz es la misma: dice qué pasa y qué hacer, y no promete.

**Títulos**: oración con sujeto, punto final en el sitio, sin punto en el panel. Nunca gerundio de marketing ("Impulsando…").
**Botones**: verbo en infinitivo o imperativo de vos + objeto: "Pedir presupuesto", "Confirmar reserva", "Cancelar turno". Nunca "Enviar", "OK", "Continuar" solos. Nunca "¡Empezá ya!".
**Estados vacíos**: primera línea dice qué falta; segunda dice cómo va a aparecer o qué hacer. Una acción como mucho.
**Errores**: qué no se pudo hacer + qué hacer ahora. Sin "Ups", sin "algo salió mal", sin código de error visible al usuario del panel.
**Vocabulario por rubro**: siempre desde `vocabularyFor()`. "Reserva" nunca aparece hardcodeada donde puede ser "turno".
**Fechas y números**: siempre `lib/format.ts`. "vie 5 sep, 20:30" en el panel; "viernes 5 de septiembre" en el sitio y en emails.

Tres pares:

| Esto no | Esto sí |
|---|---|
| "Impulsá tu negocio al siguiente nivel con nuestras soluciones digitales integrales" | "El sitio de tu negocio, y el panel para manejarlo." (ya está en el hero: se queda) |
| Empty state: "¡Todavía no hay reservas! 📅 Creá la primera" | "Hoy no hay reservas. Cuando entre una desde tu sitio o la cargues a mano, aparece acá." (ya está en el dashboard: se queda) |
| Error: "Ups, algo salió mal. Error 500." | "No pudimos guardar el turno. Revisá la conexión y probá de nuevo; si sigue igual, escribinos." |

Y uno más del sitio, porque es donde más se nota: el chip "Sitios en línea en dos semanas" con el cohete se reemplaza por el eyebrow "SITIOS Y PANEL PARA NEGOCIOS" y el dato "dos semanas" queda donde está, en la lista de stats bajo el hero, con número tabular.

---

## 13. Plan de aplicación

Del más visible al menos. Cada etapa deja el repo funcionando y se puede mergear sola.

### Etapa 1 — Tokens (1 archivo, cambia todo)

- `app/globals.css`: pegar el bloque de la sección 4.6 completo. Borrar `@utility grid-lines`.
- `app/layout.tsx`: `weight: ['400', '500', '600']` en `Geist`.
- Verificar: `npm run build`, revisar `/`, `/panel/[orgSlug]`, `/panel/[orgSlug]/reservas` en claro y oscuro. Con esto solo, el violeta desaparece y todos los radios ≥ 8 px bajan a 8.

### Etapa 2 — Primitivos shadcn (`components/ui/`)

Orden: `button.tsx` → `input.tsx` → `textarea.tsx` → `select.tsx` → `card.tsx` → `table.tsx` → `tabs.tsx` → `dialog.tsx` → `sheet.tsx` → `popover.tsx` → `dropdown-menu.tsx` → `badge.tsx` (`rounded-full h-6 px-2.5`, variantes soft) → `skeleton.tsx` → `checkbox.tsx`, `switch.tsx` (foco outline brand, radio 4 / full) → `tooltip.tsx` (`bg-ink text-paper rounded-sm text-[0.8125rem]`) → `alert.tsx` (barra izquierda 3 px como el error state) → `separator.tsx` (`bg-n-200`) → `avatar.tsx`, `scroll-area.tsx`, `label.tsx` (`text-[0.8125rem] font-medium text-ink-2`).

### Etapa 3 — Componentes compartidos (raíz de `components/`)

`page-header.tsx` (con `eyebrow`) → `stat-card.tsx` → `status-badge.tsx` (con `variant`) → `empty-state.tsx` → `error-state.tsx`.

### Etapa 4 — Panel

1. `app/panel/[orgSlug]/layout.tsx` (sidebar 240, header 56 sólido).
2. `components/panel/sidebar-nav.tsx`, `mobile-nav.tsx`, `org-switcher.tsx`, `user-menu.tsx`.
3. `app/panel/[orgSlug]/page.tsx`: secciones a `<Card>`, fecha a `eyebrow`, stats `grid-cols-2 lg:grid-cols-4`.
4. `components/panel/booking-list.tsx`, `live-visitors.tsx`, `paused-banner.tsx`, `skeletons.tsx`.
5. `components/panel/calendar.tsx` (tonos, `pxPerHour` 72, cabecera sólida, línea de ahora).
6. `app/panel/[orgSlug]/reservas/page.tsx`, `booking-filters.tsx`, `view-switcher.tsx`, `booking-dialog.tsx`, `new-booking-form.tsx`, `customer-drawer.tsx`.
7. `components/charts/line-chart.tsx`, `bar-list.tsx`; `app/panel/[orgSlug]/analitica/page.tsx`, `analytics-breakdowns.tsx`.
8. Resto: `clientes`, `menu`, `clases`, `eventos`, `pagos`, `ajustes/*` con `components/settings/field.tsx` y `settings-tabs.tsx`. Acá no debería quedar ninguna clase de superficie a mano.
9. Quitar los props `icon` muertos de `EmptyState` y `StatCard` y sus usos en `app/panel/**`.

### Etapa 5 — Sitio público

1. `components/marketing/site-header.tsx`, `site-footer.tsx`, `logo.tsx`.
2. `app/(marketing)/page.tsx`: hero sin gradiente ni chip; ventajas como lista numerada en 2 columnas; pasos con regla superior `--n-300` y número `stat`; trabajos con captura real (`content/works` necesita un campo `cover` con ruta a `public/works/<slug>.jpg`; mientras no exista, bloque `--paper-2` con el nombre en `h2-site`); precios con las tres cajas iguales y el destacado en `--paper-2`; FAQ abierto sobre reglas; CTA final en `bg-ink text-paper` con botón `outline` invertido (`border-paper/30 text-paper hover:bg-paper/10`).
3. `components/marketing/panel-preview.tsx` (sin puntitos, con la barra activa y stats `inline`).
4. `app/(marketing)/trabajos/page.tsx`, `trabajos/[slug]`, `contacto/page.tsx`, `contact-form.tsx`.

### Etapa 6 — Auth y admin

`components/auth/*` (`auth-card.tsx` a `<Card>` de 400 px con `p-8`), `app/(auth)/*`, `components/admin/admin-nav.tsx` y `app/admin/*` con las mismas reglas del panel.

### Verificación al cierre de cada etapa

```bash
grep -rn "rounded-\(lg\|xl\|2xl\|3xl\)\|shadow-\(xs\|sm\|md\|lg\|xl\)\|backdrop-blur\|animate-pulse\|font-bold\|transition-all" app components | grep -v node_modules
```

Debe devolver cero líneas al terminar la etapa 5. Después: `npm run typecheck`, `npm run lint`, `npm run build`, y una pasada manual de foco con Tab en `/panel/[orgSlug]/reservas` en claro y oscuro: el outline terracota tiene que verse en cada control, incluidos los bloques del calendario.
