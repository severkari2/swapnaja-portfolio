import type { Metadata } from "next";
import { Fragment, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackToTop } from "@/components/BackToTop";
import { MenuSlideshow } from "@/components/MenuSlideshow";
import { QuietLink } from "@/components/QuietLink";
import { Reveals } from "@/components/Reveals";
import { SiteNav } from "@/components/SiteNav";
import {
  projectHref,
  projects,
  type Project,
  type ProjectBlock,
  type ProjectFace,
  type ProjectRun,
  type ProjectStack,
  type ProjectTextRole,
} from "../projects";
import "./project-motion.css";

// Only the projects listed; anything else under /work is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: `${project.title} — Work — Swapnaja` } : {};
}

// Stacked layout, below lg. A bleed block cancels the article's side padding.
const stackClass: Record<ProjectStack, string> = {
  full: "col-span-2",
  half: "col-span-1",
  bleed: "col-span-2 -mx-4 sm:-mx-6",
};

// The type in the stacked layout. From lg up every size comes from the PDF instead.
// Headings and labels take their face from the project, body copy from its block, in
// Montserrat Medium unless it says otherwise (faceClass).
const roleClass: Record<ProjectTextRole, string> = {
  title: "mt-6 font-times text-h1 italic leading-[1.2]",
  heading: "mt-10 text-h2 leading-[1.2]",
  label: "mt-2 text-xs",
  body: "mb-2 max-w-[60ch] text-p leading-[1.6]",
  display: "my-4 font-sans text-[2rem] font-medium leading-[1.2]",
};

const faceClass: Record<ProjectFace, string> = {
  outfit: "font-outfit",
  sans: "font-sans font-medium",
};

// From the top of a line box to its baseline, as a fraction of the font size, at the 1.2
// line height the PDFs use. It turns a PDF baseline into a CSS top: half-leading plus the
// font's ascent.
const baselineOffset = { sans: 0.9585, times: 0.9375, outfit: 0.97 };

const isItalic = (run: ProjectRun): run is Exclude<ProjectRun, string> =>
  typeof run !== "string";

function fontOf(
  role: ProjectTextRole,
  italic: boolean,
  face: ProjectFace,
  bodyFace: ProjectFace = "sans"
) {
  if (italic || role === "title") return "times";
  if (role === "body") return bodyFace;
  return role === "heading" || role === "label" ? face : "sans";
}

const twoDigits = (n: number) => String(n).padStart(2, "0");

// From lg up a block sits where the PDF draws it: --x/--y/--w/--h are points, and --p is
// one point of the PDF page (set on the article).
const placed =
  "lg:absolute lg:left-[calc(var(--x)*var(--p))] lg:top-[calc(var(--y)*var(--p))]";
const sized = "lg:w-[calc(var(--w)*var(--p))] lg:h-[calc(var(--h)*var(--p))]";

// The page is the PDF with two changes. Its hero is lifted out into the opener, so the rest
// moves up by the hero's height, and each slogan band pushes everything after it down.
function layoutOf(project: Project) {
  const bands = project.blocks.filter((b) => b.kind === "slogan");
  const shift = (y: number) =>
    y - project.hero.h + bands.reduce((sum, band) => (y > band.y ? sum + band.h : sum), 0);
  const height = shift(project.page.height);
  return { shift, height };
}

// Where a block sits across the page picks its entrance, so a row plays out left to right
// and each picture opens from its own side (project-motion.css). --pp-lag holds a wipe back
// in scroll, --pp-delay holds a timed entrance back in time.
function across(x: number, w: number, pageWidth: number) {
  const centre = (x + w / 2) / pageWidth;
  return {
    centre,
    lag: `${((x / pageWidth) * 12).toFixed(1)}vh`,
    delay: `${Math.round((x / pageWidth) * 3) * 110}ms`,
  };
}

function wipeFrom(x: number, w: number, pageWidth: number) {
  const { centre } = across(x, w, pageWidth);
  if (w / pageWidth > 0.8) return "pp-window";
  if (centre < 0.34) return "pp-from-left";
  if (centre > 0.66) return "pp-from-right";
  return "pp-from-bottom";
}

// Splits a title into words, each in its own mask, numbered on from `count` so they rise
// one after another across the lines.
function maskedWords(runs: ProjectRun[], count: { n: number }) {
  return runs.map((run, j) => {
    const text = isItalic(run) ? run.text : run;
    const words = text.split(" ").filter(Boolean);
    const nodes = words.map((word, k) => (
      // Words never reorder within a run.
      <Fragment key={k}>
        {k > 0 && " "}
        <span className="pp-mask pp-mask-word">
          <span className="pp-rise" style={{ "--i": count.n++ } as CSSProperties}>
            {word}
          </span>
        </span>
      </Fragment>
    ));
    return isItalic(run) ? (
      <span key={j} className="font-times font-normal italic">
        {nodes}
      </span>
    ) : (
      <Fragment key={j}>{nodes}</Fragment>
    );
  });
}

function Block({
  block,
  project,
  shift,
  index,
}: {
  block: ProjectBlock;
  project: Project;
  shift: (y: number) => number;
  index: number;
}) {
  const pageWidth = project.page.width;
  const face = project.face ?? "outfit";

  if (block.kind === "slogan") {
    // Three runs of the line, more than enough to cover the screen while it slides.
    const repeat = [0, 1, 2];
    return (
      <div
        className={`pp-slogan col-span-2 -mx-4 flex flex-col justify-center gap-6 overflow-clip border-y border-rule py-14 sm:-mx-6 lg:mx-0 lg:gap-[calc(28*var(--p))] lg:py-0 ${placed} ${sized}`}
        style={
          {
            "--x": 0,
            "--y": shift(block.y),
            "--w": pageWidth,
            "--h": block.h,
            color: project.accent,
          } as CSSProperties
        }
      >
        <p className="sr-only">{block.text}</p>
        <p
          aria-hidden="true"
          className="pp-slogan-row whitespace-nowrap font-times text-[4.5rem] italic leading-[1.1] lg:text-[calc(118*var(--p))]"
        >
          {repeat.map((i) => (
            <span key={i}>
              {block.text}
              <span className="px-[0.45em] opacity-40">&mdash;</span>
            </span>
          ))}
        </p>
        <p
          aria-hidden="true"
          className="pp-slogan-row pp-slogan-back label whitespace-nowrap text-ink/40 [--label-size:12px] lg:[--label-size:calc(11*var(--p))]"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="pr-[1.4em]">
              {project.title} &middot; {project.folders.join(" · ")}
            </span>
          ))}
        </p>
      </div>
    );
  }

  const where = across(block.x, block.kind === "text" ? 0 : block.w, pageWidth);

  if (block.kind === "rule") {
    const style = {
      "--x": block.x,
      "--y": shift(block.y),
      "--w": block.w,
      "--h": block.h,
      "--pp-lag": where.lag,
      "--pp-delay": where.delay,
      ...(block.color && { backgroundColor: block.color }),
    } as CSSProperties;
    // A hairline draws itself along its length; a block of colour is wiped in like a photo,
    // or springs up.
    const motion = block.color
      ? block.motion === "grow"
        ? "pp-grow"
        : `pp-wipe ${wipeFrom(block.x, block.w, pageWidth)}`
      : block.w < block.h
        ? "pp-draw-down"
        : "pp-draw-across";
    return (
      <div
        aria-hidden="true"
        data-reveal={block.motion === "grow" ? "" : undefined}
        className={`hidden bg-ink lg:block ${motion} ${placed} ${sized}`}
        style={style}
      />
    );
  }

  if (block.kind === "slideshow") {
    return (
      <MenuSlideshow
        label={block.label}
        color={block.color}
        slides={block.slides}
        aspect={block.w / block.h}
        share={(block.w / pageWidth) * 100}
        className={`pp-wipe pp-doors col-span-2 ${placed} ${sized}`}
        style={
          {
            "--x": block.x,
            "--y": shift(block.y),
            "--w": block.w,
            "--h": block.h,
          } as CSSProperties
        }
      />
    );
  }

  if (block.kind === "image") {
    const stack = block.stack ?? "full";
    const share = ((block.w / pageWidth) * 100).toFixed(1);
    // A timed entrance (deal, stamp, write) or, by default, a wipe played by the scroll.
    const motion = block.motion
      ? `pp-${block.motion}`
      : `pp-wipe ${wipeFrom(block.x, block.w, pageWidth)}${block.depth ? " pp-float" : ""}`;
    return (
      // justify-self-stretch: a grid item with an aspect ratio otherwise shrinks to its
      // content, and the image inside is absolutely positioned, so it would collapse.
      <div
        data-reveal={block.motion ? "" : undefined}
        className={`relative justify-self-stretch ${motion} ${stackClass[stack]} lg:m-0 ${placed} ${sized}`}
        style={
          {
            "--x": block.x,
            "--y": shift(block.y),
            "--w": block.w,
            "--h": block.h,
            "--pp-lag": where.lag,
            "--pp-delay": where.delay,
            // Dealt cards fall from alternate hands.
            "--pp-tilt": index % 2 ? "7deg" : "-6deg",
            ...(block.depth && { "--pp-depth": block.depth }),
            aspectRatio: `${block.w} / ${block.h}`,
          } as CSSProperties
        }
      >
        <Image
          src={block.src}
          alt={block.alt}
          fill
          sizes={`(min-width: 1024px) ${share}vw, ${stack === "half" ? 50 : 100}vw`}
          loading="lazy"
          // SVG is drawn as-is: the optimizer rasterizes nothing.
          unoptimized={block.src.endsWith(".svg")}
          className="object-cover"
        />
      </div>
    );
  }

  const Tag = block.role === "title" || block.role === "heading" ? "h2" : "p";
  const firstLine = block.lines[0];
  const firstRun = Array.isArray(firstLine) ? firstLine[0] : firstLine;
  const firstFont = fontOf(block.role, isItalic(firstRun), face, block.face);
  const roleFace =
    block.role === "heading" || block.role === "label"
      ? faceClass[face]
      : block.role === "body"
        ? faceClass[block.face ?? "sans"]
        : "";
  // Titles rise word by word, headings and display lines line by line, each from behind
  // its own mask; body copy fades up line by line; labels close up their tracking.
  const masked = block.role === "heading" || block.role === "display";
  const count = { n: 0 };

  return (
    // z-1: a line the PDF sets over a photo stays in front of it.
    <Tag
      data-reveal=""
      className={`${block.role === "label" ? "pp-track" : ""} ${roleClass[block.role]} ${roleFace} ${stackClass[block.stack ?? "full"]} lg:z-1 lg:m-0 lg:max-w-none lg:whitespace-nowrap lg:text-[length:calc(var(--size)*var(--p))] lg:leading-[1.2] ${placed}`}
      style={
        {
          "--x": block.x,
          "--y": shift(block.baseline) - baselineOffset[firstFont] * block.size,
          "--size": block.size,
          "--pp-delay": where.delay,
          color: block.color,
        } as CSSProperties
      }
    >
      {block.lines.map((line, i) => {
        const runs = Array.isArray(line) ? line : [line];
        // Display lines always keep their own rows, and so does a blank line, which keeps
        // paragraphs apart. The rest only do from lg up and wrap freely below it.
        const lineClass = block.role === "display" || line === "" ? "block" : "lg:block";
        const content = runs.map((run, j) =>
          isItalic(run) ? (
            // Runs within a line never reorder either.
            <span key={j} className="font-times font-normal italic">
              {run.text}
            </span>
          ) : (
            run || " "
          )
        );
        return (
          // Lines never reorder, and blank ones repeat, so the index is the identity.
          <span key={i}>
            {i > 0 && " "}
            {block.role === "title" ? (
              <span className={lineClass}>{maskedWords(runs, count)}</span>
            ) : masked ? (
              <span className={`${lineClass} pp-mask`}>
                <span className="pp-rise" style={{ "--i": i } as CSSProperties}>
                  {content}
                </span>
              </span>
            ) : (
              <span
                className={`${lineClass} ${block.role === "body" ? "pp-line" : ""}`}
                style={{ "--i": i } as CSSProperties}
              >
                {content}
              </span>
            )}
          </span>
        );
      })}
    </Tag>
  );
}

// The title sequence. On arrival the project's name is set large on the paper, over a
// window onto its hero photo; scrolling holds the screen while the window opens out to the
// full photo and the name lifts away, then lets the page carry on. Without scroll-driven
// animation (or under reduced motion) it is simply the name over the full-width photo.
function Opener({ project, index }: { project: Project; index: number }) {
  const { hero } = project;
  return (
    <section
      aria-labelledby="project-title"
      className="pp-opener"
      style={{ "--pp-hero-ratio": `${hero.w} / ${hero.h}` } as CSSProperties}
    >
      <div className="pp-opener-stage">
        <div className="pp-opener-head px-6 pb-10 pt-[3svh] sm:px-[7vw]">
          <p className="label flex justify-between text-ink/45 [--label-size:11px] sm:[--label-size:12px]">
            <span>
              {twoDigits(index + 1)} / {twoDigits(projects.length)}
            </span>
            <span>{project.folders.join(" · ")}</span>
          </p>
          {/* Focusable only from script: BackToTop lands here. */}
          <h1
            id="project-title"
            tabIndex={-1}
            className="mt-[5svh] text-center font-times text-[clamp(3.5rem,11vw,10.5rem)] italic leading-[0.95] outline-none"
          >
            {maskedWords([project.title], { n: 0 })}
          </h1>
        </div>
        <div className="pp-opener-frame">
          <div className="pp-opener-wipe">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              sizes="100vw"
              // The largest paint on arrival.
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>
        </div>
        <p aria-hidden="true" className="pp-opener-cue label text-ink/45 [--label-size:11px]">
          scroll
        </p>
      </div>
    </section>
  );
}

// The end card: the next project's name and hero, as one link, the way the page itself
// opens. Previous and back to top sit under it.
function NextProject({ project, next, prev }: { project: Project; next: Project; prev: Project }) {
  const nextIndex = projects.indexOf(next);
  return (
    <section
      aria-labelledby="next-project"
      className="mx-4 mt-24 border-t border-rule pb-16 pt-8 sm:mx-6 md:mx-[3.2vw] lg:mt-10"
    >
      <Link href={projectHref(next)} className="group block">
        <span className="label flex justify-between text-ink/40 transition-colors [--label-size:12px] group-hover:text-ink">
          <span>next project</span>
          <span>
            {twoDigits(nextIndex + 1)} / {twoDigits(projects.length)}
          </span>
        </span>
        <h2
          id="next-project"
          data-reveal=""
          className="mt-6 font-times text-[clamp(3rem,9vw,9rem)] italic leading-[0.95]"
        >
          {maskedWords([next.title], { n: 0 })}
          <span className="sr-only">, after {project.title}</span>
        </h2>
        <span
          className="pp-wipe pp-window relative mt-8 block aspect-[4/3] overflow-clip sm:aspect-[2/1] lg:aspect-[5/2]"
          style={{ "--pp-lag": "0vh" } as CSSProperties}
        >
          <span className="pp-zoom absolute inset-0 transition-[scale] duration-[1.4s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.04]">
            <Image
              src={next.hero.src}
              alt=""
              fill
              sizes="(min-width: 768px) 94vw, 100vw"
              className="object-cover"
            />
          </span>
        </span>
      </Link>
      <nav aria-label="More projects" className="mt-10 flex items-center justify-between gap-6">
        <QuietLink href={projectHref(prev)}>
          &larr; previous<span className="hidden sm:inline">: {prev.title}</span>
        </QuietLink>
        <BackToTop target="project-title" />
      </nav>
    </section>
  );
}

// A project page, rebuilt from the designer's PDF (see projects.ts). It opens on a title
// sequence built from the PDF's hero; from lg up the rest is the PDF page 1:1, scaled to
// the viewport's width, opened up once by the project's slogan band. Below lg the same
// blocks stack in a two-column flow, since the PDF's 12pt type would be too small to read
// at that scale. Everything arrives as it scrolls in (project-motion.css).
//
// Previous / next run in projects.ts order and wrap around. They sit in the SiteNav row, to
// skip ahead, and again at the foot of the page, where a reader lands.
export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();

  const project = projects[index];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const { shift, height } = layoutOf(project);

  return (
    <>
      <SiteNav>
        <nav aria-label="Projects" className="flex gap-6 sm:gap-8">
          <QuietLink href={projectHref(prev)}>&larr; previous</QuietLink>
          <QuietLink href={projectHref(next)}>
            next<span className="hidden sm:inline">: {next.title}</span>{" "}&rarr;
          </QuietLink>
        </nav>
      </SiteNav>

      <Reveals>
        <Opener project={project} index={index} />

        <article
          className="grid grid-cols-2 items-start gap-3 px-4 pt-16 sm:px-6 lg:relative lg:block lg:h-[calc(var(--page-h)*var(--p))] lg:p-0"
          style={
            {
              // Measured against the work layout's container, so it tracks the page width.
              "--p": `calc(100cqw / ${project.page.width})`,
              "--page-h": height,
            } as CSSProperties
          }
        >
          {project.blocks.map((block, i) => (
            <Block
              key={block.kind === "image" ? block.src : `${block.kind}-${i}`}
              block={block}
              project={project}
              shift={shift}
              index={i}
            />
          ))}
        </article>

        <NextProject project={project} next={next} prev={prev} />
      </Reveals>
    </>
  );
}
