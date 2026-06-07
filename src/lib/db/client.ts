import { createClient } from "@/lib/supabase/server";

export async function getDbClient() {
  return createClient();
}
