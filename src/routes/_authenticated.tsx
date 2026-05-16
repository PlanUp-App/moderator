import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "../components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar";
import UserMenu from "../components/UserMenu";
import { ChangePasswordModal } from "@/components/ChangePassword";
import { useAuth } from "@/auth/useAuth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    const isAuthenticated = context.auth.isAuthenticated;

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.pathname,
        },
      });
    }
  },

  component: Layout,
});

function Layout() {
  const { user } = useAuth();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (user?.mustChangePassword) {
      setIsChangePasswordOpen(true);
    }
  }, [user]);

  return (
    <>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex items-center justify-end px-16 py-4">
            <UserMenu />
          </header>
          <main className="px-16">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        description="Your account requires a password change. Please set a new password to continue."
      />
    </>
  );
}
