import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, firstName, selfRole } = body;

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "User ID is required" },
            { status: 400 }
        );
        }
    if (!firstName) {
        return NextResponse.json(
            { success: false, message: "First name is required" },
            { status: 400 }
        );
    }
    if (selfRole !== "ADMIN") {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 403 }
        );
    }
    await prisma.user.update({
        where: { id: userId },
        data: {
            firstName: body.firstName,
        },
        });

    return NextResponse.json(
      { success: true, message: "First name changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing first name:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}