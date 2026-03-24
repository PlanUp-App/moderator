import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "../components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar";
import UserMenu from "../components/UserMenu";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    const isAuthenticated = context.auth.isAuthenticated;

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.pathname, // optional: save the page they wanted
        },
      });
    }
  },
  component: Layout,
});

function Layout() {
  return (
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
  );
}
