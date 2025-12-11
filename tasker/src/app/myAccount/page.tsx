'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";
import Link from "next/link";

export default function MyAccountPage() {
   const router = useRouter();
   const [isAdmin, setIsAdmin] = useState(false);
   
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/me");
                const data = await response.json();

                if (!response.ok || !data.user) {
                    router.push("/login");
                    return;
                }
                
                // data.user is already decoded by the API
                if (data.user.role === "ADMIN") {
                    setIsAdmin(true);
                }

            } catch (error) {
                router.push("/login");
            }
        };

        checkAuth();
    }, [router]);



    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
                <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
                    My Account
                </h1>

                <div className="w-full max-w-md">
                    <p className="text-lg text-black dark:text-zinc-50 mb-6">
                        Welcome to your account page. Here you can manage your personal information and settings.
                    </p>

                    {isAdmin && (
                        <Link href="/control_panel">
                            <button className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold">
                                Go to Control Panel
                            </button>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}