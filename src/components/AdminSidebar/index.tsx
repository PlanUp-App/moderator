import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import {
  MdOutlineDashboard,
  MdOutlinePeopleAlt,
  MdOutlineFlag,
  MdOutlineManageAccounts,
  MdOutlineListAlt,
} from "react-icons/md";
import { useAuth } from "@/auth/useAuth";
import { useEffect } from "react";

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        data-active={isActive}
        className="flex gap-3 px-4 py-2 h-10 [&>svg]:size-6! rounded-2 text-neutral-black data-[active=true]:bg-white data-[active=true]:text-dark-blue data-[active=true]:shadow-[1px_2px_5px_rgba(0,0,0,0.08)]"
        asChild
      >
        <Link to={to}>
          <Icon className="size-6" />
          <span className="pup-body-md-500">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminSidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="bg-off-white">
        <div className="my-4 mx-6">
          <Link to="/dashboard">
            <img src="/planup-logo.svg" width="100px" />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-off-white px-4">
        <SidebarMenu className="gap-2">
          <NavItem
            to="/dashboard"
            icon={MdOutlineDashboard}
            label="Dashboard"
          />
          <NavItem to="/reports" icon={MdOutlineFlag} label="Reports" />
          <NavItem to="/users" icon={MdOutlinePeopleAlt} label="Users" />
          <NavItem to="/plans" icon={MdOutlineListAlt} label="Plans" />
          {isAdmin && (
            <NavItem
              to="/moderators"
              icon={MdOutlineManageAccounts}
              label="Moderators"
            />
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
