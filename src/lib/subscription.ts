import { prisma } from "./prisma";

// Лимиты по тарифам
const PLAN_LIMITS = {
  FREE: { docsPerMonth: 3, aiParsing: false, excelExport: false },
  PRO: { docsPerMonth: Infinity, aiParsing: true, excelExport: true },
  PRO_ACCOUNTANT: { docsPerMonth: Infinity, aiParsing: true, excelExport: true },
} as const;

// Цены (тенге)
export const PLAN_PRICES = {
  FREE: 0,
  PRO: 2990,
  PRO_ACCOUNTANT: 9990,
} as const;

export const PLAN_NAMES = {
  FREE: "Бесплатный",
  PRO: "Про",
  PRO_ACCOUNTANT: "Про + Бухгалтер",
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export async function getUserSubscription(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  // Если подписки нет — создаём бесплатную
  if (!sub) {
    return prisma.subscription.create({
      data: { userId, plan: "FREE", status: "ACTIVE" },
    });
  }

  // Если платная подписка истекла — переводим на FREE
  if (sub.plan !== "FREE" && sub.expiresAt && sub.expiresAt < new Date()) {
    return prisma.subscription.update({
      where: { id: sub.id },
      data: { plan: "FREE", status: "EXPIRED", expiresAt: null },
    });
  }

  return sub;
}

export async function checkDocumentLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: PlanType;
}> {
  const sub = await getUserSubscription(userId);
  const plan = sub.plan as PlanType;
  const limits = PLAN_LIMITS[plan];

  if (limits.docsPerMonth === Infinity) {
    return { allowed: true, used: 0, limit: Infinity, plan };
  }

  // Считаем документы за текущий месяц
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = await prisma.document.count({
    where: { userId, createdAt: { gte: monthStart } },
  });

  return {
    allowed: used < limits.docsPerMonth,
    used,
    limit: limits.docsPerMonth,
    plan,
  };
}

export function getPlanFeatures(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

export async function activateSubscription(
  userId: string,
  plan: PlanType,
  paymentId?: string
) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  return prisma.subscription.upsert({
    where: { userId },
    update: { plan, status: "ACTIVE", expiresAt },
    create: { userId, plan, status: "ACTIVE", expiresAt },
  });
}
