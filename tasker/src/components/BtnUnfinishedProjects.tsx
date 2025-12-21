"use client";
import React, { useState } from "react";
import UnfinishedProjects from "./UnfinishedProjects";

export default function BtnUnfinishedProjects() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-900 text-white py-3 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold"
      >
        {isOpen ? "Hide" : "Show"} Unfinished Projects
      </button>

      {isOpen && (
        <div className="mt-4">
          <UnfinishedProjects />
        </div>
      )}
    </>
  );
}
