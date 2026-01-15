'use client'

import { useEffect, useState } from "react"

type Task = {
  id: string
  title: string
  description: string | null
  isCompleted: boolean
  createdAt: string
  projectId: string | null
}

export default function UserTasks() {
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

        const res = await fetch("/api/users/getUserTasks", {
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

  const completedCount = tasks.filter((t) => t.isCompleted).length

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/task/markCompleted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update task")
      }
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, isCompleted: true } : task
        )
      )
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const performDelete = async (taskId: string) => {
    setDeletingIds((s) => [...s, taskId])
    try {
      const res = await fetch("/api/task/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete task")
      }
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      setConfirmDeleteId(null)
    } catch (err: any) {
      console.error(err?.message || err)
      setError(err?.message || "Failed to delete task")
    } finally {
      setDeletingIds((s) => s.filter((id) => id !== taskId))
    }
  }

  const onDeleteClick = (taskId: string) => {
    // Show inline confirm UI instead of using window.confirm, because browser
    // prompt dialogs can be blocked for localhost and cause accidental no-ops.
    setConfirmDeleteId((cur) => (cur === taskId ? null : taskId))
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          All Tasks
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {completedCount} of {tasks.length} completed
        </p>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading tasks...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-2">
            {tasks.length === 0 ? (
            <p className="text-sm text-zinc-500">No tasks assigned.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleComplete(task.id, task.isCompleted)}
                  className="mt-1 h-4 w-4 rounded"
                />
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      task.isCompleted
                        ? "line-through text-zinc-500 dark:text-zinc-400"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {task.projectId ? (
                      <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                        Project
                      </span>
                    ) : (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        Solo
                      </span>
                    )}
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                  <div className="flex items-center">
                    {confirmDeleteId === task.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => performDelete(task.id)}
                          disabled={deletingIds.includes(task.id)}
                          className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingIds.includes(task.id) ? "Deleting..." : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deletingIds.includes(task.id)}
                          className="rounded-md px-3 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-zinc-200 dark:hover:bg-zinc-800/30"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onDeleteClick(task.id)}
                        disabled={deletingIds.includes(task.id)}
                        className="ml-2 rounded-md px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-red-900/30"
                      >
                        Delete
                      </button>
                    )}
                  </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
