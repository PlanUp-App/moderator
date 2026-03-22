import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { AuthState } from "../auth/AuthContext";
import { Toaster } from "sonner";

interface MyRouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster
        position="top-center"
        toastOptions={{ descriptionClassName: "pup-body-md-400" }}
      />
    </>
  ),
});
