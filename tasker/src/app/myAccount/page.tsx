import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MyAccountClient from "./MyAccountClient";

export default async function MyAccountPage() {
   const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  return <MyAccountClient />;
}
