"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  deadline: string | null;
  totalTasks: number;
  completedTasks: number;
  tasksLeft: number;
  progress: number;
  isCompleted: boolean;
};

export default function UnfinishedProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/project/list");
        
        const data = await response.json();
        if (data.success) {

          const unfinished = data.projects.filter((p: Project) => !p.isCompleted);
          setProjects(unfinished);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [router]);

  const handleFinish = async (projectId: string) => {
    setFinishing(projectId);
    try {
      const response = await fetch("/api/project/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error("Failed to finish project");
      }

      const data = await response.json();
      if (data.success) {

        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (error) {
      console.error("Error finishing project:", error);
      alert("Failed to mark project as finished");
    } finally {
      setFinishing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
        <div className="text-center py-8 text-zinc-500">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Unfinished Projects</h2>
        <div className="text-center py-8 text-zinc-500">No unfinished projects</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Unfinished Projects</h2>
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 border border-zinc-300 dark:border-zinc-700 rounded-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{project.name}</h3>
                {project.deadline && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleFinish(project.id)}
                disabled={finishing === project.id}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {finishing === project.id ? "Finishing..." : "Mark as Finished"}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <span>{project.completedTasks} / {project.totalTasks} tasks completed</span>
                <span>{project.tasksLeft} tasks left</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
