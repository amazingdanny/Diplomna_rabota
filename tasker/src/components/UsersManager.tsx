'use client'
import { useEffect, useState } from "react";
    import EditUserMenu from "./EditUserMenu";

type UserItem = {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	role: string;
	createdAt: string;
};

export default function UsersManager() {
	const [users, setUsers] = useState<UserItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editingUser, setEditingUser] = useState<UserItem | null>(null);

	const loadUsers = async () => {
		try {
			const res = await fetch("/api/users/list");
			const data = await res.json();
			if (!res.ok || !data.success) {
				throw new Error(data.message || "Failed to load users");
			}
			setUsers(data.users || []);
		} catch (err: any) {
			setError(err.message || "Failed to load users");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadUsers();
	}, []);

	return (
		<div className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Users</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">Listing all USER accounts.</p>
				</div>
			</div>

			{isLoading && <p className="text-sm text-zinc-500">Loading users...</p>}
			{error && <p className="text-sm text-red-500">{error}</p>}

			{!isLoading && !error && (
				<div className="overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
					<table className="min-w-full text-sm text-left">
						<thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
							<tr>
								<th className="px-4 py-3">Name</th>
								<th className="px-4 py-3">Email</th>
								<th className="px-4 py-3">Created</th>
								<th className="px-4 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id} className="border-t border-zinc-200 dark:border-zinc-800">
									<td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
										{user.firstName || user.lastName
											? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
											: '—'}
									</td>
									<td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{user.email}</td>
									<td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
										{new Date(user.createdAt).toLocaleDateString()}
									</td>
									<td className="px-4 py-3 text-right">
										<button
											className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
											onClick={() => setEditingUser(user)}
										>
											Edit
										</button>
									</td>
								</tr>
							))}
							{users.length === 0 && (
								<tr>
									<td className="px-4 py-4 text-sm text-zinc-500" colSpan={4}>
										No users found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

				{editingUser && (
					<EditUserMenu
						user={editingUser}
						onClose={() => setEditingUser(null)}
						onChanged={async () => {
							await loadUsers();
						}}
					/>
				)}
		</div>
	);
}
