"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CANVAS_TYPES,
  ROOM_PRESETS,
  PROFILE_TYPES,
  SPOT_TYPES,
  CORNER_TYPES,
  CURTAIN_TYPES,
  DEFAULT_PRICES,
} from "@/lib/constants";
import { getDefaultCorners, validateLShape, validateTShape } from "@/lib/room-geometry";
import { RoomShapeSvg } from "./room-shape-svg";
import type { RoomInput, RoomShape } from "@/lib/types";
import type { CanvasType } from "@/lib/constants";

// Clear "0" on focus so user can type directly, restore "0" on blur if empty
function zeroFieldProps(value: string, setter: (v: string) => void) {
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setter(e.target.value),
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.value === "0") setter("");
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.value === "") setter("0");
    },
  };
}

interface RoomFormProps {
  onAdd: (room: RoomInput) => void;
  onCancel?: () => void;
  priceMap?: Record<string, number>;
}

function formatPriceCompact(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}к`;
  return String(n);
}

const SHAPE_OPTIONS: { value: RoomShape; label: string; icon: string }[] = [
  { value: "rectangle", label: "Прямоугольник", icon: "▭" },
  { value: "square", label: "Квадрат", icon: "□" },
  { value: "l-shape", label: "Г-образная", icon: "Г" },
  { value: "t-shape", label: "Т-образная", icon: "Т" },
];

export function RoomForm({ onAdd, onCancel, priceMap }: RoomFormProps) {
  const prices = priceMap ?? DEFAULT_PRICES;
  const [name, setName] = useState("");
  const [shape, setShape] = useState<RoomShape>("rectangle");

  // Rectangle/Square dims (cm)
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [side, setSide] = useState(""); // for square

  // L-shape dims (cm)
  const [lA, setLA] = useState("");
  const [lB, setLB] = useState("");
  const [lC, setLC] = useState("");
  const [lD, setLD] = useState("");

  // T-shape dims (cm)
  const [tA, setTA] = useState("");
  const [tB, setTB] = useState("");
  const [tC, setTC] = useState("");
  const [tD, setTD] = useState("");

  // Active side for SVG highlight
  const [activeSide, setActiveSide] = useState<"a" | "b" | "c" | "d" | null>(null);

  // Common fields
  const [ceilingHeight, setCeilingHeight] = useState("300");
  const [canvasType, setCanvasType] = useState<CanvasType>("mat");
  const [spotsCount, setSpotsCount] = useState("0");
  const [chandelierCount, setChandelierCount] = useState("0");
  const [cornersCount, setCornersCount] = useState("4");
  const [curtainRodLength, setCurtainRodLength] = useState("0");
  const [pipeBypasses, setPipeBypasses] = useState("0");
  const [shapeError, setShapeError] = useState<string | null>(null);

  // Component selection
  const [profileType, setProfileType] = useState("profile_insert");
  const [spotType, setSpotType] = useState("spot_ours");
  const [cornerType, setCornerType] = useState("corner_standard");
  const [curtainType, setCurtainType] = useState("curtain_ldsp");
  const [includeTransformer, setIncludeTransformer] = useState(true);

  function handleShapeChange(newShape: RoomShape) {
    setShape(newShape);
    setCornersCount(String(getDefaultCorners(newShape)));
    setShapeError(null);
  }

  function computePreview(): { area: number; perimeter: number } | null {
    if (shape === "rectangle") {
      const l = parseFloat(length);
      const w = parseFloat(width);
      if (!l || !w || l <= 0 || w <= 0) return null;
      return { area: (l * w) / 10000, perimeter: (2 * (l + w)) / 100 };
    }
    if (shape === "square") {
      const s = parseFloat(side);
      if (!s || s <= 0) return null;
      return { area: (s * s) / 10000, perimeter: (4 * s) / 100 };
    }
    if (shape === "l-shape") {
      const a = parseFloat(lA), b = parseFloat(lB), c = parseFloat(lC), d = parseFloat(lD);
      if (!a || !b || !c || !d) return null;
      if (a <= d || c <= b) return null;
      return {
        area: (a * b + d * (c - b)) / 10000,
        perimeter: (2 * (a + c)) / 100,
      };
    }
    if (shape === "t-shape") {
      const a = parseFloat(tA), b = parseFloat(tB), c = parseFloat(tC), d = parseFloat(tD);
      if (!a || !b || !c || !d) return null;
      if (a <= c) return null;
      return {
        area: (a * b + c * d) / 10000,
        perimeter: (2 * (a + b + d)) / 100,
      };
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShapeError(null);

    const heightM = (parseFloat(ceilingHeight) || 300) / 100;
    const curtainM = (parseFloat(curtainRodLength) || 0) / 100;

    let lengthM = 0;
    let widthM = 0;
    let roomShape: RoomShape = shape;
    let lShapeDims = undefined;
    let tShapeDims = undefined;

    if (shape === "rectangle") {
      lengthM = (parseFloat(length) || 0) / 100;
      widthM = (parseFloat(width) || 0) / 100;
      if (lengthM <= 0 || widthM <= 0) return;
    } else if (shape === "square") {
      const s = (parseFloat(side) || 0) / 100;
      if (s <= 0) return;
      lengthM = s;
      widthM = s;
    } else if (shape === "l-shape") {
      const dims = {
        a: (parseFloat(lA) || 0) / 100,
        b: (parseFloat(lB) || 0) / 100,
        c: (parseFloat(lC) || 0) / 100,
        d: (parseFloat(lD) || 0) / 100,
      };
      const err = validateLShape(dims);
      if (err) { setShapeError(err); return; }
      lShapeDims = dims;
      lengthM = dims.a; // bounding box width
      widthM = dims.c;  // bounding box height
    } else if (shape === "t-shape") {
      const dims = {
        a: (parseFloat(tA) || 0) / 100,
        b: (parseFloat(tB) || 0) / 100,
        c: (parseFloat(tC) || 0) / 100,
        d: (parseFloat(tD) || 0) / 100,
      };
      const err = validateTShape(dims);
      if (err) { setShapeError(err); return; }
      tShapeDims = dims;
      lengthM = dims.a;       // bounding box width
      widthM = dims.b + dims.d; // bounding box height
    }

    const room: RoomInput = {
      id: crypto.randomUUID(),
      name: name || "Комната",
      length: lengthM,
      width: widthM,
      ceilingHeight: heightM,
      canvasType,
      spotsCount: parseInt(spotsCount) || 0,
      chandelierCount: parseInt(chandelierCount) || 0,
      trackMagneticLength: 0,
      lightLineLength: 0,
      curtainRodLength: curtainM,
      pipeBypasses: parseInt(pipeBypasses) || 0,
      cornersCount: parseInt(cornersCount) || getDefaultCorners(roomShape),
      eurobrusCount: 0,
      shape: roomShape,
      lShapeDims,
      tShapeDims,
      profileType,
      spotType: (parseInt(spotsCount) || 0) > 0 ? spotType : undefined,
      cornerType,
      curtainType: curtainM > 0 ? curtainType : undefined,
      includeTransformer: (parseInt(chandelierCount) || 0) > 0 ? includeTransformer : undefined,
    };

    onAdd(room);

    // Reset
    setName("");
    setLength(""); setWidth(""); setSide("");
    setLA(""); setLB(""); setLC(""); setLD("");
    setTA(""); setTB(""); setTC(""); setTD("");
    setSpotsCount("0"); setChandelierCount("0");
    setCornersCount(String(getDefaultCorners(shape)));
    setCurtainRodLength("0"); setPipeBypasses("0");
    setShapeError(null); setActiveSide(null);
  }

  const preview = computePreview();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Room name presets */}
      <div className="space-y-2">
        <Label>Название комнаты</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {ROOM_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setName(preset)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                name === preset
                  ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                  : "hover:bg-muted border-border"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Или введите своё название"
        />
      </div>

      {/* Shape selector */}
      <div className="space-y-2">
        <Label>Форма комнаты</Label>
        <div className="grid grid-cols-4 gap-2">
          {SHAPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleShapeChange(opt.value)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-colors ${
                shape === opt.value
                  ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                  : "hover:bg-muted border-border"
              }`}
            >
              <span className="text-lg font-bold leading-none">{opt.icon}</span>
              <span className="leading-tight text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions based on shape */}
      {shape === "rectangle" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="length">Длина (см)</Label>
            <Input
              id="length"
              type="number"
              step="1"
              min="1"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="500"
              inputMode="numeric"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Ширина (см)</Label>
            <Input
              id="width"
              type="number"
              step="1"
              min="1"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="400"
              inputMode="numeric"
              required
            />
          </div>
        </div>
      )}

      {shape === "square" && (
        <div className="space-y-2">
          <Label htmlFor="side">Сторона (см)</Label>
          <Input
            id="side"
            type="number"
            step="1"
            min="1"
            value={side}
            onChange={(e) => setSide(e.target.value)}
            placeholder="400"
            inputMode="numeric"
            required
          />
        </div>
      )}

      {shape === "l-shape" && (
        <div className="space-y-3">
          <RoomShapeSvg shape="l-shape" dims={{ a: lA, b: lB, c: lC, d: lD }} activeSide={activeSide} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="lA" className="text-xs">A — ширина верха (см)</Label>
              <Input id="lA" type="number" step="1" min="1" value={lA}
                onChange={(e) => setLA(e.target.value)} placeholder="500" inputMode="numeric"
                onFocus={() => setActiveSide("a")} onBlur={() => setActiveSide(null)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lB" className="text-xs">B — высота правой (см)</Label>
              <Input id="lB" type="number" step="1" min="1" value={lB}
                onChange={(e) => setLB(e.target.value)} placeholder="200" inputMode="numeric"
                onFocus={() => setActiveSide("b")} onBlur={() => setActiveSide(null)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lC" className="text-xs">C — высота левой (см)</Label>
              <Input id="lC" type="number" step="1" min="1" value={lC}
                onChange={(e) => setLC(e.target.value)} placeholder="400" inputMode="numeric"
                onFocus={() => setActiveSide("c")} onBlur={() => setActiveSide(null)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lD" className="text-xs">D — ширина низа (см)</Label>
              <Input id="lD" type="number" step="1" min="1" value={lD}
                onChange={(e) => setLD(e.target.value)} placeholder="250" inputMode="numeric"
                onFocus={() => setActiveSide("d")} onBlur={() => setActiveSide(null)} required />
            </div>
          </div>
        </div>
      )}

      {shape === "t-shape" && (
        <div className="space-y-3">
          <RoomShapeSvg shape="t-shape" dims={{ a: tA, b: tB, c: tC, d: tD }} activeSide={activeSide} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tA" className="text-xs">A — ширина верха (см)</Label>
              <Input id="tA" type="number" step="1" min="1" value={tA}
                onChange={(e) => setTA(e.target.value)} placeholder="600" inputMode="numeric"
                onFocus={() => setActiveSide("a")} onBlur={() => setActiveSide(null)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tB" className="text-xs">B — высота верха (см)</Label>
              <Input id="tB" type="number" step="1" min="1" value={tB}
                onChange={(e) => setTB(e.target.value)} placeholder="150" inputMode="numeric"
                onFocus={() => setActiveSide("b")} onBlur={() => setActiveSide(null)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tC" className="text-xs">C — ширина ножки (см)</Label>
              <Input id="tC" type="number" step="1" min="1" value={tC}
                onChange={(e) => setTC(e.target.value)} placeholder="200" inputMode="numeric"
                onFocus={() => setActiveSide("c")} onBlur={() => setActiveSide(null)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tD" className="text-xs">D — высота ножки (см)</Label>
              <Input id="tD" type="number" step="1" min="1" value={tD}
                onChange={(e) => setTD(e.target.value)} placeholder="300" inputMode="numeric"
                onFocus={() => setActiveSide("d")} onBlur={() => setActiveSide(null)} required />
            </div>
          </div>
        </div>
      )}

      {/* Area/perimeter preview */}
      {preview && (
        <p className="text-sm text-muted-foreground">
          Площадь: {preview.area.toFixed(1)} м² | Периметр: {preview.perimeter.toFixed(1)} м.п.
        </p>
      )}

      {/* Shape validation error */}
      {shapeError && (
        <p className="text-sm text-destructive">{shapeError}</p>
      )}

      {/* Canvas type + height */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Тип потолка</Label>
          <Select value={canvasType} onValueChange={(v) => setCanvasType(v as CanvasType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CANVAS_TYPES.map((ct) => (
                <SelectItem key={ct.value} value={ct.value}>
                  {ct.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Высота (см)</Label>
          <Input
            id="height"
            type="number"
            step="1"
            min="200"
            value={ceilingHeight}
            onChange={(e) => setCeilingHeight(e.target.value)}
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Fixtures */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="spots">Споты</Label>
          <Input
            id="spots"
            type="number"
            min="0"
            {...zeroFieldProps(spotsCount, setSpotsCount)}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chandeliers">Люстры</Label>
          <Input
            id="chandeliers"
            type="number"
            min="0"
            {...zeroFieldProps(chandelierCount, setChandelierCount)}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="corners">Углы</Label>
          <Input
            id="corners"
            type="number"
            min="0"
            {...zeroFieldProps(cornersCount, setCornersCount)}
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="curtain">Карниз (см)</Label>
          <Input
            id="curtain"
            type="number"
            step="1"
            min="0"
            {...zeroFieldProps(curtainRodLength, setCurtainRodLength)}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pipes">Обход труб</Label>
          <Input
            id="pipes"
            type="number"
            min="0"
            {...zeroFieldProps(pipeBypasses, setPipeBypasses)}
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Component selection */}
      <div className="space-y-3 pt-2 border-t">
        <p className="text-sm font-medium text-muted-foreground">Комплектующие</p>

        {/* Profile type */}
        <div className="space-y-1.5">
          <Label className="text-xs">Профиль</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {PROFILE_TYPES.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => setProfileType(p.code)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors text-left ${
                  profileType === p.code
                    ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                    : "hover:bg-muted border-border"
                }`}
              >
                {p.label}
                <span className={`ml-1 ${profileType === p.code ? "text-white/70" : "text-muted-foreground"}`}>
                  {formatPriceCompact(prices[p.code] ?? 0)}₸
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Spot type — only if spots > 0 */}
        {parseInt(spotsCount) > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs">Тип спотов</Label>
            <div className="flex gap-1.5">
              {SPOT_TYPES.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setSpotType(s.code)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                    spotType === s.code
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                      : "hover:bg-muted border-border"
                  }`}
                >
                  {s.label}
                  <span className={`block ${spotType === s.code ? "text-white/70" : "text-muted-foreground"}`}>
                    {formatPriceCompact(prices[s.code] ?? 0)}₸/шт
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Corner type */}
        <div className="space-y-1.5">
          <Label className="text-xs">Углы</Label>
          <div className="flex gap-1.5">
            {CORNER_TYPES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCornerType(c.code)}
                className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  cornerType === c.code
                    ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                    : "hover:bg-muted border-border"
                }`}
              >
                {c.label}
                <span className={`ml-1 ${cornerType === c.code ? "text-white/70" : "text-muted-foreground"}`}>
                  {formatPriceCompact(prices[c.code] ?? 0)}₸
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Curtain type — only if curtain > 0 */}
        {parseFloat(curtainRodLength) > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs">Тип карниза</Label>
            <div className="flex gap-1.5">
              {CURTAIN_TYPES.map((ct) => (
                <button
                  key={ct.code}
                  type="button"
                  onClick={() => setCurtainType(ct.code)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                    curtainType === ct.code
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                      : "hover:bg-muted border-border"
                  }`}
                >
                  {ct.label}
                  <span className={`block ${curtainType === ct.code ? "text-white/70" : "text-muted-foreground"}`}>
                    {formatPriceCompact(prices[ct.code] ?? 0)}₸/м.п.
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Transformer checkbox — only if chandeliers > 0 */}
        {parseInt(chandelierCount) > 0 && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={includeTransformer}
              onChange={(e) => setIncludeTransformer(e.target.checked)}
              className="rounded border-border"
            />
            <span>Трансформатор</span>
            <span className="text-muted-foreground text-xs">
              {formatPriceCompact(prices["transformer"] ?? 0)}₸/шт
            </span>
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1 bg-[#1e3a5f] hover:bg-[#152d4a]">
          Добавить комнату
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
