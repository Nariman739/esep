import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const raw = process.env.DATABASE_URL!;
  // Extract just the URL part in case Vercel value includes the key name as prefix
  const extracted = raw.match(/postgres(?:ql)?:\/\/.+/s)?.[0] ?? raw;
  const url = extracted
    .replace("postgresql://", "postgres://")
    .replace("&channel_binding=require", "")
    .replace("?channel_binding=require", "")
    .trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeonHttp(url, {} as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
