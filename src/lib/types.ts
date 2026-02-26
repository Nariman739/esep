import type { CanvasType } from "./constants";

// ============================================
// Room Shapes
// ============================================

export type RoomShape = "rectangle" | "square" | "l-shape" | "t-shape";

export interface LShapeDimensions {
  a: number; // top width (meters)
  b: number; // right arm height (meters)
  c: number; // total left height (meters)
  d: number; // bottom width (meters)
}

export interface TShapeDimensions {
  a: number; // top width (meters)
  b: number; // top height (meters)
  c: number; // stem width (meters)
  d: number; // stem height (meters)
}

// ============================================
// Room Input
// ============================================

export interface RoomInput {
  id: string;
  name: string;
  length: number;
  width: number;
  ceilingHeight: number;
  canvasType: CanvasType;
  spotsCount: number;
  chandelierCount: number;
  trackMagneticLength: number;
  lightLineLength: number;
  curtainRodLength: number;
  pipeBypasses: number;
  cornersCount: number;
  eurobrusCount: number;
  shape?: RoomShape;
  lShapeDims?: LShapeDimensions;
  tShapeDims?: TShapeDimensions;
}

// ============================================
// Calculation Result
// ============================================

export interface LineItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface RoomVariant {
  roomId: string;
  roomName: string;
  area: number;
  perimeter: number;
  items: LineItem[];
  subtotal: number;
  heightMultiplied: boolean;
  subtotalAfterHeight: number;
}

export type VariantType = "economy" | "standard" | "premium";

export interface Variant {
  type: VariantType;
  label: string;
  rooms: RoomVariant[];
  subtotal: number;
  minOrderApplied: boolean;
  total: number;
  pricePerM2: number;
}

export interface CalculationResult {
  rooms: RoomInput[];
  variants: Variant[];
  totalArea: number;
  totalPerimeter: number;
  totalSpots: number;
  totalChandeliers: number;
  calculatedAt: string;
}

// ============================================
// Client Info
// ============================================

export interface ClientInfo {
  name?: string;
  phone?: string;
  address?: string;
}

// ============================================
// Chat / Assistant
// ============================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: string;
  quickActions?: QuickAction[];
  calculationResult?: CalculationResult;
}

export interface QuickAction {
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

// ============================================
// Master Profile
// ============================================

export interface MasterProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  companyName?: string | null;
  logoUrl?: string | null;
  brandColor: string;
  instagramUrl?: string | null;
  whatsappPhone?: string | null;
  address?: string | null;
  subscriptionTier: "FREE" | "PRO";
  kpGeneratedThisMonth: number;
  telegramChatId?: string | null;
}
