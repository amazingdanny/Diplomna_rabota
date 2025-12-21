'use client'

import { useEffect, useMemo, useState } from "react";

type UserItem = {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	role: string;
	hours?: number | null;
};

type SessionItem = {
	id: string;
	startedAt: string;
	endedAt: string | null;
	time: number | null;
};

type Props = {
	user: UserItem;
	onClose: () => void;
	onChanged?: () => Promise<void> | void;
};

export default function EditUserMenu({ user, onClose, onChanged }: Props) {
	const [firstName, setFirstName] = useState(user.firstName ?? "");
	const [lastName, setLastName] = useState(user.lastName ?? "");
	const [password, setPassword] = useState("");
	const [hours, setHours] = useState<string>(user.hours !== null && user.hours !== undefined ? String(user.hours) : "");
	const [sessions, setSessions] = useState<SessionItem[]>([]);
	const [isLoadingSessions, setIsLoadingSessions] = useState(false);
	const [sessionsError, setSessionsError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [isDeletingUser, setIsDeletingUser] = useState(false);

	const fullName = useMemo(() => {
		const first = firstName.trim();
		const last = lastName.trim();
		if (!first && !last) return "(no name)";
		return `${first} ${last}`.trim();
	}, [firstName, lastName]);

	useEffect(() => {
		setFirstName(user.firstName ?? "");
		setLastName(user.lastName ?? "");
		setPassword("");
		loadSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user.id]);

	const loadSessions = async () => {
		setIsLoadingSessions(true);
		setSessionsError(null);
		try {
			const res = await fetch("/api/users/sessions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user.id }),
			});
			const data = await res.json();
			if (!res.ok || !data.success) {
				throw new Error(data.message || "Failed to load sessions");
			}
			setSessions(data.sessions || []);
		} catch (err: any) {
			setSessionsError(err.message || "Failed to load sessions");
		} finally {
			setIsLoadingSessions(false);
		}
	};

	const handleSaveFirstName = async () => {
		setActionError(null);
		const trimmed = firstName.trim();
		if (!trimmed) {
			setActionError("First name cannot be empty");
			return;
		}
		const res = await fetch("/api/users/changeFirstName", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: user.id, firstName: trimmed, selfRole: "ADMIN" }),
		});
		const data = await res.json();
		if (!res.ok || !data.success) {
			setActionError(data.message || "Failed to update first name");
		} else {
			onChanged?.();
		}
	};

	const handleSaveLastName = async () => {
		setActionError(null);
		const trimmed = lastName.trim();
		if (!trimmed) {
			setActionError("Last name cannot be empty");
			return;
		}
		const res = await fetch("/api/users/changeLastName", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: user.id, lastName: trimmed }),
		});
		const data = await res.json();
		if (!res.ok || !data.success) {
			setActionError(data.message || "Failed to update last name");
		} else {
			onChanged?.();
		}
	};

	const handleSavePassword = async () => {
		setActionError(null);
		const trimmed = password.trim();
		if (!trimmed) {
			setActionError("Password cannot be empty");
			return;
		}
		const res = await fetch("/api/users/changePassword", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: user.id, newPassword: trimmed, selfRole: "ADMIN" }),
		});
		const data = await res.json();
		if (!res.ok || !data.success) {
			setActionError(data.message || "Failed to change password");
		} else {
			setPassword("");
		}
	};

	const handleSaveHours = async () => {
		setActionError(null);
		const parsed = Number(hours);
		if (!Number.isFinite(parsed) || parsed < 1) {
			setActionError("Hours must be a number greater than 0");
			return;
		}
		const res = await fetch("/api/users/changeHours", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: user.id, hours: parsed }),
		});
		const data = await res.json();
		if (!res.ok || !data.success) {
			setActionError(data.message || "Failed to update hours");
		} else {
			onChanged?.();
		}
	};

	const handleDeleteUser = async () => {
		setActionError(null);
		setIsDeletingUser(true);
		try {
			const res = await fetch("/api/users/delete", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: user.id, selfRole: "ADMIN" }),
			});
			const data = await res.json();
			if (!res.ok || !data.success) {
				throw new Error(data.message || "Failed to delete user");
			}
			await onChanged?.();
			onClose();
		} catch (err: any) {
			setActionError(err.message || "Failed to delete user");
		} finally {
			setIsDeletingUser(false);
		}
	};

	const handleDeleteSession = async (sessionId: string) => {
		setActionError(null);
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
			await loadSessions();
		} catch (err: any) {
			setActionError(err.message || "Failed to delete session");
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
			<div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Edit User</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">{fullName}</p>
					</div>
					<button
						onClick={onClose}
						className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						Close
					</button>
				</div>

				{actionError && (
					<p className="mt-3 text-sm text-red-500">{actionError}</p>
				)}

				<div className="mt-6 grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">First name</label>
						<div className="flex gap-2">
							<input
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
							/>
							<button
								onClick={handleSaveFirstName}
								className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
							>
								Save
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Last name</label>
						<div className="flex gap-2">
							<input
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
							/>
							<button
								onClick={handleSaveLastName}
								className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
							>
								Save
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Work hours (per day)</label>
						<div className="flex gap-2">
							<input
								type="number"
								min="1"
								value={hours}
								onChange={(e) => setHours(e.target.value)}
								className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
							/>
							<button
								onClick={handleSaveHours}
								className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
							>
								Save
							</button>
						</div>
					</div>

					<div className="space-y-2 sm:col-span-2">
						<label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Password</label>
						<div className="flex gap-2">
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
							/>
							<button
								onClick={handleSavePassword}
								className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
							>
								Update
							</button>
						</div>
					</div>
				</div>

				<div className="mt-8">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Work sessions</h4>
						{isLoadingSessions && <span className="text-xs text-zinc-500">Loading…</span>}
					</div>
					{sessionsError && (
						<p className="text-sm text-red-500">{sessionsError}</p>
					)}
					{!sessionsError && sessions.length === 0 && !isLoadingSessions && (
						<p className="text-sm text-zinc-500">No sessions.</p>
					)}
					<div className="mt-3 max-h-64 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
						{sessions.map((session) => (
							<div
								key={session.id}
								className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 text-sm last:border-b-0 dark:border-zinc-800"
							>
								<div className="text-zinc-800 dark:text-zinc-100">
									<div className="font-medium">{new Date(session.startedAt).toLocaleString()}</div>
									<div className="text-xs text-zinc-500 dark:text-zinc-400">
										{session.endedAt ? `Ended: ${new Date(session.endedAt).toLocaleString()}` : "Active"}
									</div>
								</div>
								<button
									onClick={() => handleDeleteSession(session.id)}
									className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900"
								>
									Delete
								</button>
							</div>
						))}
					</div>
				</div>

				<div className="mt-8 flex items-center justify-between">
					<button
						onClick={handleDeleteUser}
						disabled={isDeletingUser}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 dark:focus:ring-offset-zinc-900"
					>
						{isDeletingUser ? "Deleting..." : "Delete user"}
					</button>
					<button
						onClick={onClose}
						className="text-sm text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						Done
					</button>
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Work hours (per day)</label>
				<div className="flex gap-2">
					<input
						type="number"
						min="1"
						value={hours}
						onChange={(e) => setHours(e.target.value)}
						className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
					/>
					<button
						onClick={handleSaveHours}
						className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
