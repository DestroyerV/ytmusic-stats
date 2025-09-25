import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { HomeContent } from "@/components/HomeContent";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return <HomeContent />;
}
