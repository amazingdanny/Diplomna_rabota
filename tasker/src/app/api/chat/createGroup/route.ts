import {NextResponse} from "next/server";
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
    const { groupName, memberIds } = await request.json();

    if (!groupName) {
      return NextResponse.json(
        { success: false, message: "Group name is required" },
        { status: 400 }
      );
    }

    const allMemberIds = [userId, ...(memberIds || [])].filter((id, index, arr) => arr.indexOf(id) === index); // unique

    const newGroup = await prisma.chatGroup.create({
      data: {
        name: groupName,
        members: {
          create: allMemberIds.map((memberId: string) => ({
            userId: memberId,
          })),
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
        messages: true,
      },
    });

    return NextResponse.json(
      { success: true, group: newGroup },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat group:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}