'use client'
import { useState, useEffect } from "react";

export default function CreateNote() {
    const [noteContent, setNoteContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSaveNote = async () => {
        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");
        const response = await fetch('/api/me');
        const data = await response.json();
        const userID = data.user.id;

        try {
            const response = await fetch("/api/createNote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: noteContent, userId: userID }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save note");
            }

            setSuccessMessage("Note saved successfully!");
            setNoteContent("");
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Create Note</h2>
            <textarea
                className="w-full p-2 border rounded mb-4"
                rows={5}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
            />
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                onClick={handleSaveNote}
                disabled={isSaving}
            >
                {isSaving ? "Saving..." : "Save Note"}
            </button>
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </div>
    );
}