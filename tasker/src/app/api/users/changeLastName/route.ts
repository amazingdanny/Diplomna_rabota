import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, lastName } = body;
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User ID is required" },
                { status: 400 }
            );
        }
        if (!lastName) {
            return NextResponse.json(
                { success: false, message: "Last name is required" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { lastName: lastName },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                isWorking: true,
                currentSessionId: true,
            },
        });

        return NextResponse.json(
            { success: true, message: "Last name updated", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error changing last name:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}