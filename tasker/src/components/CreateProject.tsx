'use client'
import { useEffect, useState } from "react"

type UserItem = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

export default function CreateProject() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [deadlineInput, setDeadlineInput] = useState("")

  const normalizeInputToIso = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return ""
    // Accept both ISO (yyyy-mm-dd) and dd/mm/yyyy typed in
    if (trimmed.includes("-")) {
      // assume yyyy-mm-dd
      return trimmed
    }
    const parts = trimmed.split("/")
    if (parts.length !== 3) return ""
    const [dd, mm, yyyy] = parts
    if (!dd || !mm || !yyyy) return ""
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`
  }
  const [users, setUsers] = useState<UserItem[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [formError, setFormError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users/list")
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load users")
        setUsers(data.users || [])
      } catch (err: any) {
        setFormError(err.message || "Failed to load users")
      }
    }
    loadUsers()
  }, [])

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError("")
    setSuccessMessage("")

    if (name.trim() === "") {
      setFormError("Project name is required.")
      setIsLoading(false)
      return
    }

    try {
      const deadlineIso = normalizeInputToIso(deadlineInput)
      const response = await fetch("/api/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, deadline: deadlineIso || null, memberIds: selectedIds }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to create project")
      }

      setSuccessMessage("Project created successfully!")
      setName("")
      setDescription("")
      setDeadlineInput("")
      setSelectedIds([])
      setIsUserMenuOpen(false)
    } catch (error: any) {
      setFormError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Create Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Project Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description (optional)"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="deadline">
            Deadline (optional)
          </label>
          <input
            id="deadline"
            type="text"
            className="w-full p-2 border rounded"
            placeholder="dd/mm/yyyy"
            value={deadlineInput}
            onChange={(e) => setDeadlineInput(e.target.value)}
          />
          <p className="mt-1 text-xs text-zinc-500">Enter or paste as dd/mm/yyyy; stored as ISO.</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Members</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="w-full rounded border px-3 py-2 text-left"
            >
              {selectedIds.length === 0 ? "Select members" : `${selectedIds.length} selected`}
            </button>
            {isUserMenuOpen && (
              <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded border bg-white shadow">
                {users.map((u) => {
                  const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim()
                  const label = fullName || u.email
                  const checked = selectedIds.includes(u.id)
                  return (
                    <label
                      key={u.id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-zinc-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUser(u.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-zinc-800">{label}</span>
                    </label>
                  )
                })}
                {users.length === 0 && (
                  <div className="px-3 py-2 text-sm text-zinc-500">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Project"}
        </button>
        {formError && <p className="text-red-500 mt-2">{formError}</p>}
        {successMessage && (
          <p className="text-green-500 mt-2">{successMessage}</p>
        )}
      </form>
    </div>
  )
}