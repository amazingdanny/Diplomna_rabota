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

    const unfinishedTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        isCompleted: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
        projectId: true,
        createdAt: true,
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, tasks: unfinishedTasks },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching to-do tasks:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}