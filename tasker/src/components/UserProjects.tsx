"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  deadline: string | null;
  members: Array<{ id: string; firstName: string | null; lastName: string | null; email: string }>;
  totalTasks: number;
  completedTasks: number;
  tasksLeft: number;
  progress: number;
}

export default function UserProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/users/projects");
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.message || "Failed to load projects");
      }
      setProjects(data.projects);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading projects...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">My Projects</h2>
      {projects.length === 0 ? (
        <p className="text-zinc-500">No projects assigned.</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="p-3 border border-zinc-200 dark:border-zinc-700 rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => setSelectedProject(project)}
            >
              <div className="font-medium text-zinc-900 dark:text-zinc-50">{project.name}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {project.tasksLeft} tasks left • {project.progress}% complete
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">{selectedProject.name}</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Tasks Left:</strong> {selectedProject.tasksLeft}</div>
              <div><strong>Progress:</strong> {selectedProject.progress}%</div>
              <div><strong>Deadline:</strong> {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : "No deadline"}</div>
              <div><strong>Members:</strong></div>
              <ul className="ml-4 list-disc">
                {selectedProject.members.map(member => (
                  <li key={member.id}>{member.firstName} {member.lastName} ({member.email})</li>
                ))}
              </ul>
            </div>
            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={() => setSelectedProject(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
