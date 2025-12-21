import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const { userId, selfRole } = await request.json();
    
    if (!userId) {
        return NextResponse.json( { success: false, message: "User ID is required" }, { status: 400 } );
    }
    if (selfRole !== "ADMIN") {
        return NextResponse.json( { success: false, message: "Unauthorized" }, { status: 403 } );
    }

    // Delete user work sessions first due to foreign key constraint
    await prisma.workSession.deleteMany({
        where: { userId: userId },
    });
    //Deleter user notes
    await prisma.note.deleteMany({
        where: { userId: userId },
    });

    // Then delete the user
    await prisma.user.delete({
        where: { id: userId },
    });

    return NextResponse.json( { success: true, message: "User deleted successfully" }, { status: 200 } );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 } );
  }
}