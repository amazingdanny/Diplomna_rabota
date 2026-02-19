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
    const { otherUserId } = await request.json();

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, message: "Other user ID is required" },
        { status: 400 }
      );
    }

    // Find existing DM between the two users
    const existingDM = await prisma.chatGroup.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: { in: [userId, otherUserId] }
          }
        },
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: otherUserId } } }
        ]
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
    });

    if (existingDM) {
      return NextResponse.json({ success: true, group: existingDM }, { status: 200 });
    }

    // Create new DM
    const newDM = await prisma.chatGroup.create({
      data: {
        name: "", // or something
        isGroup: false,
        members: {
          create: [
            { userId },
            { userId: otherUserId }
          ]
        }
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
        messages: true,
      },
    });

    return NextResponse.json({ success: true, group: newDM }, { status: 201 });
  } catch (error) {
    console.error("Error creating DM:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}