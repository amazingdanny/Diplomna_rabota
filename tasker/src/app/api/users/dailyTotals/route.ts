import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    
    const sessions = await prisma.workSession.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        time: true, // stored duration in minutes
      },
    });

    // Calculate daily totals
    const dailyTotals: { [date: string]: number } = {};

    sessions.forEach((session) => {
      const start = session.startedAt;
      const dateKey = start.toISOString().split('T')[0];

      // Use stored session.time (minutes) if available, otherwise compute from timestamps.
      const durationMinutes = typeof session.time === "number" && !Number.isNaN(session.time)
        ? session.time
        : ((session.endedAt || new Date()).getTime() - start.getTime()) / (1000 * 60 );

        const durationHours = durationMinutes / 60;

      if (dailyTotals[dateKey]) {
        dailyTotals[dateKey] += durationHours;
      } else {
        dailyTotals[dateKey] = durationHours;
      }
    });

    return NextResponse.json(
      { success: true, dailyTotals },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching daily totals:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
        