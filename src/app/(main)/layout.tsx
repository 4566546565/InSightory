import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user ? { name: user.name, email: user.email, role: user.role } : null} />
        <main className="flex-1 overflow-y-auto relative">{children}</main>
      </div>
    </div>
  );
}
