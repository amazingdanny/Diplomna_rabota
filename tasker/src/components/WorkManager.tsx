"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function WorkManager() {
    const [isWorking, setIsWorking] = useState(false);
    const [workInterval, setWorkInterval] = useState<NodeJS.Timeout | null>(null);
    const [startedAt, setStartedAt] = useState<Date | null>(null);
    const [currentWorkTime, setCurrentWorkTime] = useState<number | null>(null);
    const [now, setNow] = useState<Date>(new Date());
    const [finishedWork, setFinishedWork] = useState<boolean>(false);
    const [finishedAt, setFinishedAt] = useState<Date | null>(null);
    const [startedWork, setStartedWork] = useState<boolean>(false);
    const [todaySessions, setTodaySessions] = useState<Array<{
        id: string;
        startedAt: string;
        endedAt: string | null;
        time: number | null;
    }>>([]);
    const router = useRouter();

    const activeSession = todaySessions.find((session) => session.endedAt === null);
    const pastSessions = todaySessions.filter((session) => session.endedAt !== null);
    const lastFinishedSession = pastSessions[0] ?? null;

   
    // Initialize startedAt when work starts
    useEffect(() => {
        if (isWorking && !startedAt) {
            setStartedWork(true);
            setStartedAt(new Date());
            setCurrentWorkTime(0);
        }
    }, [isWorking, startedAt]);

    // Timer for updating work time
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isWorking && startedAt) {
            interval = setInterval(() => {
                setWorkInterval(interval);
                setNow(new Date());
                setCurrentWorkTime((Date.now() - startedAt.getTime()) / 1000 / 60);
            }, 1000 * 60);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isWorking, startedAt]);

    const fetchTodaySessions = async () => {
        const response = await fetch('/api/me');
        if (!response.ok) {
            router.push('/login');
            return;
        }
        const data = await response.json();
        const userID = data.user.id;

        const res = await fetch('/api/userSessionsToday', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userID }),
        });

        if (!res.ok) return;
        const result = await res.json();
        const sessions = result.sessions || [];
        setTodaySessions(sessions);

        const active = sessions.find((session: any) => session.endedAt === null);
        if (active) {
            const startedDate = new Date(active.startedAt);
            setIsWorking(true);
            setStartedWork(true);
            setStartedAt(startedDate);
            setFinishedAt(null);
            setFinishedWork(false);
            setCurrentWorkTime((Date.now() - startedDate.getTime()) / 1000 / 60);
        } else {
            setIsWorking(false);
            setFinishedWork(false);
            setStartedAt(null);
        }
    };

    useEffect(() => {
        fetchTodaySessions();
    }, []);

    const toggleWork = async () => {
        const response = await fetch('/api/me');
        const data = await response.json();
        const userID = data.user.id;
        if (!response.ok) {
            router.push('/login');
            return;
        }
        const sessionRes = await fetch('/api/getUserWorkSession', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userID }),
        });
        const sessionData = await sessionRes.json();
        const currentSessionId = sessionData.currentSessionId;

        // Check current state BEFORE updating
        if (!isWorking) {
            // Starting work
            await fetch('/api/startWork', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userID }),
            });
        } else {
            // Stopping work
            const activeId = activeSession?.id || currentSessionId;
            if (activeId) {
                await fetch('/api/stopWork', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userID, currentSessionId: activeId }),
                });
            }
        }
        
        // Refresh today's sessions list and sync state from server
        await fetchTodaySessions();
    };

    return (
        <div className="h-screen w-full overflow-hidden flex items-center justify-center bg-zinc-50 px-3 py-4 dark:bg-black">
            <div className="w-full max-w-3xl max-h-[82vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Work Manager</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Track your active and recent sessions.</p>
                    </div>
                    <button
                        onClick={toggleWork}
                        className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                            isWorking
                                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600"
                        }`}
                    >
                        {isWorking ? "Stop Working" : "Start Working"}
                    </button>
                </div>

                {/* Current session block */}
                <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-800/70">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">Current Session</div>
                    {activeSession ? (
                        <div className="mt-2 grid grid-cols-1 gap-1 text-zinc-800 dark:text-zinc-100 sm:grid-cols-2">
                            <div>Started at: {new Date(activeSession.startedAt).toLocaleTimeString()}</div>
                            <div>
                                Duration: {startedAt ? Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000 / 60)) : 0} min
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 text-zinc-500">No active session.</div>
                    )}
                </div>

                {/* Status and last session details */}
                <div className="mt-4 grid gap-3 text-sm text-zinc-800 dark:text-zinc-100 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Status</div>
                        <div className="mt-1 text-base font-semibold">{isWorking ? "Working" : "Idle"}</div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 p-3 space-y-1 dark:border-zinc-800">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Most Recent Finished</div>
                        {lastFinishedSession ? (
                            <>
                                <div>Started: {new Date(lastFinishedSession.startedAt).toLocaleTimeString()}</div>
                                <div>Finished: {lastFinishedSession.endedAt ? new Date(lastFinishedSession.endedAt).toLocaleTimeString() : '—'}</div>
                                <div>
                                    Duration: {
                                        (() => {
                                            const started = new Date(lastFinishedSession.startedAt);
                                            const ended = lastFinishedSession.endedAt ? new Date(lastFinishedSession.endedAt) : null;
                                            const durationMinutes = lastFinishedSession.time ?? (ended ? Math.round((ended.getTime() - started.getTime()) / 1000 / 60) : null);
                                            return durationMinutes !== null ? `${durationMinutes} min` : '—';
                                        })()
                                    }
                                </div>
                            </>
                        ) : (
                            <div className="text-zinc-500">No finished session yet today.</div>
                        )}
                    </div>
                </div>

                {/* Today's sessions list */}
                <div className="mt-6 flex flex-col gap-3 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Today's Sessions</h3>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">{pastSessions.length} total</span>
                    </div>
                    {pastSessions.length === 0 && (
                        <p className="mt-2 text-sm text-zinc-500">No sessions started today.</p>
                    )}
                    <div className="mt-1 h-52 sm:h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/70">
                        <ul className="space-y-2">
                            {pastSessions.map((session) => {
                                const started = new Date(session.startedAt);
                                const ended = session.endedAt ? new Date(session.endedAt) : null;
                                const durationMinutes = session.time ?? (ended && started ? Math.round((ended.getTime() - started.getTime()) / 1000 / 60) : null);
                                return (
                                    <li key={session.id} className="rounded-lg border border-zinc-200 bg-white p-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Start</span>
                                            <span>{started.toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">End</span>
                                            <span>{ended ? ended.toLocaleTimeString() : 'In progress'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Duration</span>
                                            <span>{durationMinutes !== null ? `${durationMinutes} min` : '—'}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}