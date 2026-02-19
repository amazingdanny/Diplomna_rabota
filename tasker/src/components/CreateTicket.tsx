"use client";

import { useState, useEffect } from "react";

type Project = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  title: string;
  projectId: string;
};

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

const TICKET_TYPES = ["USER", "ADMIN", "PROGRAMMER", "MANAGER", "MARKETING"] as const;

export default function CreateTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("USER");
  const [sendToUserId, setSendToUserId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [taskId, setTaskId] = useState<string>("");
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const projectsRes = await fetch("/api/project/list");
        const projectsData = await projectsRes.json();
        if (projectsData.success) {
          setProjects(projectsData.projects || []);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (projectId) {
      const loadProjectTasks = async () => {
        try {
          const res = await fetch("/api/project/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId }),
          });
          const data = await res.json();
          if (data.success) {
            setFilteredTasks(data.tasks || []);
          }
        } catch (err) {
          console.error("Error loading tasks:", err);
        }
      };
      loadProjectTasks();
      setTaskId("");
    } else {
      setFilteredTasks([]);
      setTaskId("");
    }
  }, [projectId]);

  useEffect(() => {
    const loadUsersForType = async () => {
      if (!type) return;
      setIsLoadingUsers(true);
      try {
        const res = await fetch("/api/ticket/getUsersForTicket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: type }),
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
          setSendToUserId("");
        }
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsersForType();
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Title is required");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ticket/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          type,
          sendToUserId: sendToUserId || null,
          projectId: projectId || null,
          taskId: taskId || null,
        }),
      });
      

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create ticket");
      }

      setSuccess("Ticket created successfully!");
      setTitle("");
      setDescription("");
      setType("USER");
      setSendToUserId("");
      setProjectId("");
      setTaskId("");
    } catch (err: any) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Create Ticket
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            placeholder="Enter ticket title"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            placeholder="Enter ticket description"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            disabled={isLoading}
          >
            {TICKET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Send ticket to
          </label>
          <select
            value={sendToUserId}
            onChange={(e) => setSendToUserId(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            disabled={isLoading || isLoadingUsers || users.length === 0}
          >
            <option value="">-- Select user --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </option>
            ))}
          </select>
          {users.length === 0 && !isLoadingUsers && type && (
            <p className="mt-1 text-xs text-zinc-500">No users available for this type</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Project (optional)
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            disabled={isLoading || isLoadingData}
          >
            <option value="">-- No project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {projectId && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Task (optional)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              disabled={isLoading || filteredTasks.length === 0}
            >
              <option value="">-- No task --</option>
              {filteredTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            {filteredTasks.length === 0 && projectId && (
              <p className="mt-1 text-xs text-zinc-500">No tasks available for this project</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isLoading ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
