import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminProviders } from "@/components/providers/admin-providers";

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
    <AdminProviders>
      <div className="min-h-screen bg-[#020617]">
        {children}
      </div>
    </AdminProviders>
  );
}
