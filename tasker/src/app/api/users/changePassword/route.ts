import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "User ID is required" },
            { status: 400 }
        );
    }
    if (!newPassword) {
        return NextResponse.json(
            { success: false, message: "New password is required" },
            { status: 400 }
        );
    }
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: newPassword,
        },
    });
    return NextResponse.json(
        { success: true, message: "Password changed successfully" },
        { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
    );
  }
}