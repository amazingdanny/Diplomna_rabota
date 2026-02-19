import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import EditUserClient from "./EditUserClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: PageProps) {
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

  const { id } = await params;

  return <EditUserClient userId={id} />;
}
