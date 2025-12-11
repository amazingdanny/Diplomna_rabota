import { NextResponse } from "next/server";
import {prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, currentSessionId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    if (!currentSessionId) {
      return NextResponse.json(
        { success: false, message: "No active work session" },
        { status: 400 }
      );
    }

    const updateSession = await prisma.workSession.update({
        where: { id: currentSessionId },
        data: {
            endedAt: new Date(),
        },
        });
    

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isWorking: false,
        currentSessionId: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        isWorking: true,
        currentSessionId: true,
      },
    });
    return NextResponse.json(
      { success: true, message: "Work stopped", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error stopping work:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}