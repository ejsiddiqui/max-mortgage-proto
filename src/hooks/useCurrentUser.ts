import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentUser() {
  const user = useQuery(api.users.viewer);
  return {
    user,
    isLoading: user === undefined,
    isAuthenticated: user !== null && user !== undefined,
    role: user?.role,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
    isViewer: user?.role === "viewer",
  };
}
