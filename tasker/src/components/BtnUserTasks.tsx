'use client'

import { useState } from "react";
import UserTasks from "./UserTasks";

export default function BtnUserTasks() {
  const [showTasks, setShowTasks] = useState(false);

  if (showTasks) {
    return (
      <div className="w-full max-w-4xl">
        <button
          onClick={() => setShowTasks(false)}
          className="mb-4 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back
        </button>
        <UserTasks />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <button
        onClick={() => setShowTasks(true)}
        className="w-full bg-zinc-900 text-white py-3 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold"
      >
        View My Tasks
      </button>
    </div>
  );
}
