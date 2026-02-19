import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
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

    const groups = await prisma.chatGroup.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    
    return NextResponse.json({ success: true, groups }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching chat groups:", errorMessage);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}