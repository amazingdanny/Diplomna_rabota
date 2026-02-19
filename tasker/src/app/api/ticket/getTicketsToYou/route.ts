import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        sentToId: userId,
        isOpen: true
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            },
        },
        projectId: true,
        taskId: true,
      },
    });

    return NextResponse.json({ success: true, tickets }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tickets to user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}   