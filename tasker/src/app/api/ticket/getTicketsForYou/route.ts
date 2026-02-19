import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    } catch (err) {
      const response = NextResponse.json(
        { success: false, message: "Token expired" },
        { status: 401 }
      );
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      return response;
    }

    const userId = decoded.id;

    const tickets = await prisma.ticket.findMany({
      where: {
        sentToId: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, tickets },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching tickets:", errorMessage);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
