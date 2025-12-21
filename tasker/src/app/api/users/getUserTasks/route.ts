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

    const userTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
    });

    return NextResponse.json(
      { success: true, tasks: userTasks },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}