"use client";

import React, { useEffect, useRef, useState } from "react";
import { WARP_LOOP } from "./magnifyTextLoop";

interface MagnifyTextProps {
  text: string;
  className?: string;
  /** Fallback size in px. Omit to size the text from `className` instead. */
  baseFontSize?: number;
  /** Background color of the container. Defaults to transparent, so the page shows through. */
  backgroundColor?: string;
}

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Each output pixel samples the text at p + d, where d comes from the current frame of the
// warp loop: a coarse displacement grid laid over the word's ink box, in ink-box units, so
// the same loop fits any size. Linear filtering on the grid keeps the warp smooth between
// its nodes; the grid's own edges are zero, so clamping past them leaves the text at rest.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTex;
uniform sampler2D uWarp;
uniform vec2 uSize;
uniform vec4 uInk;
uniform vec4 uGrid;
uniform vec2 uGridN;
void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec2 g = ((p - uInk.xy) / uInk.zw - uGrid.xy) / (uGrid.zw - uGrid.xy);
  vec2 d = texture(uWarp, (g * (uGridN - 1.0) + 0.5) / uGridN).rg * uInk.zw;
  vec2 uv = (p + d) / uSize;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    outColor = vec4(0.0);
    return;
  }
  outColor = texture(uTex, uv);
}`;

// Longest reach of the loop outside the word's ink box, as a multiple of its height.
const PAD = 0.6;

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

/** Base64 of signed little-endian integers, `bytes` wide, back to floats times `scale`. */
function decode(base64: string, bytes: 1 | 2, scale: number) {
  const raw = atob(base64);
  const out = new Float32Array(raw.length / bytes);
  const shift = 32 - 8 * bytes;
  for (let i = 0; i < out.length; i++) {
    let v = 0;
    for (let b = 0; b < bytes; b++) v |= raw.charCodeAt(i * bytes + b) << (8 * b);
    out[i] = ((v << shift) >> shift) * scale;
  }
  return out;
}

export const MagnifyText: React.FC<MagnifyTextProps> = ({
  text,
  className = "",
  baseFontSize,
  backgroundColor = "transparent",
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
    gl.activeTexture(gl.TEXTURE0);
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

    // The loop is stored as a few spatial modes and a weight per mode per frame, so a frame's
    // displacement grid is a weighted sum of the modes. Rebuilt on the CPU every frame and
    // uploaded as a tiny half-float texture.
    const { cols, rows, bounds, modes, fps, frames } = WARP_LOOP;
    const modeData = modes.map((m) => decode(m.data, 1, m.scale));
    const weights = modes.map((m) => decode(m.weights, 2, m.weightScale));
    const field = new Float32Array(cols * rows * 2);

    const warp = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, warp);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RG16F,
      cols,
      rows,
      0,
      gl.RG,
      gl.FLOAT,
      field
    );
    gl.activeTexture(gl.TEXTURE0);

    gl.useProgram(program);
    const uSize = gl.getUniformLocation(program, "uSize");
    const uInk = gl.getUniformLocation(program, "uInk");
    gl.uniform1i(gl.getUniformLocation(program, "uTex"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "uWarp"), 1);
    gl.uniform4f(
      gl.getUniformLocation(program, "uGrid"),
      bounds[0],
      bounds[1],
      bounds[2],
      bounds[3]
    );
    gl.uniform2f(gl.getUniformLocation(program, "uGridN"), cols, rows);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const raster = document.createElement("canvas");
    const ctx = raster.getContext("2d");
    if (!ctx) return;

    // Canvas-local geometry, all in CSS px. `pad` gives warped ink somewhere to land once
    // the loop drags it outside the text's own box.
    let cssW = 0;
    let cssH = 0;
    const ink = { x: 0, y: 0, w: 1, h: 1 };

    const layout = () => {
      const spanRect = span.getBoundingClientRect();
      const cs = getComputedStyle(span);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = cs.letterSpacing;
      const m = ctx.measureText(text);
      ink.w = Math.max(1, m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
      ink.h = Math.max(1, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);

      const pad = ink.h * PAD;
      cssW = Math.max(1, Math.ceil(spanRect.width + pad * 2));
      cssH = Math.max(1, Math.ceil(spanRect.height + pad * 2));
      // Centre the ink box rather than the em box, so the drawn word lands where the
      // span's glyphs are regardless of line-height.
      ink.x = (cssW - ink.w) / 2;
      ink.y = (cssH - ink.h) / 2;

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      // The loop stretches glyphs a few times over at its peak, so supersample a little;
      // capped to keep the raster's memory reasonable on retina screens.
      const rasterScale = Math.min(dpr * 1.5, 2);
      raster.width = Math.round(cssW * rasterScale);
      raster.height = Math.round(cssH * rasterScale);

      // Resizing the raster resets its context state, so set the font again.
      ctx.setTransform(rasterScale, 0, 0, rasterScale, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = cs.letterSpacing;
      ctx.fillStyle = cs.color;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(
        text,
        ink.x + m.actualBoundingBoxLeft,
        ink.y + m.actualBoundingBoxAscent
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
    };

    // Rebuild the displacement grid for a point in the loop, in frames of the source video.
    const setFrame = (f: number) => {
      field.fill(0);
      if (f < frames - 1) {
        const i = Math.floor(f);
        const t = f - i;
        for (let k = 0; k < modeData.length; k++) {
          const w = weights[k][i] * (1 - t) + weights[k][i + 1] * t;
          if (w === 0) continue;
          const mode = modeData[k];
          for (let j = 0; j < field.length; j++) field[j] += w * mode[j];
        }
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        cols,
        rows,
        gl.RG,
        gl.FLOAT,
        field
      );
      gl.activeTexture(gl.TEXTURE0);
    };

    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uSize, cssW, cssH);
      gl.uniform4f(uInk, ink.x, ink.y, ink.w, ink.h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Elapsed time only advances while the word is on screen, so the loop picks up where it
    // left off instead of jumping. Long gaps between frames are clamped for the same reason.
    let elapsed = 0;
    let last = 0;
    let frame = 0;
    let visible = true;

    const tick = (now: number) => {
      frame = 0;
      if (last) elapsed += Math.min(now - last, 100);
      last = now;
      setFrame(((elapsed / 1000) * fps) % frames);
      draw();
      if (visible) frame = requestAnimationFrame(tick);
    };

    const play = () => {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
    });

    const observer = new ResizeObserver(() => {
      layout();
      draw();
    });

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      layout();
      setFrame(0);
      draw();
      setActive(true);
      observer.observe(span);
      onScreen.observe(wrap);
      play();
    };

    // Without this the texture bakes the fallback font instead of the loaded webfont.
    if (document.fonts?.status === "loaded") start();
    else void document.fonts.ready.then(start);

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      onScreen.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(texture);
      gl.deleteTexture(warp);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      setActive(false);
    };
    // `className` carries the font, size and colour the raster is baked from, so a change
    // to it has to re-run `layout()` — otherwise the texture keeps the previous type.
  }, [text, className, baseFontSize]);

  return (
    <div
      ref={wrapRef}
      className="relative inline-block select-none"
      style={{ backgroundColor }}
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
