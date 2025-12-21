import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, memberIds = [], description } = body;
    const rawDeadline = body.deadline ?? body.deadLine ?? null;
    if (!name || typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
            { success: false, message: "Project name is required" },
            { status: 400 }
        );
    }
    let deadlineDate: Date | null = null;
    if (rawDeadline) {
      const parsed = new Date(rawDeadline);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { success: false, message: "A valid deadline date is required (use yyyy-mm-dd)." },
          { status: 400 }
        );
      }
      deadlineDate = parsed;
    }

    // Validate member IDs
    const validMemberIds = Array.isArray(memberIds)
      ? memberIds.filter((id: any) => typeof id === "string" && id.trim() !== "")
      : [];
    if (validMemberIds.length < 1) {
        return NextResponse.json(
            { success: false, message: "At least one valid member ID is required" },
            { status: 400 }
        );
    }
    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        members: {
          connect: validMemberIds.map((id: string) => ({ id })),
        },
        description: description ? description.trim() : null,
        deadLine: deadlineDate,
      },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Project created", project: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}