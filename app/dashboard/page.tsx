import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Navigation } from "@/components/Navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-foreground rounded-full" />
            <h1 className="text-3xl font-bold tracking-tight">
              Your Music Journey
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover insights and patterns from your YouTube Music listening
            history
          </p>
          {session.user.name && (
            <p className="text-sm text-muted-foreground/80">
              Welcome back, {session.user.name}! 🎵
            </p>
          )}
        </div>

        <DashboardContent userId={session.user.id} />
      </div>
    </div>
  );
}
