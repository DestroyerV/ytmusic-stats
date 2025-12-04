import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HomeContent } from "@/components/HomeContent";
import { auth } from "@/lib/auth/config";

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
