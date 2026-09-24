<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- Everything below is hand-written. The block above is tool-generated: append here,
     never edit inside the BEGIN/END markers. -->

# Swapnaja — portfolio site

Personal portfolio for Swapnaja, a graphic designer. The brief is **minimalist + old money**:
warm ivory paper, a deep oxblood hero, a Didone display serif against a quiet geometric
sans, generous whitespace, hairline rules. When in doubt, remove something and add air.

## Design tokens

Defined once in `src/app/globals.css` — `:root` holds the raw values, `@theme inline`
exposes them as Tailwind utilities. **Never hardcode a hex or a font stack in a component.**

| Token | Utility | Value |
|---|---|---|
| `--paper` | `bg-paper` | `#f7f4ef` — page, header, footer |
| `--ink` | `text-ink` | `#1a1613` — warm near-black |
| `--burgundy` | `bg-burgundy` | `#74070e` — hero only |
| `--rule` | `border-rule` | 14% ink — hairlines |
| `--header-h` | — | `76px`, `140px` from `sm:` up. Full-bleed sections use `min-h-[calc(100svh-var(--header-h))]`, so change it in `globals.css` only — never hardcode the bar height. |

`MagnifyText` takes its text colour from `className` (`text-burgundy`) and its container
background from a `backgroundColor` prop that defaults to `transparent`, so it sits on the
paper. The WebGL canvas itself always clears to transparent.

## Typography

Four families, **one per role**. Loaded in `src/app/layout.tsx` via `next/font/google`
and self-hosted (Times is the system face, with Tinos as the fallback). Pick by role, not by taste.

| Family | Token | Utility | Role |
|---|---|---|---|
| Bodoni Moda | `--font-bodoni` | `font-display` | Headings, the wordmark, the hero. Nothing else. |
| Libre Baskerville | `--font-baskerville` | `font-serif` | Prose. Static family — weights named in the loader; it ships **no bold italic**, so never pass a `style` array with `700`. |
| Montserrat | `--font-montserrat` | `font-sans` | The home hero (`-hello.`), labels, buttons. Also the `body` default. Variable 100–900. |
| Times italic | `--font-times` | `nav-link` | Header and footer links only, lowercase: *works*, *about*, *e-mail*, *ig*, *in*. System `Times New Roman`/`Times` first; Tinos italic (self-hosted, not preloaded) is the fallback. |

Three tiers, applied everywhere:
1. **Display** — `font-display`, `clamp(2.25rem,4vw,3.5rem)` for section headings up to
   `clamp(3rem,9vw,7rem)` for page titles. Set section headings in **caps** with
   `tracking-[0.02em]`; Didone capitals are the strongest gesture the face offers.
2. **Prose** — `font-serif`, `clamp(1.125rem,1.8vw,1.75rem)`, `leading-[1.6]`,
   `max-w-[60ch]`. Libre Baskerville has a large x-height and needs the extra leading.
3. **Micro-caps** — the `label` utility (custom `@utility` in `globals.css`): Montserrat,
   uppercase, 15px / `0.22em` by default. Every nav item, section eyebrow, footer link and
   text button uses it, apart from the header and footer. Use `label`; don't respell it as a utility chain.
4. **Nav links** — the `nav-link` utility: Times italic, lowercase copy,
   `clamp(1.25rem,2.2vw,2rem)` via `--nav-size`. Header and footer only.

`label` reads its size and tracking from `--label-size` / `--label-tracking`, so call
sites tune it with arbitrary properties — `label [--label-size:13px] sm:[--label-size:17px]`
— rather than fighting the utility layer with a competing `text-*` class. Variants work.

**Keep headings well above the prose they introduce.** A section heading should land at
roughly 2× its own body copy; an earlier revision set `WHO AM I?` with `label` beside
40px prose and it read as a caption, not a question.

The families come from `public/Font Family.png`, the reference sheet supplied by the
designer — Bodoni FLF (pairing #2), Libre Baskerville (#4) and Montserrat (#3). Bodoni
Moda is the Google-hosted equivalent of Bodoni FLF. The sheet's other display faces (The
Seasons, Sloop Script, Symphony, Pfrandory, Burgues Script, Safira March) are commercial
and cannot be self-hosted without licensed files, so they are not options. Didact Gothic
(the sheet's partner to Bodoni) was tried and dropped: single weight, no italic, nothing
to build hierarchy with.

## Structure

`src/app/layout.tsx` owns the shell: `<Header />`, `<main>{children}</main>`, `<Footer />`.
Pages render section content only — they never draw their own nav.

| Route | State |
|---|---|
| `/` | Built, matching `Home.png`: a single screen with only the `-hello.` `MagnifyText` hero (Montserrat, `text-burgundy`, on paper). |
| `/work` | Placeholder awaiting content. |
| `/about` | Placeholder awaiting content. |

Design inspiration reference: `https://swapnajasevekari.framer.website/` (client-rendered
Framer site — plain fetching returns only the bio copy, so it needs a real browser to
inspect).

## Components

- `Header` / `Footer` — server components, laid out as in `Home.png`. Header is a sticky
  3-column grid with an empty first column, *works* centred and *about* on the right. Footer
  has *e-mail* on the left and *ig* / *in* on the right, with no top rule. `<main>` is a flex
  column, so a page section with `flex-1` fills exactly the space between them.
- `ArrowUpRight` — the shared hairline diagonal arrow (currently unused). Put `group` on the parent link to
  get the hover nudge. **There is no icon library, by design** — inline SVG only. Brand
  logos would fight the aesthetic; don't add `react-icons` or `lucide`.
- `MagnifyText` — WebGL2 lens over canvas-rasterized text. Two things bite:
  - It rasterizes `getComputedStyle(span)` at `document.fonts.ready`, so **all styling
    must arrive through `className`**, and any new prop that affects appearance must be
    added to the effect's dependency array or the texture keeps the stale type.
  - It no-ops (renders plain text) under `prefers-reduced-motion: reduce` or without
    WebGL2 — so the fallback `<span>` styling has to look right on its own.
- `WorkFolder` — **parked, not dead.** Unmounted from the home page but retained, along
  with its placeholder cards in `public/folder-demo/`, as the intended centrepiece of the
  future `/work` page. Its `items[]` config (aspect ratios that stagger the fan, `span`
  values that reproduce the 39/61 row split) was tuned against a reference recording and
  is preserved as a commented block in `src/app/work/page.tsx` — reuse it, don't re-derive
  it. Its stylesheet is a JS template literal injected via React 19's hoisted `<style>`,
  so **never put a backtick inside its CSS comments** — it silently ends the literal and
  the file stops parsing. It defaults `--wf-font-title` / `--wf-font-label` to the site font tokens, so it
  needs no per-instance font overrides.

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
