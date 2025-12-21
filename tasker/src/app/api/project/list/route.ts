import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
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
        progress,
        isCompleted: project.isCompleted
      };
    });

    return NextResponse.json({ success: true, projects: projectsWithStats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
