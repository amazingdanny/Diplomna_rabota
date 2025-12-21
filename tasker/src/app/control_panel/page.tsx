import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import ControlPanelClient from "./ControlPanelClient";

export default async function ControlPanelPage() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  // Decode JWT to check role server-side
  try {
    const decoded = jwtDecode<{ role: string }>(token);
    if (decoded.role !== "ADMIN") {
      redirect("/");
    }
  } catch {
    redirect("/login");
  }

  return <ControlPanelClient />;
}
