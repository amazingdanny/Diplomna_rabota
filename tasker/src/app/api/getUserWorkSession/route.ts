import { NextResponse } from "next/server";
import {prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const {userId} = await request.json();
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User ID is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where:{
                id: userId
            },
            select: {
                id: true,
                currentSessionId: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, currentSessionId: user.currentSessionId },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching user work session:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}