import type {
  RoomInput,
  RoomShape,
  LShapeDimensions,
  TShapeDimensions,
} from "./types";

export function getRoomShape(room: RoomInput): RoomShape {
  return room.shape || "rectangle";
}

/** Area in m² based on room shape */
export function computeArea(room: RoomInput): number {
  const shape = getRoomShape(room);

  if (shape === "l-shape" && room.lShapeDims) {
    const { a, b, c, d } = room.lShapeDims;
    return a * b + d * (c - b);
  }

  if (shape === "t-shape" && room.tShapeDims) {
    const { a, b, c, d } = room.tShapeDims;
    return a * b + c * d;
  }

  return room.length * room.width;
}

/** Perimeter in meters based on room shape */
export function computePerimeter(room: RoomInput): number {
  const shape = getRoomShape(room);

  if (shape === "l-shape" && room.lShapeDims) {
    const { a, c } = room.lShapeDims;
    return 2 * (a + c);
  }

  if (shape === "t-shape" && room.tShapeDims) {
    const { a, b, d } = room.tShapeDims;
    return 2 * (a + b + d);
  }

  return 2 * (room.length + room.width);
}

/** Min bounding box dimension for canvas roll selection */
export function getBoundingBoxMinDim(room: RoomInput): number {
  const shape = getRoomShape(room);

  if (shape === "l-shape" && room.lShapeDims) {
    const { a, c } = room.lShapeDims;
    return Math.min(a, c);
  }

  if (shape === "t-shape" && room.tShapeDims) {
    const { a, b, d } = room.tShapeDims;
    return Math.min(a, b + d);
  }

  return Math.min(room.length, room.width);
}

/** Default corner count per shape */
export function getDefaultCorners(shape: RoomShape): number {
  switch (shape) {
    case "l-shape":
      return 6;
    case "t-shape":
      return 8;
    default:
      return 4;
  }
}

/** Validate L-shape: a > d, c > b, all positive */
export function validateLShape(dims: LShapeDimensions): string | null {
  if (dims.a <= 0 || dims.b <= 0 || dims.c <= 0 || dims.d <= 0)
    return "Все размеры должны быть больше 0";
  if (dims.a <= dims.d)
    return "Верхняя ширина должна быть больше нижней";
  if (dims.c <= dims.b)
    return "Левая высота должна быть больше правой";
  return null;
}

/** Validate T-shape: a > c, all positive */
export function validateTShape(dims: TShapeDimensions): string | null {
  if (dims.a <= 0 || dims.b <= 0 || dims.c <= 0 || dims.d <= 0)
    return "Все размеры должны быть больше 0";
  if (dims.a <= dims.c)
    return "Ширина верха должна быть больше ширины ножки";
  return null;
}
