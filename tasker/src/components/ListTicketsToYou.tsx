"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isOpen: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  project?: {
    id: string;
    name: string;
  } | null;
  task?: {
    id: string;
    title: string;
  } | null;
};

export default function ListTicketsToYou() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [closingIds, setClosingIds] = useState<string[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ticket/getTicketsForYou");
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load tickets");
        }
        setTickets(data.tickets || []);
      } catch (err: any) {
        setError(err.message || "Failed to load tickets");
      } finally {
        setIsLoading(false);
      }
    };
    loadTickets();
  }, []);

  const handleCloseTicket = async (ticketId: string) => {
    setClosingIds((prev) => [...prev, ticketId]);
    try {
      const res = await fetch("/api/ticket/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to close ticket");
      }
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, isOpen: false } : t))
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, isOpen: false });
      }
    } catch (err: any) {
      console.error(err?.message || err);
      setError(err?.message || "Failed to close ticket");
    } finally {
      setClosingIds((prev) => prev.filter((id) => id !== ticketId));
    }
  };

  const creatorName = (ticket: Ticket) => {
    if (ticket.createdBy.firstName && ticket.createdBy.lastName) {
      return `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`;
    }
    return ticket.createdBy.email;
  };

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Tickets for You
      </h2>

      {isLoading && <p className="text-sm text-zinc-500">Loading tickets...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-2">
          {tickets.length === 0 ? (
            <p className="text-sm text-zinc-500">No tickets assigned to you.</p>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  ticket.isOpen
                    ? "border-zinc-200 dark:border-zinc-800"
                    : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                }`}
              >
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      ticket.isOpen
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "line-through text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    From: <span className="font-medium">{creatorName(ticket)}</span>
                  </p>
                  <div className="mt-1 flex gap-2 text-xs text-zinc-500">
                    <span className={`rounded px-2 py-1 ${
                      ticket.type === "USER"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        : ticket.type === "ADMIN"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        : ticket.type === "PROGRAMMER"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                        : ticket.type === "MANAGER"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    }`}>
                      {ticket.type}
                    </span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="rounded-md px-3 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Details
                  </button>
                  {ticket.isOpen && (
                    <button
                      type="button"
                      onClick={() => handleCloseTicket(ticket.id)}
                      disabled={closingIds.includes(ticket.id)}
                      className="rounded-md px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-green-400 dark:hover:bg-green-900/30"
                    >
                      {closingIds.includes(ticket.id) ? "Closing..." : "Close"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {selectedTicket.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Created By
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {creatorName(selectedTicket)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Type
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedTicket.type}
                </p>
              </div>

              {selectedTicket.description && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {selectedTicket.description}
                  </p>
                </div>
              )}

              {selectedTicket.project && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Project
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {selectedTicket.project.name}
                  </p>
                </div>
              )}

              {selectedTicket.task && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Task
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {selectedTicket.task.title}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Created At
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </label>
                <p
                  className={`text-sm font-medium ${
                    selectedTicket.isOpen
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {selectedTicket.isOpen ? "Open" : "Closed"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Close
              </button>
              {selectedTicket.isOpen && (
                <button
                  type="button"
                  onClick={() => handleCloseTicket(selectedTicket.id)}
                  disabled={closingIds.includes(selectedTicket.id)}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-700 dark:hover:bg-green-600"
                >
                  {closingIds.includes(selectedTicket.id) ? "Closing..." : "Close Ticket"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
