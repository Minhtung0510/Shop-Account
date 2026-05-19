import { AdminNotificationToasts } from "@/components/shared/admin-notification";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNotificationToasts />
      {children}
    </>
  );
}
