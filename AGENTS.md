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
| `--header-h` | — | `76px`, `140px` from `sm:` up. Height of home's `Header`. |
| `--header-h-compact` | — | `64px`, `80px` from `sm:` up. Height of `Header compact`, on every other page. |
| `--footer-h` | — | `84px`, `120px` from `sm:` up. Height of `Footer` (foot of every page). Change bar heights in `globals.css` only — never hardcode them. |
| `--size-h1` / `--size-h2` / `--size-p` | `text-h1` / `text-h2` / `text-p` | `38px` / `26px` / `16px`, and `64px` / `36px` / `18px` from `md:` (768px) up. The type scale for headings and body copy. |

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
`AboutMe` and the `/about` hero. Times italic has a smaller x-height, so where the mockups
show those words matching the sans, scale them up (`AboutMe` uses `1.18em`).

Tiers:
1. **Headings** — `font-times italic`, `text-h1` (64 / 38px) for page titles and `text-h2`
   (36 / 26px) for section headings. The sizes are fixed, not scaled in `--u`, so in a
   mockup-measured layout set text that follows a heading in flow, not at a measured top.
2. **Prose** — `font-sans`, `text-p` (18 / 16px), `max-w-[60ch]`. Don't hand-set line
   breaks in it.

Display text keeps its mockup size and is outside the scale: the `-hello.` hero, the `/about`
statement, the table labels on `/about`, `WorkFolder` titles, the
`AboutMe` tab labels and the project pages from `lg` up (sized from their PDFs).
3. **Micro-caps** — the `label` utility (custom `@utility` in `globals.css`): Montserrat,
   uppercase, 15px / `0.22em` by default. Section eyebrows and text buttons. Use `label`;
   don't respell it as a utility chain.
4. **Nav links** — the `nav-link` utility: Times italic, lowercase copy,
   `clamp(1.25rem,2.2vw,2rem)` via `--nav-size`. `Header` (every page) and `Footer` only.

`label` reads its size and tracking from `--label-size` / `--label-tracking`, so call
sites tune it with arbitrary properties — `label [--label-size:13px] sm:[--label-size:17px]`
— rather than fighting the utility layer with a competing `text-*` class. Variants work.


Bodoni Moda and Libre Baskerville (from `public/Font Family.png`) were used earlier and
dropped for the two-family rule; don't bring them back without a reference image asking for them.

## Structure

Navigation is plain in-flow markup: nothing is fixed, sticky or hidden on scroll, and the
same markup serves phones and desktops (no hamburger).

- **Home** draws the big `Header` and `Footer` itself. The header and the `-hello.` hero
  fill one `min-h-svh` screen (Home.png), and then scroll away with the page.
- **Every other page** starts with `SiteNav`: the same `Header`, at the compact height
  (`--header-h-compact`), so the navigation looks identical everywhere. A page passes its
  own links as children (`QuietLink`s in a labelled `<nav>`), shown in a thin row under the
  header, right-aligned with *about*. Each page renders `SiteNav` itself, so it can pass
  those links. On archive and about the mockup frames therefore start below the header.
- **Contact** (`Footer`: *e-mail*, *resume*, *ig*, *in*) is on every page, in the flow like
  the header, never fixed. It is rendered after `<main>`, which is `flex-1`, so it sits at the
  bottom of the screen on a short page and after the content on a long one: by the `(pages)`
  layout, and by home itself. The CV (`public/resume/cv main.pdf`) is also linked from the home about card and
  the `AboutMe` contact tab. Contact details live in `src/components/contact.ts`.
- Pages have no visible title where the header already says where you are (`/work`,
  `/work/archive`, `/about`); they keep an `sr-only` h1.

The root layout renders only `children`. Everything except home lives in the `(pages)` route
group (URLs are unaffected), whose layout supplies `<main>` and the `Footer`; home supplies its own.

| Route | State |
|---|---|
| `/` | Built. Screen 1 matches `Home.png`: the `-hello.` `MagnifyText` hero (Montserrat, `text-burgundy`, on paper) under `Header`, the two filling one `min-h-svh` screen and scrolling away together. Screen 2 matches `Home-section-2.png`: a full-bleed landscape photo, and a burgundy about card with a portrait beneath it. The card's heading *about* is Times italic `text-h2`; everything else (copy, tools line, *resume* and *more*) is Montserrat `text-p`, wrapping freely, with the emphasised words in medium weight. The landscape (`public/home/sunset.png`) is the designer's own photo: a beach sunset, 1672×941 (16:9), cropped by `object-cover` to a wide band across the clouds and horizon. (`public/home/landscape.jpg`, a generated sage-ridge image, is the earlier stand-in and no longer used.) The portrait (`public/home/portrait.jpg`) is a 4:3 photo cropped wide with `object-cover`, held on the face. Screen 3 is `AboutMe` on paper, followed by the `Footer`. |
| `/work` | Hero built to match `Work-hero-section.jpeg`, minus its *works* / *archive* switch (archive is in the header): headroom for the first folder's card fan, then `WorkFolder` with *branding*, *packaging* and *editorial* (burgundy / stone / burgundy). A folder's cards are the projects filed under it in `work/projects.ts`. A project lists its `folders`, so it can sit in more than one. Each card is a link to the project page, captioned with its title on hover. *branding* holds Brew For You, Surahi and Raya, and *packaging* holds Nektar and Raya. Folders with no project yet keep the `public/folder-demo/` placeholder cards, and the folder links themselves (`#branding`, …) are still placeholders. The page and the footer fill at least one screen (`min-h-[calc(100dvh-var(--footer-h))]`, `overflow-y-clip`) and `WorkFolder fill` runs *editorial* down to the footer, so no paper shows under the folders. `work/layout.tsx` defines `--u` (one pixel of the 1400px mockups, from `100cqw`) for everything under `/work`. |
| `/work/[slug]` | Project pages, `/work/brew-for-you`, `/work/nektar`, `/work/surahi` and `/work/raya`, rebuilt from the designer's PDFs. The PDFs themselves are far too heavy to ship (288MB, 302MB, 294MB and 324MB, almost all of it Illustrator's private editing data). Everything lives in `work/projects.ts`: a list of image, text, rule and slideshow blocks, each with its position in PDF points. A rule is a hairline or, with `color`, a plain block of colour; rules are only drawn from `lg` up. A slideshow is a `MenuSlideshow` panel, drawn at every size: Surahi's two olive menu panels flip through its food and beverage menus (`public/work/surahi/{food,beverage}-menu-N.jpg`). Text can carry the PDF's own `color`, and a line can mix Montserrat and Times italic runs. It is drawn above any photo it overlaps. A project's `face` sets its headings and labels: Outfit (Brew For You, the default) or Montserrat Medium (Nektar, Surahi, Raya). From `lg` up, the page is the PDF 1:1, with `--p` as one PDF point (`100cqw / page width`). Below `lg`, the blocks stack in list order in a two-column grid, using each block's `stack` (`full` / `half` / `bleed`), because the PDF's 12pt type is unreadable once scaled that small. Assets live in `public/work/<slug>/`: each image's visible crop is rendered out of the PDF, with any text or vector art the PDF draws over it redacted first, since those are separate blocks. Vector art without text is exported as SVG path data. Vector art that contains text is rasterized: JPG when opaque, WebP when it needs transparency. So is any text in a face the site doesn't load (Raya's Samarkan wordmarks, its Baskervville and Outfit banner lines): it stays in its picture, and only Montserrat and Times italic lines become text blocks. The paper background replaces the PDF's white. Previous / next run in `projects.ts` order and wrap around: under the header (*← previous*, *next: Title →*), and in a pager after the page (hairline, micro-caps, Times italic titles), with a centred *back to top ↑* (`BackToTop`) below it. Only listed slugs exist (`dynamicParams = false`). |
| `/work/archive` | Every entry in one column: *i model*, *i document*, *behind the scenes*, each after its own `archive-section-*.jpeg`, in a `<section id={slug}>` with an `h2`. There are no per-entry pages. Fed by `archive/entries.ts`: each entry has its copy with hand-set line breaks, plus the title top and collage top measured off its own mockup, which differ slightly between them. From `lg` up each section is a three-column grid (`1fr auto 1fr`): the collage (603×819 mockup px) is centred on the page, and the text sits in the left column, a 19rem block set against the collage. Title (`text-h1`) and subtitle (`text-p`) stack in it. Heights and tops use `--a`, which is `--u` capped at `100svh/922` (the 842 frame plus 40 above and below), so an entry never runs taller than one screen. Below `lg` the text stacks above the collage, centred, with the collage's width also capped by the screen height. An entry with `collage` items shows them as a `PrintCollage`: *i model* (14 photos, `public/archive/i-model/`) *i document* (38 photos and one video, `public/archive/i-document/`) and *behind the scenes* (29 photos and two videos, `public/archive/behind-the-scenes/`). The header links here, so the page adds no links of its own. |
| `/about` | Matches `about-page.jpeg` and `about-second-section.jpeg`, two 1400×842 frames in `--u` from `md:` up, stacked below. The mockup's *about* heading is dropped and the hero frame shortened to 722u to close its gap. Hero: Montserrat copy with Times italic burgundy words at the **same** size (`0.99em`, not the `AboutMe` `1.18em`), and the *portrait at work* photo (`public/about/portrait-at-work.jpg`, cropped to the slot's 473:334). Second screen: *what i contribute to the ~~table~~?* (`text-h2`, centred) with *team* above it, the table drawing, and four burgundy Montserrat labels around it. The drawing is `public/about/team-table.svg`, traced from the mockup, so it is crisp at any size. The heading carries `0.016em` tracking because the mockup's Times sets wider than Times New Roman. It ends with the `(pages)` footer, like every page. |

Design inspiration reference: `https://swapnajasevekari.framer.website/` (client-rendered
Framer site — plain fetching returns only the bio copy, so it needs a real browser to
inspect).

## Components

- `SiteNav` — server component, the first thing on every non-home page: `<Header compact />`,
  plus its `children` (the page's own links) in a thin right-aligned row beneath it, padded
  like the header so they line up with *about*.
- `NavLink` — client (`usePathname`); a header link that turns `text-burgundy` and sets
  `aria-current` on the page it points to (home matches only `/`, the rest also match
  sub-pages, except those under its `exclude`: *works* excludes `/work/archive`).
- `QuietLink` — faint micro-caps link for a page's own navigation (previous / next, back to
  an index), passed into `SiteNav`. Wrap a page's `QuietLink`s in a `<nav aria-label>`.
- `Header` / `Footer` — server components, laid out as in `Home.png`, in the page flow.
  Header is four `NavLink`s spread edge to edge: *home*, *works*, *archive*, *about*. It is
  the same on every page; `compact` only swaps `--header-h` for `--header-h-compact`. Footer
  has *e-mail* / *resume* on the left and *ig* / *in* on the right, with no top rule; resume
  and socials open in a new tab. Home renders `Header`
  above its hero and `Footer` after its `<main>`; the `(pages)` layout closes every
  other page with `Footer`.
- `AboutMe` — client component; a burgundy index card with three folder tabs
  (`myself-component-*.jpeg`). Exactly three sections, enforced by a tuple type; headings and
  copy live in `defaultSections` at the top of the file (or pass `sections`). Nothing is open
  on load; a tab's heading goes from `text-paper/55` to `text-paper` when active and its
  copy appears. Copy is `text-p` (the contact lead line `text-h2`), and `<em>` in it is set
  in Times italic at `1.18em`. The contact tab has *connect with us* and *resume* buttons.
  The rest is sized in `cqw` against the card's own width, so it scales as one piece; the tab silhouette is an
  SVG path in 936×76 mockup pixels. WAI-ARIA tabs with arrow/Home/End keys. The watermarks
  in the reference images ("The February Recap", the cursor, the ghost tab captions) are
  not part of the design.
- `PrintCollage` — client component; the archive collage, rebuilt from the designer's
  `Archive Collage.mp4`: a stop-motion pile of photo prints (warm white border, contact
  shadow, faint sheen) laid down, shuffled and lifted back off, animated on twos.
  - `SHEETS` holds each print's pose, measured off the video's frames (centre and width in %
    of the collage, rotation). A later pose of the same print is its own sheet with `of`
    naming the first, and is rendered as one element that moves. `STATES` is the video's
    complete play, loosened (no one- or two-frame flashes, fewer simultaneous moves): holds
    in stop-motion frames, and the pile bottom to top.
  - A stop-motion frame is `FRAME_MS` (12fps). Each move is a CSS transition whose `linear()`
    easing is a staircase, so the print holds a pose per frame: `LAY` (in from `AWAY`, turned
    and raised), `NUDGE` and `LIFT`. Tune the pace in `FRAME_MS` and the holds, the spacing
    in those arrays.
  - One pass of the choreography lays down 14 items (`slot` 0–13). A longer set runs it again
    with the next 14: its first print is laid onto the last pass's pile (`carry`), which is
    cleared from under it once it lands. A last pass short of 14 plays only the states its
    items fill (`scriptFor`), so nothing repeats; only its pile's edges borrow from the first
    pass. After the last pass the loop cuts straight back to the opening pile through a reel
    change (`reel`, `REEL_FRAMES`): the film slips in the gate and the lamp flares.
  - The projector look is layered over the pile, all in the component's hoisted stylesheet
    (`CSS`, a template literal: no backticks in it): a sepia grade on the prints, a lamp
    hotspot that flickers, edge falloff, multiplied grain, the odd scratch and fleck of dust,
    and a shake of the whole frame (`pc-weave`, in cqw). The projector runs at 24fps; its
    keyframes are generated from a seeded random, so server and client agree. Everything
    pauses off-screen (`data-running`) and stops under `prefers-reduced-motion`.
  - Items (`CollageItem`) are pre-cropped to 3:4, or 4:3 with `landscape` (a landscape inset
    is widened ×1.25). An item with `video` plays muted on its print when it lands on top, and
    the pile waits for it to end. Any stop-motion rate is baked into the file, at 5fps in real
    time, each kept frame nudged and exposed slightly differently: the *i document* valley
    clip keeps every 5th frame of its 25fps, tone-mapped from the phone's HDR (HLG) to SDR;
    the *behind the scenes* clips keep every 6th of their 30fps, after dropping the frames
    the phone duplicated. Put a video in slot 13 (`o`, the last print of a pass, alone on
    the pile) so nothing covers it while it plays.
  - Every print of the pass on show, and of the next pass, stays mounted at `opacity: 0` when
    off the pile, so each photo is loaded before it's laid down. The loop waits for the first
    pass (or 4s), and pauses off-screen. Under `prefers-reduced-motion` it holds one full pile
    (`STILL`) and videos show their poster.
- `BackToTop` — client component; a faint micro-caps button that scrolls to the top of the
  page (smoothly, or at once under `prefers-reduced-motion`) and moves focus to its `target`,
  an element with `tabIndex={-1}`. Project pages point it at their sr-only h1.
- `MenuSlideshow` — client component; a panel of colour that flips through a printed
  piece, after the designer's `surahi_collage_refrence.mp4`: each spread is held dead still
  for `CUT_MS` (1s), then hard-cut to the next, no fade. Each slide sits a hair off centre
  (`PLACEMENTS`, measured off the reference), the same every loop. The print look is baked
  into the images, not applied in CSS: pages rendered at the PDF's trim box, cover and back
  cover alone and the rest in spreads, paper white held at 94% (blacks untouched, no tint),
  a static paper mottle with specks, the crease at the fold, and a darker lip along the bottom
  edge. Below `lg` the panel is 4:3 (`STACKED_ASPECT`). It pauses off-screen, clicking the
  panel pauses and resumes it, and under `prefers-reduced-motion` it holds the first spread.
- `ImageHolder` — filler block for a photo not yet supplied. Swap for `next/image` with the
  same sizing classes.
- Home's second section is measured in `--u` (one pixel of the 1400px-wide mockup,
  `max(1px, 0.07143vw)`), so its proportions track the mockup exactly and never shrink below
  drawn size. Tune it in mockup pixels: `calc(17*var(--u))`.
- `ArrowUpRight` — the shared hairline diagonal arrow (currently unused). Put `group` on the parent link to
  get the hover nudge. **There is no icon library, by design** — inline SVG only. Brand
  logos would fight the aesthetic; don't add `react-icons` or `lucide`.
- `MagnifyText` — WebGL2 warp over canvas-rasterized text, playing a 98-frame (30fps) loop
  on its own, with no pointer input. The loop is baked from the designer's
  `Animation Loop.mp4`: each video frame was registered against the resting word, and the
  per-frame displacement grids live in `magnifyTextLoop.ts` (generated, don't hand-edit),
  in ink-box units so they fit any size. It was traced from `-hello.`, so other text
  still warps, but won't match the reference. The loop pauses while off-screen. Three things bite:
  - It rasterizes `getComputedStyle(span)` at `document.fonts.ready`, so **all styling
    must arrive through `className`**, and any new prop that affects appearance must be
    added to the effect's dependency array or the texture keeps the stale type.
  - It no-ops (renders plain text) under `prefers-reduced-motion: reduce` or without
    WebGL2 — so the fallback `<span>` styling has to look right on its own.
  - The canvas is padded by `0.6×` the ink height on every side, the furthest the loop
    throws ink. Changing the loop data means re-checking that reach.
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
  - `fill` runs the last folder's panel a full screen (`100lvh`) further down. The host has
    to clip it with `overflow-y: clip` where the page ends (`clip-path` would still add the
    overflow to the scroll height).

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
