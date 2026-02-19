import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    // Get user from JWT token
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ success: false, message: "No token" }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    } catch (err) {
      const response = NextResponse.json({ success: false, message: "Token expired" }, { status: 401 });
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      return response;
    }
    
    const userId = decoded.id;

    const body = await request.json();
    const { projectId, taskId, title, description, type, sendToUserId } = body;

    if (title == null || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const validTypes = ["USER", "ADMIN", "PROGRAMMER", "MANAGER", "MARKETING"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Valid ticket type is required" },
        { status: 400 }
      );
    }

    const newTicket = await prisma.ticket.create({
      data: {
        createdById: userId,
        sentToId: sendToUserId || null,
        projectId: projectId || null,
        taskId: taskId || null,
        title: title.trim(),
        description: description || null,
        type,
      },
      select: {
        id: true,
        projectId: true,
        taskId: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Ticket created successfully", ticket: newTicket },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating ticket:", errorMessage);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}