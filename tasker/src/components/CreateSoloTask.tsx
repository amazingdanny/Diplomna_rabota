'use client'

import { useEffect, useState } from "react"

type User = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

export default function CreateSoloTask() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users/list")
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load users")
        }
        setUsers(data.users || [])
      } catch (err: any) {
        setFormError(err.message || "Failed to load users")
      }
    }
    loadUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError("")
    setSuccessMessage("")

    if (!title.trim()) {
      setFormError("Task title is required")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/task/createSolo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          assigneeId: selectedUserId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create task")
      }

      setSuccessMessage("Solo task created successfully!")
      setTitle("")
      setDescription("")
      setSelectedUserId("")
    } catch (err: any) {
      setFormError(err.message || "Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  const getUserName = (user: User) => {
    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim()
    return fullName || user.email
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Create Solo Task
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="Enter task description (optional)"
            rows={3}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Assign to
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {getUserName(user)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
        >
          {isLoading ? "Creating..." : "Create Solo Task"}
        </button>

        {formError && <p className="text-sm text-red-500">{formError}</p>}
        {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
      </form>
    </div>
  )
}
