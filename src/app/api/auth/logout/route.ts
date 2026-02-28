import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await deleteSession();

    // If called via fetch (AJAX), return JSON
    const accept = request.headers.get("accept") || "";
    if (accept.includes("application/json")) {
      return NextResponse.json({ success: true });
    }

    // If called via form submission, redirect to login page
    return NextResponse.redirect(new URL("/auth/login", request.url));
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Ошибка выхода" },
      { status: 500 }
    );
  }
}
