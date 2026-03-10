import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const raw = process.env.DATABASE_URL ?? "";
  // Find postgres:// or postgresql:// anywhere in the string
  const idx = raw.search(/postgres(?:ql)?:\/\//);
  const extracted = idx >= 0 ? raw.slice(idx) : raw;
  const url = extracted
    .replace("postgresql://", "postgres://")
    .replace(/[?&]channel_binding=require/g, "")
    .trim();
  console.log("PRISMA URL:", url.substring(0, 50) + "...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeonHttp(url, {} as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
