import { getCurrentUser } from "@/lib/session";

export default async function TestSessionPage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Session Test Page</h1>
      <pre>{JSON.stringify({ user }, null, 2)}</pre>
    </div>
  );
}
