import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const master = await requireAuth();
    const { id } = await params;

    const session = await prisma.chatSession.findFirst({
      where: { id, masterId: master.id },
      select: {
        id: true,
        messages: true,
        extractedRooms: true,
        calculationData: true,
        estimateId: true,
        status: true,
      },
    });

    if (!session) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(session);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
