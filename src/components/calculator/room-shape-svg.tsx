"use client";

interface RoomShapeSvgProps {
  shape: "l-shape" | "t-shape";
  dims: { a: string; b: string; c: string; d: string };
  activeSide?: "a" | "b" | "c" | "d" | null;
}

const ACTIVE_COLOR = "#F97316"; // orange
const DEFAULT_COLOR = "#1e3a5f";
const FILL_COLOR = "#1e3a5f";
const LABEL_SIZE = 11;

function dimLabel(val: string, suffix = " см"): string {
  const n = parseFloat(val);
  if (!n || n <= 0) return "?";
  return `${n}${suffix}`;
}

export function RoomShapeSvg({ shape, dims, activeSide }: RoomShapeSvgProps) {
  const a = parseFloat(dims.a) || 100;
  const b = parseFloat(dims.b) || 40;
  const c = parseFloat(dims.c) || (shape === "l-shape" ? 80 : 40);
  const d = parseFloat(dims.d) || (shape === "l-shape" ? 40 : 60);

  if (shape === "l-shape") return renderLShape(a, b, c, d, dims, activeSide);
  return renderTShape(a, b, c, d, dims, activeSide);
}

function sideColor(side: string, activeSide?: string | null): string {
  return side === activeSide ? ACTIVE_COLOR : DEFAULT_COLOR;
}

function renderLShape(
  a: number, b: number, c: number, d: number,
  dims: { a: string; b: string; c: string; d: string },
  activeSide?: string | null
) {
  // Normalize to fit in viewBox with padding
  const maxDim = Math.max(a, c);
  const scale = 140 / maxDim;
  const sa = a * scale;
  const sb = b * scale;
  const sc = c * scale;
  const sd = d * scale;
  const ox = 30; // offset x
  const oy = 20; // offset y

  // L-shape path (clockwise from top-left)
  const points = [
    [ox, oy],                    // top-left
    [ox + sa, oy],               // top-right
    [ox + sa, oy + sb],          // right step
    [ox + sd, oy + sb],          // inner corner
    [ox + sd, oy + sc],          // bottom-right
    [ox, oy + sc],               // bottom-left
  ];

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] h-auto mx-auto">
      <path d={path} fill={FILL_COLOR} fillOpacity={0.08} stroke={DEFAULT_COLOR} strokeWidth={1.5} />

      {/* Side A - top */}
      <line x1={ox} y1={oy} x2={ox + sa} y2={oy}
        stroke={sideColor("a", activeSide)} strokeWidth={activeSide === "a" ? 3 : 1.5} />
      <text x={ox + sa / 2} y={oy - 6} textAnchor="middle" fontSize={LABEL_SIZE}
        fill={sideColor("a", activeSide)} fontWeight={activeSide === "a" ? 700 : 500}>
        {dimLabel(dims.a)}
      </text>

      {/* Side B - right arm */}
      <line x1={ox + sa} y1={oy} x2={ox + sa} y2={oy + sb}
        stroke={sideColor("b", activeSide)} strokeWidth={activeSide === "b" ? 3 : 1.5} />
      <text x={ox + sa + 8} y={oy + sb / 2 + 4} textAnchor="start" fontSize={LABEL_SIZE}
        fill={sideColor("b", activeSide)} fontWeight={activeSide === "b" ? 700 : 500}>
        {dimLabel(dims.b)}
      </text>

      {/* Side C - left full height */}
      <line x1={ox} y1={oy} x2={ox} y2={oy + sc}
        stroke={sideColor("c", activeSide)} strokeWidth={activeSide === "c" ? 3 : 1.5} />
      <text x={ox - 8} y={oy + sc / 2 + 4} textAnchor="end" fontSize={LABEL_SIZE}
        fill={sideColor("c", activeSide)} fontWeight={activeSide === "c" ? 700 : 500}>
        {dimLabel(dims.c)}
      </text>

      {/* Side D - bottom width */}
      <line x1={ox} y1={oy + sc} x2={ox + sd} y2={oy + sc}
        stroke={sideColor("d", activeSide)} strokeWidth={activeSide === "d" ? 3 : 1.5} />
      <text x={ox + sd / 2} y={oy + sc + 14} textAnchor="middle" fontSize={LABEL_SIZE}
        fill={sideColor("d", activeSide)} fontWeight={activeSide === "d" ? 700 : 500}>
        {dimLabel(dims.d)}
      </text>

      {/* Inner dashed lines */}
      <line x1={ox + sd} y1={oy + sb} x2={ox + sd} y2={oy + sc}
        stroke={DEFAULT_COLOR} strokeWidth={0.5} strokeDasharray="3 2" />
      <line x1={ox + sd} y1={oy + sb} x2={ox + sa} y2={oy + sb}
        stroke={DEFAULT_COLOR} strokeWidth={0.5} strokeDasharray="3 2" />
    </svg>
  );
}

function renderTShape(
  a: number, b: number, c: number, d: number,
  dims: { a: string; b: string; c: string; d: string },
  activeSide?: string | null
) {
  const totalH = b + d;
  const maxDim = Math.max(a, totalH);
  const scale = 140 / maxDim;
  const sa = a * scale;
  const sb = b * scale;
  const sc = c * scale;
  const sd = d * scale;
  const ox = 30;
  const oy = 20;
  const stemOffset = (sa - sc) / 2; // centered stem

  // T-shape path (clockwise from top-left)
  const points = [
    [ox, oy],                              // top-left
    [ox + sa, oy],                         // top-right
    [ox + sa, oy + sb],                    // right of top bar
    [ox + stemOffset + sc, oy + sb],       // inner right
    [ox + stemOffset + sc, oy + sb + sd],  // bottom-right of stem
    [ox + stemOffset, oy + sb + sd],       // bottom-left of stem
    [ox + stemOffset, oy + sb],            // inner left
    [ox, oy + sb],                         // left of top bar
  ];

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] h-auto mx-auto">
      <path d={path} fill={FILL_COLOR} fillOpacity={0.08} stroke={DEFAULT_COLOR} strokeWidth={1.5} />

      {/* Side A - top */}
      <line x1={ox} y1={oy} x2={ox + sa} y2={oy}
        stroke={sideColor("a", activeSide)} strokeWidth={activeSide === "a" ? 3 : 1.5} />
      <text x={ox + sa / 2} y={oy - 6} textAnchor="middle" fontSize={LABEL_SIZE}
        fill={sideColor("a", activeSide)} fontWeight={activeSide === "a" ? 700 : 500}>
        {dimLabel(dims.a)}
      </text>

      {/* Side B - top bar height (left side) */}
      <line x1={ox} y1={oy} x2={ox} y2={oy + sb}
        stroke={sideColor("b", activeSide)} strokeWidth={activeSide === "b" ? 3 : 1.5} />
      <text x={ox - 8} y={oy + sb / 2 + 4} textAnchor="end" fontSize={LABEL_SIZE}
        fill={sideColor("b", activeSide)} fontWeight={activeSide === "b" ? 700 : 500}>
        {dimLabel(dims.b)}
      </text>

      {/* Side C - stem width (bottom) */}
      <line x1={ox + stemOffset} y1={oy + sb + sd} x2={ox + stemOffset + sc} y2={oy + sb + sd}
        stroke={sideColor("c", activeSide)} strokeWidth={activeSide === "c" ? 3 : 1.5} />
      <text x={ox + sa / 2} y={oy + sb + sd + 14} textAnchor="middle" fontSize={LABEL_SIZE}
        fill={sideColor("c", activeSide)} fontWeight={activeSide === "c" ? 700 : 500}>
        {dimLabel(dims.c)}
      </text>

      {/* Side D - stem height (right side of stem) */}
      <line x1={ox + stemOffset + sc} y1={oy + sb} x2={ox + stemOffset + sc} y2={oy + sb + sd}
        stroke={sideColor("d", activeSide)} strokeWidth={activeSide === "d" ? 3 : 1.5} />
      <text x={ox + stemOffset + sc + 8} y={oy + sb + sd / 2 + 4} textAnchor="start" fontSize={LABEL_SIZE}
        fill={sideColor("d", activeSide)} fontWeight={activeSide === "d" ? 700 : 500}>
        {dimLabel(dims.d)}
      </text>

      {/* Inner dashed lines */}
      <line x1={ox} y1={oy + sb} x2={ox + stemOffset} y2={oy + sb}
        stroke={DEFAULT_COLOR} strokeWidth={0.5} strokeDasharray="3 2" />
      <line x1={ox + stemOffset + sc} y1={oy + sb} x2={ox + sa} y2={oy + sb}
        stroke={DEFAULT_COLOR} strokeWidth={0.5} strokeDasharray="3 2" />
    </svg>
  );
}
