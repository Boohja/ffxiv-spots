import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Next.js Learning Skeleton</h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          This starter is intentionally incomplete. Follow the TODOs in the code
          to implement Discord auth, database access, and file uploads yourself.
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Example UI Components</h2>
        <div className="max-w-md space-y-3">
          <Input placeholder="Search spots..." />
          <div className="flex items-center gap-2">
            <Button type="button">Primary Action</Button>
            <Button type="button" variant="ghost">
              Secondary Action
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-lg font-semibold">Routes To Explore</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/favorites" className="underline underline-offset-4">
              /favorites
            </Link>{" "}
            example route for user-specific data.
          </li>
          <li>
            <code>/api/auth/discord</code> callback placeholder route.
          </li>
          <li>
            <code>/api/upload</code> upload placeholder route.
          </li>
        </ul>
      </section>
    </main>
  );
}
