import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const master = await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Только изображения" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Максимальный размер 10MB" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `assistant/${master.id}/${sessionId || "unsorted"}/${timestamp}.${ext}`;

    const blob = await put(path, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки" },
      { status: 500 }
    );
  }
}
