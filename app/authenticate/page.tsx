import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in - Easy Notes",
  description: "Sign in to your account or create a new one",
};

interface AuthenticatePageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function AuthenticatePage({
  searchParams,
}: AuthenticatePageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const mode = params.mode === "register" ? "register" : "login";

  return <AuthForm mode={mode} />;
}
