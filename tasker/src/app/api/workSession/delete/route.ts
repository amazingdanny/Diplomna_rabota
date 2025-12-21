import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await prisma.workSession.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { currentSessionId: true },
    });

    if (user?.currentSessionId === sessionId) {
      return NextResponse.json(
        { success: false, message: "Cannot delete an active session" },
        { status: 400 }
      );
    }

    // Deleting the session also removes it from the user's workSessions relation.
    await prisma.workSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json(
      { success: true, message: "Work session deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting work session:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}