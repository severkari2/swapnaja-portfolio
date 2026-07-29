"use client";

import React, { useEffect, useRef, useState } from "react";

interface MagnifyTextProps {
  text: string;
  className?: string;
  /** Fallback size in px. Omit to size the text from `className` instead. */
  baseFontSize?: number;
  /** Influence radius of the pointer, as a multiple of the font size. */
  radiusScale?: number;
  /** Magnification at the pointer, 0..1. */
  bulge?: number;
}

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Two superimposed displacements inside a smooth bump `w` around the pointer:
//   - a radial magnification (uBulge), which enlarges glyphs near the pointer;
//   - a translation along the pointer's recent motion (uDrag), which smears them.
// Because both vary continuously across a glyph, straight stems bow and strokes taper —
// the non-affine part of the reference that CSS transforms cannot reproduce. The bump is
// C1 at its edge so the warp never folds, which would show up as streaking artifacts.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTex;
uniform vec2 uSize;
uniform vec2 uPointer;
uniform vec2 uDrag;
uniform float uRadius;
uniform float uBulge;
void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec2 d = p - uPointer;
  float u = clamp(length(d) / uRadius, 0.0, 1.0);
  float w = 1.0 - u * u;
  w = w * w * w;
  vec2 uv = (uPointer + d * max(1.0 - uBulge * w, 0.05) - uDrag * w) / uSize;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    outColor = vec4(0.0);
    return;
  }
  outColor = texture(uTex, uv);
}`;

// Damping, normalised to 60fps frames. The reference clip settles back to a clean word
// roughly 0.9s after the pointer stops, which DRAG_DECAY reproduces (0.9^54 ≈ 0.003).
const POINTER_EASE = 0.2;
const DRAG_DECAY = 0.9;
// Chosen so a sustained pointer speed v settles at a smear of v * 0.5s, tuned against
// the bend depth of the `ll` stems in reference frames 22 and 32.
const DRAG_KICK = 3;
/** Smear ceiling, as a multiple of the font size, so fast flicks stay legible. */
const DRAG_MAX = 1.2;
const SETTLED = 0.002;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export const MagnifyText: React.FC<MagnifyTextProps> = ({
  text,
  className = "",
  baseFontSize,
  radiusScale = 2.25,
  bulge = 0.55,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const span = spanRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !span || !canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = vs && fs ? gl.createProgram() : null;
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    gl.useProgram(program);
    const uSize = gl.getUniformLocation(program, "uSize");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uDrag = gl.getUniformLocation(program, "uDrag");
    const uRadius = gl.getUniformLocation(program, "uRadius");
    const uBulge = gl.getUniformLocation(program, "uBulge");
    gl.uniform1i(gl.getUniformLocation(program, "uTex"), 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const raster = document.createElement("canvas");
    const ctx = raster.getContext("2d");
    if (!ctx) return;

    // Canvas-local geometry, all in CSS px. `pad` gives warped ink somewhere to land
    // once it is dragged outside the text's own box.
    let cssW = 0;
    let cssH = 0;
    let pad = 0;
    let radius = 0;
    let dragMax = 0;
    let rect = canvas.getBoundingClientRect();

    // `raw` is the latest input; `eased` trails it, `moved` accumulates pointer travel
    // since the last frame, and `drag` is the decaying smear built from that travel.
    const raw = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const moved = { x: 0, y: 0 };
    const drag = { x: 0, y: 0 };
    let seeded = false;
    let last = 0;

    let frame = 0;
    let disposed = false;

    const layout = () => {
      const spanRect = span.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(span).fontSize) || 16;
      radius = fontSize * radiusScale;
      dragMax = fontSize * DRAG_MAX;
      // Ink never travels the full influence radius, so the canvas needs less padding
      // than that — otherwise the raster gets needlessly huge at display sizes.
      pad = radius * 0.45 + dragMax;
      cssW = Math.max(1, Math.ceil(spanRect.width + pad * 2));
      cssH = Math.max(1, Math.ceil(spanRect.height + pad * 2));

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      // The warp magnifies by ~1.4x at most, so a modest supersample keeps edges crisp
      // without the memory cost of rasterising at a naive multiple of a retina dpr.
      const rasterScale = Math.min(dpr * 1.5, 2);
      raster.width = Math.round(cssW * rasterScale);
      raster.height = Math.round(cssH * rasterScale);

      const cs = getComputedStyle(span);
      ctx.setTransform(rasterScale, 0, 0, rasterScale, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = cs.letterSpacing;
      ctx.fillStyle = cs.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      // Centre the ink box rather than the em box, so the drawn word lands where the
      // span's glyphs are regardless of line-height.
      const m = ctx.measureText(text);
      const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      ctx.fillText(
        text,
        (cssW - inkW) / 2 + m.actualBoundingBoxLeft,
        (cssH - inkH) / 2 + m.actualBoundingBoxAscent
      );

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        raster
      );
      gl.generateMipmap(gl.TEXTURE_2D);

      rect = canvas.getBoundingClientRect();
      if (!seeded) {
        eased.x = cssW / 2;
        eased.y = cssH / 2;
        raw.x = eased.x;
        raw.y = eased.y;
      }
    };

    const draw = (mag: number) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uSize, cssW, cssH);
      gl.uniform2f(uPointer, eased.x, eased.y);
      gl.uniform2f(uDrag, drag.x, drag.y);
      gl.uniform1f(uRadius, Math.max(1, radius));
      // The magnification is gated on how hard the word is currently being dragged, so a
      // pointer resting near it leaves the word completely undistorted — the clean rest
      // state the reference holds for its last 1.3s.
      gl.uniform1f(uBulge, bulge * Math.min(1, mag / (dragMax * 0.5)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      frame = 0;
      // Normalise the damping to 60fps frames so the settle time is refresh-independent.
      const step = last ? Math.min(((now - last) / 1000) * 60, 3) : 1;
      last = now;

      eased.x += (raw.x - eased.x) * POINTER_EASE * step;
      eased.y += (raw.y - eased.y) * POINTER_EASE * step;

      const decay = Math.pow(DRAG_DECAY, step);
      drag.x = drag.x * decay + moved.x * DRAG_KICK;
      drag.y = drag.y * decay + moved.y * DRAG_KICK;
      moved.x = 0;
      moved.y = 0;
      let mag = Math.hypot(drag.x, drag.y);
      if (mag > dragMax) {
        drag.x *= dragMax / mag;
        drag.y *= dragMax / mag;
        mag = dragMax;
      }

      const settled =
        mag < SETTLED * dragMax &&
        Math.abs(raw.x - eased.x) < 0.5 &&
        Math.abs(raw.y - eased.y) < 0.5;
      if (settled) {
        eased.x = raw.x;
        eased.y = raw.y;
        drag.x = 0;
        drag.y = 0;
        mag = 0;
        last = 0;
      }
      draw(mag);
      if (!settled) frame = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!disposed && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (seeded) {
        moved.x += x - raw.x;
        moved.y += y - raw.y;
      } else {
        seeded = true;
        eased.x = x;
        eased.y = y;
      }
      raw.x = x;
      raw.y = y;
      schedule();
    };

    const onViewportChange = () => {
      rect = canvas.getBoundingClientRect();
    };

    const observer = new ResizeObserver(() => {
      layout();
      schedule();
    });

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      layout();
      draw(0);
      setActive(true);
      observer.observe(span);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("scroll", onViewportChange, { passive: true });
      window.addEventListener("resize", onViewportChange);
    };

    // Without this the texture bakes the fallback font instead of the loaded webfont.
    if (document.fonts?.status === "loaded") start();
    else void document.fonts.ready.then(start);

    return () => {
      disposed = true;
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(texture);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      setActive(false);
    };
  }, [text, baseFontSize, radiusScale, bulge]);

  return (
    <div
      ref={wrapRef}
      className="relative inline-block cursor-default select-none"
    >
      <span
        ref={spanRef}
        className={`inline-block leading-none ${className}`}
        style={{
          fontSize: baseFontSize ? `${baseFontSize}px` : undefined,
          opacity: active ? 0 : 1,
        }}
      >
        {text}
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ opacity: active ? 1 : 0 }}
      />
    </div>
  );
};
