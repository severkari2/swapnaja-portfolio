<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- Everything below is hand-written. The block above is tool-generated: append here,
     never edit inside the BEGIN/END markers. -->

# Swapnaja — portfolio site

Personal portfolio for Swapnaja, a graphic designer. The brief is **minimalist + old money**:
warm ivory paper, deep oxblood panels, Times italic against a quiet geometric sans,
generous whitespace, hairline rules. When in doubt, remove something and add air.

## Design tokens

Defined once in `src/app/globals.css` — `:root` holds the raw values, `@theme inline`
exposes them as Tailwind utilities. **Never hardcode a hex or a font stack in a component.**

| Token | Utility | Value |
|---|---|---|
| `--paper` | `bg-paper` | `#f7f4ef` — page, header, footer |
| `--ink` | `text-ink` | `#1a1613` — warm near-black |
| `--burgundy` | `bg-burgundy` | `#74070e` — hero only |
| `--rule` | `border-rule` | 14% ink — hairlines |
| `--placeholder` | `bg-placeholder` | `#d9d3ca` — fill for `ImageHolder` until real photos land |
| `--stone` | `bg-stone` | `#aaabaa` — cool grey, the *packaging* folder on `/work` |
| `--header-h` | — | `76px`, `140px` from `sm:` up. Height of the header at the top of the page. |
| `--header-h-compact` | — | `76px`. The header's height whenever it reappears away from the top of the page. |
| `--footer-h` | — | `84px`, `120px` from `sm:` up. Height of the sticky footer. |
| `--view-h` | — | `100svh` minus both bars: the visible frame. Full-screen sections use `min-h-[var(--view-h)]`. Change bar heights in `globals.css` only — never hardcode them. |

`MagnifyText` takes its text colour from `className` (`text-burgundy`) and its container
background from a `backgroundColor` prop that defaults to `transparent`, so it sits on the
paper. The WebGL canvas itself always clears to transparent.

## Typography

**Two families, site-wide: Times italic and Montserrat.** Nothing else is loaded, unless a
reference image supplied by the designer shows another face. Loaded in `src/app/layout.tsx`
(Montserrat via `next/font/google`; Times is the system face, with self-hosted Tinos italic
as the fallback).

| Family | Token | Utility | Role |
|---|---|---|---|
| Times italic | `--font-times` | `font-times italic`, `nav-link` | Headings, tab labels, nav links, and emphasised words inside Montserrat copy. Always italic. System `Times New Roman`/`Times` first; Tinos italic (self-hosted, not preloaded) is the fallback, and it ships **italic only**. |
| Montserrat | `--font-montserrat` | `font-sans` | Body copy, the home hero (`-hello.`), labels, buttons. Also the `body` default. Variable 100–900. |

The recurring gesture is a Montserrat sentence with a few words in Times italic, as in the
home about teaser and `AboutMe`. Times italic has a smaller x-height, so where the mockups
show those words matching the sans, scale them up (`AboutMe` uses `1.18em`).

Tiers:
1. **Headings** — `font-times italic`, `clamp(3rem,9vw,7rem)` for page titles.
2. **Prose** — `font-sans`, `clamp(1.125rem,1.8vw,1.75rem)`, `leading-[1.6]`, `max-w-[60ch]`.
3. **Micro-caps** — the `label` utility (custom `@utility` in `globals.css`): Montserrat,
   uppercase, 15px / `0.22em` by default. Section eyebrows and text buttons. Use `label`;
   don't respell it as a utility chain.
4. **Nav links** — the `nav-link` utility: Times italic, lowercase copy,
   `clamp(1.25rem,2.2vw,2rem)` via `--nav-size`. Header and footer only.

`label` reads its size and tracking from `--label-size` / `--label-tracking`, so call
sites tune it with arbitrary properties — `label [--label-size:13px] sm:[--label-size:17px]`
— rather than fighting the utility layer with a competing `text-*` class. Variants work.

**Keep headings well above the prose they introduce** — roughly 2× the body size.

Bodoni Moda and Libre Baskerville (from `public/Font Family.png`) were used earlier and
dropped for the two-family rule; don't bring them back without a reference image asking for them.

## Structure

`src/app/layout.tsx` owns `<Header />` and `<Footer />`. Both are wrapped in `AutoHideBar`,
so they get out of the way while you read and come back as soon as you might want them.
Pages never draw their own nav or footer. Everything except home lives in the `(pages)` route group
(URLs are unaffected), whose layout supplies `<main>`; home supplies its own.

| Route | State |
|---|---|
| `/` | Built. Screen 1 matches `Home.png`: the `-hello.` `MagnifyText` hero (Montserrat, `text-burgundy`, on paper) filling `--view-h`, so it lands between the header and footer. Screen 2 matches `Home-section-2.png`: a full-bleed landscape photo, and a burgundy about card (Times italic + Montserrat) with a portrait beneath it. Both photos are `ImageHolder` placeholders. Screen 3 is `AboutMe` on paper. |
| `/work` | Hero built to match `Work-hero-section.jpeg`. `work/layout.tsx` holds the *works* / *archive* switch (`WorkSwitch`, Montserrat; the current view is in ink, the other is dimmed) and defines `--u`. This page renders `WorkFolder` with *branding*, *packaging* and *editorial* (burgundy / stone / burgundy). Folder cards and links (`#branding`, …) are placeholders. The footer stays hidden here. |
| `/work/archive` | Filler: three `ImageHolder` tiles covering the same area as the folders, until the archive hero is specified. |
| `/about` | Placeholder awaiting content. |

Design inspiration reference: `https://swapnajasevekari.framer.website/` (client-rendered
Framer site — plain fetching returns only the bio copy, so it needs a real browser to
inspect).

## Components

- `AutoHideBar` — client wrapper that pins a bar to the top or bottom edge. It hides the bar
  while scrolling down (6px jitter threshold) and shows it again on:
  - any scroll up;
  - reaching the very top or bottom of the page;
  - keyboard focus inside the bar;
  - on mouse devices only (`hover: hover` and `pointer: fine`), the pointer coming within
    48px of that edge. Once shown, the whole bar counts as the reveal zone.

  An in-flow spacer (`spacerClassName`) keeps the at-rest height, so hiding or resizing the
  fixed bar never moves the page. It sets `data-scrolled` once the page leaves the top; the
  header styles that as `data-scrolled:h-[var(--header-h-compact)]`. Hiding uses
  `translate`, so `--view-h` never changes.

  `hiddenOn` lists routes, sub-pages included. On those routes the bar starts hidden and
  scrolling never shows it; only the pointer reveal and keyboard focus do. The spacer is
  dropped there too. The footer uses it for `/work`, where it would cover the folders.
- `Header` / `Footer` — server components, laid out as in `Home.png`. Header is a 3-column
  grid: *home*, *works* centred, *about*. Each link is a
  `NavLink` (client, `usePathname`) that turns `text-burgundy` and sets `aria-current` on
  the page it points to. Footer
  has *e-mail* on the left and *ig* / *in* on the right, with no top rule. `<main>` is a flex
  column, so a page section with `flex-1` fills exactly the space between the bars.
- `AboutMe` — client component; a burgundy index card with three folder tabs
  (`myself-component-*.jpeg`). Exactly three sections, enforced by a tuple type; headings and
  copy live in `defaultSections` at the top of the file (or pass `sections`). Nothing is open
  on load; a tab's heading goes from `text-paper/55` to `text-paper` when active and its
  copy appears. `<em>` in the copy is set in Times italic at `1.18em`. Everything is sized in
  `cqw` against the card's own width, so it scales as one piece; the tab silhouette is an
  SVG path in 936×76 mockup pixels. WAI-ARIA tabs with arrow/Home/End keys. The watermarks
  in the reference images ("The February Recap", the cursor, the ghost tab captions) are
  not part of the design.
- `ImageHolder` — filler block for a photo not yet supplied. Swap for `next/image` with the
  same sizing classes.
- Home's second section is measured in `--u` (one pixel of the 1400px-wide mockup,
  `max(1px, 0.07143vw)`), so its proportions track the mockup exactly and never shrink below
  drawn size. Tune it in mockup pixels: `calc(17*var(--u))`.
- `ArrowUpRight` — the shared hairline diagonal arrow (currently unused). Put `group` on the parent link to
  get the hover nudge. **There is no icon library, by design** — inline SVG only. Brand
  logos would fight the aesthetic; don't add `react-icons` or `lucide`.
- `MagnifyText` — WebGL2 lens over canvas-rasterized text. Two things bite:
  - It rasterizes `getComputedStyle(span)` at `document.fonts.ready`, so **all styling
    must arrive through `className`**, and any new prop that affects appearance must be
    added to the effect's dependency array or the texture keeps the stale type.
  - It no-ops (renders plain text) under `prefers-reduced-motion: reduce` or without
    WebGL2 — so the fallback `<span>` styling has to look right on its own.
- `WorkFolder` — the `/work` hero (`Work-hero-section.jpeg`): overlapping file folders.
  Hovering one fades the rest to paper and fans its cards (`public/folder-demo/`
  placeholders) up from behind its tab.
  - The layout is a flex-wrap of `span` fractions. The staggered rows come from
    `{ blank: true }` items. A blank is an inert, paper-coloured folder that cuts its
    row's tab into the folder above and pushes the next folder along. Blanks are dropped
    at ≤700px, where every folder gets its own row.
  - Length props take a number (px) or any CSS length. The work page passes
    `calc(N * var(--u))`, where `--u` is `100cqw/1400`: one pixel of the 1400px mockup.
    It scales without a floor, because the folder widths are percentages and the tabs have
    to stay in proportion with them.
  - Its stylesheet is a JS template literal injected via React 19's hoisted `<style>`, so
    **never put a backtick inside its CSS comments** — it silently ends the literal and
    the file stops parsing. The rules are unlayered and beat Tailwind: `margin: 0` on
    `.wf` wins over a `mt-*` class, so put spacing on a neighbour instead.
  - The ≤700px block uses `!important`, since props arrive as inline styles.
  - `--wf-font-title` / `--wf-font-label` default to the site font tokens.

## Stack facts

- Next 16 (App Router, Turbopack), React 19, **React Compiler is on** (`reactCompiler: true`)
  — don't hand-add `useMemo`/`useCallback` for memoisation alone.
- **Tailwind v4, CSS-first.** There is no `tailwind.config.*` and there should not be;
  theme changes go in the `@theme inline` block in `globals.css`.
- `src/` layout with the `@/*` → `./src/*` alias.
- No test setup. Verify with `npm run build`, `npm run lint`, and a browser pass.
- `turbopack.root` is pinned to the repo in `next.config.ts`. Without it, a lockfile in a
  parent folder (e.g. `C:\Projects\package-lock.json`) makes Turbopack pick the wrong root,
  and the dev server fails with "Could not find the module … in the React Client Manifest"
  and missing `@swc/helpers-<hash>` modules. If that error ever comes back, stop the dev
  server and delete `.next`.
