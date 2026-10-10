import { NextResponse } from "next/server";
import { defaultContingency, plannedByCategory } from "@/lib/budget";
import { starterTasks } from "@/lib/checklist";
import { addDays, todayInSaoPaulo } from "@/lib/dates";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { tourIds } from "@/lib/tour";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (
    process.env.DEV_AUTH !== "1" ||
    process.env.VERCEL_ENV ||
    !["localhost", "127.0.0.1"].includes(url.hostname)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const alias = url.searchParams.get("as");
  const devUser = {
    email:
      alias && /^[a-z0-9-]{1,32}$/.test(alias)
        ? `e2e-${alias}@doisemum.local`
        : (process.env.DEV_AUTH_EMAIL ?? "dev@doisemum.local"),
    password: "dev-only-local-password",
  };

  await createAdminClient().auth.admin.createUser({
    ...devUser,
    email_confirm: true,
    user_metadata: { full_name: "Ana Teste" },
  });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(devUser);
  if (error) throw error;

  if (alias) {
    const fresh = url.searchParams.get("tours") === "1";
    await supabase
      .from("profiles")
      .update({ tours_seen: fresh ? [] : [...tourIds] })
      .eq("id", data.user.id);
  }

  if (url.searchParams.get("sem-casamento") !== "1") {
    const { count } = await supabase
      .from("wedding_members")
      .select("wedding_id", { count: "exact", head: true })
      .eq("user_id", data.user.id);
    if (!count) {
      const budget = 8_000_000;
      const { error: weddingError } = await supabase.rpc("create_wedding", {
        p_id: crypto.randomUUID(),
        p_partner_a: "Ana",
        p_partner_b: "Bruno",
        p_ceremony: "both",
        p_tasks: starterTasks("both"),
        p_categories: plannedByCategory(budget, defaultContingency),
        p_date: addDays(todayInSaoPaulo(), 500),
        p_city: "Recife",
        p_guest_estimate: 150,
        p_budget_cents: budget,
      });
      if (weddingError) throw weddingError;
    }
  }

  const target = new URL(url.searchParams.get("next") ?? "/", url);
  return NextResponse.redirect(
    target.origin === url.origin ? target : new URL("/", url),
  );
}
