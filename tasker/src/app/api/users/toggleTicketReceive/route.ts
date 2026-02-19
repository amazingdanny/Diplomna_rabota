import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { receiveTickets: !user.receiveTickets },
      select: { receiveTickets: true },
    });

    return NextResponse.json(
      { success: true, receiveTickets: updatedUser.receiveTickets },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling ticket receive setting:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}