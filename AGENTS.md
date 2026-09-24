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
| Outfit | `--font-outfit` | `font-outfit` | **Project pages only**, because some of the designer's project PDFs (Brew For You) set their uppercase headings and small labels in it. Not preloaded, so no other page fetches it. Don't use it elsewhere. |

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
| `/work` | Hero built to match `Work-hero-section.jpeg`: the *works* / *archive* switch (`WorkSwitch`, Montserrat; the current view is in ink, the other is dimmed), then `WorkFolder` with *branding*, *packaging* and *editorial* (burgundy / stone / burgundy). A folder's cards are the projects filed under it in `work/projects.ts`: each is a link to the project page, captioned with its title on hover. *branding* holds Brew For You, *packaging* holds Nektar. Folders with no project yet keep the `public/folder-demo/` placeholder cards, and the folder links themselves (`#branding`, …) are still placeholders. `work/layout.tsx` defines `--u` (one pixel of the 1400px mockups, from `100cqw`) for everything under `/work`. The footer stays hidden here. |
| `/work/[slug]` | Project pages, `/work/brew-for-you` and `/work/nektar`, rebuilt from the designer's PDFs. The PDFs themselves are far too heavy to ship (288MB and 302MB). Everything lives in `work/projects.ts`: a list of image, text and rule blocks, each with its position in PDF points. A rule is a hairline or, with `color`, a plain block of colour; rules are only drawn from `lg` up. Text can carry the PDF's own `color`, and a line can mix Montserrat and Times italic runs. It is drawn above any photo it overlaps. A project's `face` sets its headings and labels: Outfit (Brew For You, the default) or Montserrat Medium (Nektar). From `lg` up, the page is the PDF 1:1, with `--p` as one PDF point (`100cqw / page width`). Below `lg`, the blocks stack in list order in a two-column grid, using each block's `stack` (`full` / `half` / `bleed`), because the PDF's 12pt type is unreadable once scaled that small. Assets live in `public/work/<slug>/`: each image's visible crop is rendered out of the PDF, with any text or vector art the PDF draws over it redacted first, since those are separate blocks. Vector art without text is exported as SVG path data. Vector art that contains text is rasterized: JPG when opaque, WebP when it needs transparency. The paper background replaces the PDF's white. Only listed slugs exist (`dynamicParams = false`). |
| `/work/archive` | Matches `archive-section.jpeg`: *archives* (Times italic) and three captioned photos linking to the entries. No header or footer. Both are hidden here and come back at their screen edge. |
| `/work/archive/[slug]` | *i model*, *i document*, *behind the scenes* (`archive-section-*.jpeg`). One page layout, fed by `archive/entries.ts`. Each entry has its copy with hand-set line breaks, plus the positions measured off its own mockup, which differ slightly between them. The collage is one `ImageHolder` (603×819 mockup px), because each mockup's collage is a single composed image. Only the listed slugs exist (`dynamicParams = false`). |
| `/about` | Matches `about-page.jpeg` and `about-second-section.jpeg`, two 1400×842 frames in `--u` from `md:` up, stacked below. Hero: *about* (Times italic) centred, then Montserrat copy with Times italic burgundy words at the **same** size (`0.99em`, not the `AboutMe` `1.18em`), and an `ImageHolder` portrait. Second screen: *what i contribute to the ~~table~~?* with *team* above it, the table drawing, and four burgundy Montserrat labels around it. The drawing is `public/about/team-table.svg`, traced from the mockup, so it is crisp at any size. The heading carries `0.016em` tracking because the mockup's Times sets wider than Times New Roman. No header or footer. |

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
  dropped there too. The footer uses it for `/work`, where it would cover the folders. The
  header uses it for `/work/archive`, whose mockups fill the screen from the top edge. Both
  use it for `/about`, whose mockups draw neither bar.
- `QuietLink` — faint micro-caps link, for pages whose mockups draw no navigation (the
  archive). Keep these out of the bars' reveal zones: the top and bottom 48px, plus the
  whole bar once it shows. The archive keeps them top-right, on the title's baseline.
  Bottom corners don't work: reaching for a link there pulls the footer up over it.
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
  Hovering one fades the rest to paper and fans its cards up from behind its tab.
  - A card with `href` is a link (`next/link`), and one with `title` shows it in Times
    italic above the card while the card is pointed at. Both kinds take the pointer, and
    pointing at one keeps its folder engaged, so the fan stays open as you move onto it.
    Plain cards stay pointer-transparent.
  - Each card is a sheet (`--wf-sheet`, a shade whiter than paper, with a `--rule` hairline)
    with its picture at the top. Revealed, its foot stays tucked inside the folder, deep
    enough to cover its tilt and the pointed-at lift, so no card ever shows a bottom edge
    and they read as pulled up from inside. A picture shorter than `cardHeight` (default
    `photoWidth`) gets blank filler below it to make up the length. Parked cards sit 2px
    past the fold, so their hairline never peeks out along a folder edge.
  - `offsetY` takes any length and lifts a card further. An invisible bridge under each
    live card, `--wf-oy` tall, covers the gap that opens, so the pointer can travel up from
    the folder without the fan closing.
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
