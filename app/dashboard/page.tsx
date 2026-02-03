import { protectRoute } from "@/lib/session";

export default async function DashboardPage() {
  const user = await protectRoute("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600">Your notes will be listed here</p>
      </div>
    </div>
  );
}
