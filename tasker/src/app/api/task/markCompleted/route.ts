import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId } = body;
    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "Task ID is required" },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted: true },
    });

    return NextResponse.json(
      { success: true, message: "Task marked as completed", task: updatedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking task as completed:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}