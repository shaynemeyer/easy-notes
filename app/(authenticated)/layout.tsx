import { protectLayout } from "@/lib/session";
import { Header } from "@/components/header";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectLayout();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main>{children}</main>
    </div>
  );
}
