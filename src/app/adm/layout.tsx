import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {children}
    </div>
  );
}
