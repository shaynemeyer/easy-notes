import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function protectRoute(requestedPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    const callbackUrl = encodeURIComponent(requestedPath);
    redirect(`/authenticate?callbackUrl=${callbackUrl}`);
  }

  return user;
}

export async function protectLayout() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/authenticate");
  }
  return user;
}

export function isValidCallbackUrl(url: string): boolean {
  // Ensure URL is relative and not protocol-relative (//evil.com)
  return url.startsWith("/") && !url.startsWith("//");
}
