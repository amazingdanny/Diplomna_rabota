"use client";

import { useState } from "react";
import { z } from "zod";

const createUserSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(["USER", "ADMIN"]),
    hours: z.number().int().min(1, "Work hours must be at least 1"),
});

export default function CreateUserForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("USER");
    const [hours, setHours] = useState("8");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [roleError, setRoleError] = useState("");
    const [hoursError, setHoursError] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setEmailError("");
        setPasswordError("");
        setFirstNameError("");
        setLastNameError("");
        setRoleError("");
        setFormError("");
        setSuccessMessage("");
        const parsedHours = Number(hours);
        const result = createUserSchema.safeParse({ email, password, firstName, lastName, role, hours: parsedHours });
        if (!result.success) {
            const issues = result.error.flatten((issue) => issue.message).fieldErrors;
            setEmailError(issues.email?.[0] || "");
            setPasswordError(issues.password?.[0] || "");
            setFirstNameError(issues.firstName?.[0] || "");
            setLastNameError(issues.lastName?.[0] || "");
            setRoleError(issues.role?.[0] || "");
            setHoursError(issues.hours?.[0] || "");
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch("/api/users/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, firstName, lastName, role, hours: parsedHours }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage("User created successfully!");
                setEmail("");
                setPassword("");
                setFirstName("");
                setLastName("");
                setRole("USER");
                setHours("8");
            } else {
                setFormError(data.error || "Failed to create user");
            }
        } catch (error) {
            setFormError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
                Create New User
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        placeholder="John"
                    />
                    {firstNameError && (
                        <p className="mt-1 text-sm text-red-500">{firstNameError}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        placeholder="Doe"
                    />
                    {lastNameError && (
                        <p className="mt-1 text-sm text-red-500">{lastNameError}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="hours"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Work Hours (per day)
                    </label>
                    <input
                        type="number"
                        id="hours"
                        min="1"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        placeholder="8"
                    />
                    {hoursError && (
                        <p className="mt-1 text-sm text-red-500">{hoursError}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        placeholder="user@example.com"
                    />
                    {emailError && (
                        <p className="mt-1 text-sm text-red-500">{emailError}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        placeholder="Enter password"
                    />
                    {passwordError && (
                        <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Role
                    </label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    {roleError && (
                        <p className="mt-1 text-sm text-red-500">{roleError}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    {isLoading ? "Creating..." : "Create User"}
                </button>

                {formError && (
                    <div className="mt-3 rounded-md bg-red-100 p-3 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {formError}
                    </div>
                )}

                {successMessage && (
                    <div className="mt-3 rounded-md bg-green-100 p-3 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {successMessage}
                    </div>
                )}
            </form>
        </div>
    );
}
