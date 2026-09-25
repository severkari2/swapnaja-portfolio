import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuietLink } from "@/components/QuietLink";
import { SiteNav } from "@/components/SiteNav";
import {
  projectHref,
  projects,
  type ProjectBlock,
  type ProjectFace,
  type ProjectRun,
  type ProjectStack,
  type ProjectTextRole,
} from "../projects";

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
// Headings and labels take their face from the project (faceClass).
const roleClass: Record<ProjectTextRole, string> = {
  title: "mt-6 font-times text-[2rem] italic leading-[1.2]",
  heading: "mt-10 text-[1.375rem] leading-[1.2]",
  label: "mt-2 text-xs",
  body: "mb-2 max-w-[60ch] font-sans text-[0.9375rem] font-medium leading-[1.6]",
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

function fontOf(role: ProjectTextRole, italic: boolean, face: ProjectFace) {
  if (italic || role === "title") return "times";
  return role === "heading" || role === "label" ? face : "sans";
}

// From lg up a block sits where the PDF draws it: --x/--y/--w/--h are points, and --p is
// one point of the PDF page (set on the article).
const placed =
  "lg:absolute lg:left-[calc(var(--x)*var(--p))] lg:top-[calc(var(--y)*var(--p))]";
const sized = "lg:w-[calc(var(--w)*var(--p))] lg:h-[calc(var(--h)*var(--p))]";

function Block({
  block,
  pageWidth,
  face,
  first,
}: {
  block: ProjectBlock;
  pageWidth: number;
  face: ProjectFace;
  first: boolean;
}) {
  if (block.kind === "rule") {
    return (
      <div
        aria-hidden="true"
        className={`hidden bg-ink lg:block ${placed} ${sized}`}
        style={
          {
            "--x": block.x,
            "--y": block.y,
            "--w": block.w,
            "--h": block.h,
            ...(block.color && { backgroundColor: block.color }),
          } as CSSProperties
        }
      />
    );
  }

  if (block.kind === "image") {
    const stack = block.stack ?? "full";
    const share = ((block.w / pageWidth) * 100).toFixed(1);
    return (
      // justify-self-stretch: a grid item with an aspect ratio otherwise shrinks to its
      // content, and the image inside is absolutely positioned, so it would collapse.
      <div
        className={`relative justify-self-stretch ${stackClass[stack]} lg:m-0 ${placed} ${sized}`}
        style={
          {
            "--x": block.x,
            "--y": block.y,
            "--w": block.w,
            "--h": block.h,
            aspectRatio: `${block.w} / ${block.h}`,
          } as CSSProperties
        }
      >
        <Image
          src={block.src}
          alt={block.alt}
          fill
          sizes={`(min-width: 1024px) ${share}vw, ${stack === "half" ? 50 : 100}vw`}
          // The hero is the largest paint on arrival; everything else can wait.
          loading={first ? "eager" : "lazy"}
          fetchPriority={first ? "high" : "auto"}
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
  const firstFont = fontOf(block.role, isItalic(firstRun), face);
  const roleFace = block.role === "heading" || block.role === "label" ? faceClass[face] : "";

  return (
    // z-1: a line the PDF sets over a photo stays in front of it.
    <Tag
      className={`${roleClass[block.role]} ${roleFace} ${stackClass[block.stack ?? "full"]} lg:z-1 lg:m-0 lg:max-w-none lg:whitespace-nowrap lg:text-[length:calc(var(--size)*var(--p))] lg:leading-[1.2] ${placed}`}
      style={
        {
          "--x": block.x,
          "--y": block.baseline - baselineOffset[firstFont] * block.size,
          "--size": block.size,
          color: block.color,
        } as CSSProperties
      }
    >
      {block.lines.map((line, i) => {
        const runs = Array.isArray(line) ? line : [line];
        // Display lines always keep their own rows, and so does a blank line, which keeps
        // paragraphs apart. The rest only do from lg up and wrap freely below it.
        const lineClass = block.role === "display" || line === "" ? "block" : "lg:block";
        return (
          // Lines never reorder, and blank ones repeat, so the index is the identity.
          <span key={i}>
            {i > 0 && " "}
            <span className={lineClass}>
              {runs.map((run, j) =>
                isItalic(run) ? (
                  // Runs within a line never reorder either.
                  <span key={j} className="font-times font-normal italic">
                    {run.text}
                  </span>
                ) : (
                  run || " "
                )
              )}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}

// A project page, rebuilt from the designer's PDF (see projects.ts). From lg up it is the
// PDF page 1:1, scaled to the viewport's width. Below lg the same blocks stack in a
// two-column flow, since the PDF's 12pt type would be too small to read at that scale.
//
// Previous / next run in projects.ts order and wrap around. They sit in the SiteNav row, to
// skip ahead, and again in a pager after the page, where a reader lands.
export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();

  const project = projects[index];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const { page, blocks } = project;

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

      <article
        className="grid grid-cols-2 items-start gap-3 px-4 pb-20 sm:px-6 lg:relative lg:block lg:h-[calc(var(--page-h)*var(--p))] lg:p-0"
        style={
          {
            // Measured against the work layout's container, so it tracks the page width.
            "--p": `calc(100cqw / ${page.width})`,
            "--page-h": page.height,
          } as CSSProperties
        }
      >
        <h1 className="sr-only">{project.title}</h1>
        {blocks.map((block, i) => (
          <Block
            key={block.kind === "image" ? block.src : `${block.kind}-${i}`}
            block={block}
            pageWidth={page.width}
            face={project.face ?? "outfit"}
            first={i === 0}
          />
        ))}
      </article>

      <nav
        aria-label="More projects"
        className="mx-4 grid grid-cols-2 gap-6 border-t border-rule pb-16 pt-8 sm:mx-6 md:mx-[3.2vw] lg:mt-16"
      >
        {[
          { rel: "prev", project: prev, label: <>&larr; previous</>, align: "" },
          { rel: "next", project: next, label: <>next &rarr;</>, align: "justify-self-end text-right" },
        ].map(({ rel, project: neighbour, label, align }) => (
          <Link
            key={rel}
            href={projectHref(neighbour)}
            className={`group ${align}`}
          >
            <span className="label block text-ink/40 transition-colors [--label-size:12px] group-hover:text-ink">
              {label}
            </span>
            <span className="mt-3 block font-times text-[clamp(1.75rem,4vw,3rem)] italic leading-none transition-opacity group-hover:opacity-60">
              {neighbour.title}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
