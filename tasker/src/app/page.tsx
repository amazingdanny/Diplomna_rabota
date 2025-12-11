import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WorkManager from "@/components/WorkManager";


export default async function Home() {
   const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/login");
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <WorkManager />
      </main>
    </div>
  );
}
