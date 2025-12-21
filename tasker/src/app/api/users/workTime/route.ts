import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, from, to } = body;
    if (!userId || !from || !to) {
      return NextResponse.json(
        { success: false, message: "userId, from, and to are required" },
        { status: 400 }
      );
    }
    const sessions = await prisma.workSession.findMany({
      where: {
        userId,
        startedAt: { gte: new Date(from) },
        endedAt: { lte: new Date(to) },
      },
      orderBy: { startedAt: "asc" },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        time: true,
      },
    });
    // Calculate total time in seconds
    const totalSeconds = sessions.reduce((sum, s) => sum + (s.time || 0), 0);
    return NextResponse.json({ success: true, sessions, totalSeconds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching work time:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
