'use client'

import { useEffect, useState } from "react"

type Task = {
  id: string
  title: string
  description: string | null
  projectId: string | null
  project?: { name: string } | null
  createdAt: string
}

export default function ToDo() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const meRes = await fetch("/api/me")
        const meData = await meRes.json()
        if (!meRes.ok || !meData.user) {
          throw new Error("Failed to get user info")
        }

        const res = await fetch("/api/users/toDo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: meData.user.id }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load tasks")
        }
        setTasks(data.tasks || [])
      } catch (err: any) {
        setError(err.message || "Failed to load tasks")
      } finally {
        setIsLoading(false)
      }
    }
    loadTasks()
  }, [])

  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch("/api/task/markCompleted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to mark task complete")
      }
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err: any) {
      console.error(err.message)
    }
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        To Do
      </h2>

      {isLoading && (
        <p className="text-sm text-zinc-500">Loading tasks...</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!isLoading && !error && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500">No tasks to do!</p>
              <p className="text-sm text-zinc-400">You're all caught up.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-zinc-200 p-3 hover:border-zinc-300 transition dark:border-zinc-800 dark:hover:border-zinc-700 flex items-start gap-3"
              >
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="mt-1 flex-shrink-0 h-5 w-5 rounded border-2 border-zinc-300 hover:border-green-500 hover:bg-green-50 dark:border-zinc-600 dark:hover:border-green-500 dark:hover:bg-green-900 transition flex items-center justify-center"
                >
                  <span className="text-green-600 dark:text-green-400">✓</span>
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {task.projectId && (
                      <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                        {task.project?.name ? `Project: ${task.project.name}` : "Project Task"}
                      </span>
                    )}
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
