import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { isCompleted: true,
        members: { set: [] }
       },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        isCompleted: true,
        deadLine: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Project marked as finished", project: updatedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error finishing project:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}