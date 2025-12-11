"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { z } from "zod";
import CreateUserButton from "@/components/CreateUserButton";
import BtnUsersManager from "@/components/BtnUsersManager";


export default function ControlPanelPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("USER");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [roleError, setRoleError] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/me");
                const data = await response.json();

                if (!response.ok || !data.user) {
                    router.push("/login");
                    return;
                }
                
                if (data.user.role !== "ADMIN") {
                    router.push("/");
                    return;
                }

                setIsChecking(false);
            } catch (error) {
                router.push("/login");
            }
        };

        checkAuth();
    }, [router]);

    

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
                <div className="text-black dark:text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
                <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
                    Control Panel
                </h1>

                <div className="w-full flex flex-col items-center gap-8">
                    <CreateUserButton />
                    <BtnUsersManager />
                </div>
            </main>
        </div>
    );
}