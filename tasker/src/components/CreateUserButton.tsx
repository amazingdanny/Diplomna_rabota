"use client";

import { useState } from "react";
import CreateUserForm from "./CreateUserForm";

export default function CreateUserButton() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="w-full max-w-md">
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold"
                >
                    Create New User
                </button>
            ) : (
                <div>
                    <button
                        onClick={() => setShowForm(false)}
                        className="mb-4 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ← Back
                    </button>
                    <CreateUserForm />
                </div>
            )}
        </div>
    );
}
