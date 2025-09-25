import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadArea } from "@/components/upload-area";
import { Navigation } from "@/components/Navigation";
import { Upload, Info } from "lucide-react";
import { UploadContent } from "@/components/UploadContent";

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
