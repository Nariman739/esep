import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const master = await requireAuth();

    const sessions = await prisma.chatSession.findMany({
      where: { masterId: master.id, status: { not: "ABANDONED" } },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: {
        id: true,
        messages: true,
        estimateId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        estimate: {
          select: { clientName: true, total: true, standardTotal: true },
        },
      },
    });

    const result = sessions.map((s) => {
      const msgs = (s.messages as Array<{ role: string; content: string }>) ?? [];
      const firstUserMsg = msgs.find((m) => m.role === "user");
      const preview = firstUserMsg?.content?.slice(0, 60) ?? "Сессия";

      return {
        id: s.id,
        preview,
        messageCount: msgs.length,
        estimateId: s.estimateId,
        clientName: s.estimate?.clientName ?? null,
        status: s.status,
        updatedAt: s.updatedAt,
      };
    });

    return Response.json(result);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
