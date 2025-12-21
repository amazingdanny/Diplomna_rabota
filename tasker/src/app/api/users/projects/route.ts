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
      // Token expired or invalid - clear cookie
      const response = NextResponse.json({ success: false, message: "Token expired" }, { status: 401 });
      response.cookies.set("token", "", { maxAge: 0, path: "/" });
      return response;
    }
    
    const userId = decoded.id;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { id: userId }
        }
      },
      include: {
        tasks: true,
        members: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    const projectsWithStats = projects.map(project => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(task => task.isCompleted).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const tasksLeft = totalTasks - completedTasks;
      return {
        id: project.id,
        name: project.name,
        deadline: project.deadLine,
        members: project.members,
        totalTasks,
        completedTasks,
        tasksLeft,
        progress
      };
    });

    return NextResponse.json({ success: true, projects: projectsWithStats });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}