import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WorkManager from "@/components/WorkManager";
import ToDo from "@/components/ToDo";
import UserProjects from "@/components/UserProjects";
import BtnCreateTicket from "@/components/BtnCreateTicket";


export default async function Home() {
   const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/login");
  }


  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <main className="h-screen w-screen overflow-hidden flex gap-7 bg-white dark:bg-black">
        <div className="flex-1 overflow-y-auto pt-24 px-4">
          <ToDo />
        </div>
        <div className="flex-1  flex items-start justify-center pt-6">
          <WorkManager />
        </div>
        <div className="flex-1 overflow-y-auto pt-24 px-4">
          <UserProjects />
          <BtnCreateTicket />
        </div>

      </main>
    </div>
  );
}
