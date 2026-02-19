import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    let userId: string | undefined;

    // Prefer JSON body, but fall back to search params if body is empty
    try {
      const body = await request.json();
      userId = body?.userId;
    } catch (err) {
      // ignore body parse errors, we'll check search params next
    }

    if (!userId) {
      const url = new URL(request.url);
      userId = url.searchParams.get("userId") ?? undefined;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        hours: true,
        receiveTickets: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
