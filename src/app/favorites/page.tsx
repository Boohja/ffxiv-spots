import { Button } from "@/components/ui/Button";

export default function FavoritesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
      <p className="text-sm text-zinc-600">
        This route is intentionally simple. Next step: fetch user-specific favorites
        from your database and render them here.
      </p>
      <Button type="button">Load Favorites (TODO)</Button>
    </main>
  );
}
