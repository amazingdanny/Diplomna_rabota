"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import WorkCalendar from "@/components/WorkCalendar";

type UserItem = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  hours?: number | null;
  receiveTickets: boolean;
};

type SessionItem = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  time: number | null;
};

type Props = {
  userId: string;
};

export default function EditUserClient({ userId }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<UserItem | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [hours, setHours] = useState<string>("");
  const [receiveTickets, setReceiveTickets] = useState(false);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [dayTotals, setDayTotals] = useState<Record<string, number>>({});
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  

  const fullName = useMemo(() => {
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first && !last) return "(no name)";
    return `${first} ${last}`.trim();
  }, [firstName, lastName]);

  const loadSessions = async (userId: string, date?: Date) => {
    setIsLoadingSessions(true);
    setSessionsError(null);
    try {
      const res = await fetch("/api/users/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load sessions");
      }
      const allSessions = data.sessions || [];
      
      // Filter sessions by selected date
      const targetDate = date || selectedDate;
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const filtered = allSessions.filter((session: SessionItem) => {
        const sessionDate = new Date(session.startedAt);
        return sessionDate >= startOfDay && sessionDate <= endOfDay;
      });
      
      setSessions(filtered);
    } catch (err: any) {
      setSessionsError(err.message || "Failed to load sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Load user details
  useEffect(() => {
    if (!userId) return;
    const loadUser = async () => {
      setIsLoadingUser(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/users/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load user");
        }
        const found = data.user as UserItem;
        setUser(found);
        setFirstName(found.firstName ?? "");
        setLastName(found.lastName ?? "");
        setPassword("");
        setHours(found.hours !== null && found.hours !== undefined ? String(found.hours) : "");
        setReceiveTickets(found.receiveTickets);
        await Promise.all([
          loadSessions(found.id),
          loadDayTotals(found.id),
        ]);
      } catch (err: any) {
        setLoadError(err.message || "Failed to load user");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [userId]);

  // Reload sessions when selected date changes
  useEffect(() => {
    if (user?.id) {
      loadSessions(user.id, selectedDate);
    }
  }, [selectedDate]);

  const loadDayTotals = async (userId: string) => {
    setIsLoadingCalendar(true);
    setCalendarError(null);
    try {
      const res = await fetch("/api/users/dailyTotals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load calendar data");
      }
      setDayTotals(data.dailyTotals || {});
    } catch (err: any) {
      setCalendarError(err.message || "Failed to load calendar data");
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleSaveFirstName = async () => {
    setActionError(null);
    setActionSuccess(null);
    const trimmed = firstName.trim();
    if (!trimmed) {
      setActionError("First name cannot be empty");
      return;
    }
    const res = await fetch("/api/users/changeFirstName", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, firstName: trimmed, selfRole: "ADMIN" }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setActionError(data.message || "Failed to update first name");
    } else {
      setActionSuccess("First name updated");
    }
  };

  const handleSaveLastName = async () => {
    setActionError(null);
    setActionSuccess(null);
    const trimmed = lastName.trim();
    if (!trimmed) {
      setActionError("Last name cannot be empty");
      return;
    }
    const res = await fetch("/api/users/changeLastName", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, lastName: trimmed }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setActionError(data.message || "Failed to update last name");
    } else {
      setActionSuccess("Last name updated");
    }
  };

  const handleSavePassword = async () => {
    setActionError(null);
    setActionSuccess(null);
    const trimmed = password.trim();
    if (!trimmed) {
      setActionError("Password cannot be empty");
      return;
    }
    const res = await fetch("/api/users/changePassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newPassword: trimmed, selfRole: "ADMIN" }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setActionError(data.message || "Failed to change password");
    } else {
      setPassword("");
      setActionSuccess("Password updated");
    }
  };

  const handleSaveHours = async () => {
    setActionError(null);
    setActionSuccess(null);
    const parsed = Number(hours);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setActionError("Hours must be a number greater than 0");
      return;
    }
    const res = await fetch("/api/users/changeHours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, hours: parsed }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setActionError(data.message || "Failed to update hours");
    } else {
      setActionSuccess("Hours updated");
    }
  };

  const handleToggleReceiveTickets = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/users/toggleTicketReceive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to toggle receive tickets");
      }
      setReceiveTickets(data.receiveTickets);
    } catch (err: any) {
      setActionError(err.message || "Failed to toggle receive tickets");
    }
  };


  const handleDeleteUser = async () => {
    setActionError(null);
    setActionSuccess(null);
    setIsDeletingUser(true);
    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, selfRole: "ADMIN" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user");
      }
      router.push("/control_panel");
    } catch (err: any) {
      setActionError(err.message || "Failed to delete user");
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/workSession/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete session");
      }
      await loadSessions(userId);
    } catch (err: any) {
      setActionError(err.message || "Failed to delete session");
    }
  };

  if (isLoadingUser) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 p-6">Loading user...</div>;
  }

  if (loadError || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 p-6">
        <button
          onClick={() => router.push("/control_panel")}
          className="mb-6 text-sm text-zinc-600 underline dark:text-zinc-300"
        >
          ← Back to Control Panel
        </button>
        <div className="max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-red-500">{loadError || "User not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit User</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
          </div>
          <button
            onClick={() => router.push("/control_panel")}
            className="text-sm text-zinc-600 underline dark:text-zinc-300"
          >
            ← Back to Control Panel
          </button>
        </div>

        {actionError && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-200">{actionError}</div>}
        {actionSuccess && <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-200">{actionSuccess}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold mb-4">Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">First name</label>
                <div className="mt-1 flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <button
                    onClick={handleSaveFirstName}
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Last name</label>
                <div className="mt-1 flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <button
                    onClick={handleSaveLastName}
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                <div className="mt-1 flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    onClick={handleSavePassword}
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Daily hours target</label>
                <div className="mt-1 flex gap-2">
                  <input
                    className="w-24 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    inputMode="numeric"
                  />
                  <button
                    onClick={handleSaveHours}
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Receive tickets</label>
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={handleToggleReceiveTickets}
                    className={`rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${
                      receiveTickets
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {receiveTickets ? "On" : "Off"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Work Calendar</h3>
              {isLoadingCalendar && <span className="text-sm text-zinc-500">Loading...</span>}
            </div>
            {calendarError ? (
              <p className="text-sm text-red-500">{calendarError}</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Daily hours vs target ({hours || "8"}h)</p>
                <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                  <WorkCalendar
                    dayTotals={dayTotals}
                    targetHours={Number(hours) || 8}
                    onDateClick={(date) => setSelectedDate(date)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Sessions for {fullName}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLoadingSessions && <span className="text-sm text-zinc-500">Loading...</span>}
              <button
                onClick={() => setSelectedDate(new Date())}
                className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Today
              </button>
            </div>
          </div>
          {sessionsError && <p className="text-sm text-red-500 mb-3">{sessionsError}</p>}
          {sessions.length === 0 && !isLoadingSessions ? (
            <p className="text-sm text-zinc-500">No sessions found for this date.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                >
                  <div className="space-y-1">
                    <div className="text-zinc-900 dark:text-zinc-50 font-medium">
                      {new Date(session.startedAt).toLocaleString()}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs">
                      {session.endedAt ? new Date(session.endedAt).toLocaleString() : "In progress"}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs">
                      Duration: {session.time ?? "—"} minutes
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-offset-zinc-900"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-800 dark:bg-red-950/50 dark:text-red-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Danger zone</h3>
              <p className="text-xs text-red-600/80 dark:text-red-200/80">This action cannot be undone.</p>
            </div>
            <button
              onClick={handleDeleteUser}
              disabled={isDeletingUser}
              className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-red-50 disabled:opacity-60 dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-offset-red-950/50"
            >
              {isDeletingUser ? "Deleting..." : "Delete user"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
