import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UploadContent } from "@/app/upload/components/UploadContent";
import { auth } from "@/lib/auth/config";

export default async function UploadPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <UploadContent userName={session.user.name || undefined} />
      </div>
    </div>
  );
}
