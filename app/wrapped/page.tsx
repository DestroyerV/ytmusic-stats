import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { WrappedExperience } from "./components/WrappedExperience";

export const metadata = {
  title: "Your 2024 Wrapped | YTMusic Stats",
  description: "Discover your YouTube Music listening journey",
};

export default async function WrappedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <WrappedExperience
      userId={session.user.id}
      userName={session.user.name || "Music Lover"}
    />
  );
}
