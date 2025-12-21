import { NextResponse } from "next/server";
import {prisma } from "@/lib/prisma";

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

    

    const newWorkSession = await prisma.workSession.create({
        data: {
            userId: userId,
            startedAt: new Date(),
        },
        select: {
            id: true,
            startedAt: true,
        },
        });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        isWorking: true,
        currentSessionId: newWorkSession.id
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
      { success: true, message: "Work started", user: updatedUser, workSession: newWorkSession },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting work:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}