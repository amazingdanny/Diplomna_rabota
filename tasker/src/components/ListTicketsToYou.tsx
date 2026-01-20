'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Ticket = {
  id: string
  title: string
  description: string | null
  type: string
  isOpen: boolean
  createdAt: string
  createdBy: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  project: {
    id: string
    name: string
  } | null
  task: {
    id: string
    title: string
  } | null
}

export default function ListTicketsToYou() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State to track which groups are open - "all" is open by default
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    all: true, // This makes the "all" group open by default
    open: false,
    closed: false,
  })

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const meRes = await fetch("/api/me")
        const meData = await meRes.json()
        if (!meRes.ok || !meData.user) {
          throw new Error("Failed to get user info")
        }

        const res = await fetch("/api/tickets/myTickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: meData.user.id }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load tickets")
        }
        setTickets(data.tickets || [])
      } catch (err: any) {
        setError(err.message || "Failed to load tickets")
      } finally {
        setIsLoading(false)
      }
    }
    loadTickets()
  }, [router])

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const getCreatorName = (creator: Ticket['createdBy']) => {
    if (creator.firstName || creator.lastName) {
      return `${creator.firstName || ''} ${creator.lastName || ''}`.trim()
    }
    return creator.email
  }

  const openTickets = tickets.filter((t) => t.isOpen)
  const closedTickets = tickets.filter((t) => !t.isOpen)

  const renderTicketList = (ticketList: Ticket[]) => {
    if (ticketList.length === 0) {
      return <p className="text-sm text-zinc-500 px-3 py-2">No tickets</p>
    }

    return (
      <div className="space-y-2">
        {ticketList.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-50">
                  {ticket.title}
                </h4>
                {ticket.description && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {ticket.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                    {ticket.type}
                  </span>
                  <span>From: {getCreatorName(ticket.createdBy)}</span>
                  {ticket.project && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      Project: {ticket.project.name}
                    </span>
                  )}
                  {ticket.task && (
                    <span className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Task: {ticket.task.title}
                    </span>
                  )}
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span
                className={`flex-shrink-0 rounded px-2 py-1 text-xs font-medium ${
                  ticket.isOpen
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                }`}
              >
                {ticket.isOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Tickets
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {tickets.length} total ticket{tickets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading tickets...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-3">
          {/* All Group - Open by default */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => toggleGroup('all')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                All Tickets ({tickets.length})
              </span>
              <span className="text-zinc-500">
                {openGroups.all ? '−' : '+'}
              </span>
            </button>
            {openGroups.all && (
              <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                {renderTicketList(tickets)}
              </div>
            )}
          </div>

          {/* Open Tickets Group */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => toggleGroup('open')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                Open Tickets ({openTickets.length})
              </span>
              <span className="text-zinc-500">
                {openGroups.open ? '−' : '+'}
              </span>
            </button>
            {openGroups.open && (
              <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                {renderTicketList(openTickets)}
              </div>
            )}
          </div>

          {/* Closed Tickets Group */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => toggleGroup('closed')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                Closed Tickets ({closedTickets.length})
              </span>
              <span className="text-zinc-500">
                {openGroups.closed ? '−' : '+'}
              </span>
            </button>
            {openGroups.closed && (
              <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                {renderTicketList(closedTickets)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
