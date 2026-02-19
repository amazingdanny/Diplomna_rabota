import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userRole, receiveTickets } = await request.json();
    if (!userRole) {
      return NextResponse.json(
        { success: false, message: "User role is required" },
        { status: 400 }
      );
    }
    if (!receiveTickets) {
      return NextResponse.json(
        { success: false, message : "User not authorized" },
        { status: 403 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        type : userRole,
        isOpen: true
      },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          isOpen: true,
          createdAt: true,
          createdById: true,
          projectId: true,
          taskId: true,

        },
    });

    return NextResponse.json({ success: true, tickets }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}