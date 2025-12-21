import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, hours } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    if (hours === undefined || hours < 0) {
      return NextResponse.json(
        { success: false, message: "Valid hours value is required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        hours: hours
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
        hours: true,
      },
    });
    return NextResponse.json(
      { success: true, message: "User hours updated", user: updatedUser },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error changing user hours:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}