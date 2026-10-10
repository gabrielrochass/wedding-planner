import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { signInPath } from "@/lib/auth-paths";
import type { Database } from "./database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {}
        },
      },
    },
  );
}

export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) redirect(signInPath());
  return { supabase, userId: data.claims.sub, claims: data.claims };
});

const weddingColumns =
  "id, partner_a, partner_b, wedding_date, date_is_estimate, city, ceremony, guest_estimate, budget_cents, contingency_percent, motto";

export const requireWedding = cache(async () => {
  const user = await requireUser();
  const { supabase, userId } = user;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, current_wedding_id")
    .eq("id", userId)
    .single();
  if (error) throw error;
  const weddingId = profile.current_wedding_id;
  if (!weddingId) redirect("/comecar");

  const [wedding, member] = await Promise.all([
    supabase
      .from("weddings")
      .select(weddingColumns)
      .eq("id", weddingId)
      .maybeSingle(),
    supabase
      .from("wedding_members")
      .select("role")
      .eq("wedding_id", weddingId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (wedding.error) throw wedding.error;
  if (member.error) throw member.error;
  if (!wedding.data || !member.data) redirect("/comecar");

  return {
    ...user,
    displayName: profile.display_name,
    wedding: wedding.data,
    role: member.data.role,
  };
});

export type WeddingContext = Awaited<ReturnType<typeof requireWedding>>;
export type Wedding = WeddingContext["wedding"];
