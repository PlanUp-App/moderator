import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { AuthState } from "../auth/AuthContext";

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
