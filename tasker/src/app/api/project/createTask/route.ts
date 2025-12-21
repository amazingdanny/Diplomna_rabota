import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {  title, description, projectId, assigneeId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title: title,
        description: description || "",
        projectId: projectId,
        assigneeId: assigneeId || null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Task created", task: newTask },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}