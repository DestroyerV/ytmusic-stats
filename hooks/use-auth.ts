import { useSession } from "@/lib/auth/client";

export function useAuth() {
  const session = useSession();

  return {
    user: session.data?.user || null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
  };
}
