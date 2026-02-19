import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
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
    const { groupId, userId: requestUserId } = body;

    const userIdToUse = requestUserId || userId;

    if (!groupId) {
      return NextResponse.json(
        { success: false, message: "Group ID is required" },
        { status: 400 }
      );
    }

    // Verify user is member of group
    const member = await prisma.chatGroupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: userIdToUse },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { groupId },
      include: {
        sender: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
    
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { success: true, messages },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching messages:", errorMessage);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}