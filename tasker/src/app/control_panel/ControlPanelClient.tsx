"use client";

import CreateUserButton from "@/components/CreateUserButton";
import BtnUsersManager from "@/components/BtnUsersManager";
import BtnCreateProject from "@/components/BtnCreateProject";
import BtnAddTask from "@/components/BtnAddTask";
import BtnCreateSoloTask from "@/components/BtnCreateSoloTask";
import BtnUnfinishedProjects from "@/components/BtnUnfinishedProjects";
export default function ControlPanelClient() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-zinc-50 font-sans dark:bg-black">
            <main className="h-screen w-screen overflow-y-auto flex flex-col items-center py-12 px-4">
                <div className="w-full max-w-4xl">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                            Control Panel
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Manage users, projects, and tasks
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                👥 User Management
                            </h2>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                Create users, manage permissions, and view user details.
                            </p>
                            <div className="space-y-2">
                                <CreateUserButton />
                                <BtnUsersManager />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                📋 Project Management
                            </h2>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                Create projects, organize team members, and add tasks.
                            </p>
                            <div className="space-y-2">
                                <BtnCreateProject />
                                <BtnUnfinishedProjects />
                                <BtnAddTask />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                ⭐ Solo Tasks
                            </h2>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                Create standalone tasks and assign them to users.
                            </p>
                            <BtnCreateSoloTask />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
