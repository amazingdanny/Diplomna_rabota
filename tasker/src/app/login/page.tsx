"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {z} from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setFormError("");
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const issues = result.error.flatten((issue) => issue.message).fieldErrors;
      setEmailError(issues.email?.[0] || "");
      setPasswordError(issues.password?.[0] || "");
      return;
    }
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      setFormError(data.message || "Login failed");
      return;
    }

    router.push("/"); // Redirect to home
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {emailError && <p className="text-red-500 text-sm mb-3">{emailError}</p>}

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {passwordError && <p className="text-red-500 text-sm mb-3">{passwordError}</p>}
        {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
