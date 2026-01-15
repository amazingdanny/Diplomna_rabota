'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BtnUserTasks from "@/components/BtnUserTasks";
import Link from "next/link";
import WorkCalendar from "@/components/WorkCalendar";
import ListTicketsToYou from "@/components/ListTicketsToYou";

export default function MyAccountClient() {
   const router = useRouter();
   const [isAdmin, setIsAdmin] = useState(false);
   const [dayTotals, setDayTotals] = useState<{ [date: string]: number }>({});
   const [targetHours, setTargetHours] = useState(8);
   const [loading, setLoading] = useState(true);
   
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/me");
                
                if (!response.ok) {
                    router.push("/login");
                    return;
                }
                
                const data = await response.json();
                
                if (data.user?.role === "ADMIN") {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                router.push("/login");
            }
        };

        fetchData();
    }, [router]);

    useEffect(() => {
        async function fetchDailyTotals() {
            try {
                const response = await fetch("/api/me");
                
                if (!response.ok) {
                    router.push("/login");
                    return;
                }
                
                const data = await response.json();
                const dailyTotalsResponse = await fetch("/api/users/dailyTotals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({userId: data.user.id}),
                });
                const dailyTotalsData = await dailyTotalsResponse.json();
                setDayTotals(dailyTotalsData.dailyTotals);
                setTargetHours(data.user.hours);
            }
            catch (error) {
                console.error("Error fetching daily totals:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        }
        fetchDailyTotals();
    }, [router]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 font-sans dark:bg-black">
                <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-zinc-50 font-sans dark:bg-black">
            <main className="h-screen w-screen overflow-y-auto py-12">
                

                <div className="flex gap-6">
                    <div className="w-full max-w-md flex-shrink-0 pl-4">
                         <ListTicketsToYou />
                    </div>

                    <div className="flex-1 flex pr-4">
                        <div className="w-full max-w-2xl ml-30">
                        <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <BtnUserTasks/>
                                {isAdmin && (
                                    <Link href="/control_panel" className="block">
                                        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 font-semibold transition">
                                            Go to Control Panel
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                                Work Calendar
                            </h2>
                            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                                Daily hours vs target ({targetHours || 8}h). Colors: blue &gt; target+1h, green = target, orange = target-1h, red &lt; target-1h.
                            </p>
                            <WorkCalendar dayTotals={dayTotals} targetHours={targetHours || 8} />
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
