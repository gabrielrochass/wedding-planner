import { Suspense } from "react";
import { SideNav } from "@/components/app-shell/side-nav";
import { TabBar } from "@/components/app-shell/tab-bar";
import { Tour } from "@/components/onboarding/tour";
import { m } from "@/lib/i18n";
import { canEdit, canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { wedding, role, toursSeen } = await requireWedding();
  const canAdd = canHelp(role);
  const editor = canEdit(role);

  return (
    <>
      <div className="flex min-h-dvh">
        <SideNav
          couple={m.home.couple(wedding.partner_a, wedding.partner_b)}
          canAdd={canAdd}
          canEdit={editor}
        />
        <main
          id="conteudo"
          tabIndex={-1}
          className="mx-auto w-full max-w-3xl min-w-0 px-4 pt-6 pb-[calc(var(--bottom-inset)+2rem)] sm:px-6 md:pt-10"
        >
          {children}
        </main>
      </div>
      <TabBar canAdd={canAdd} canEdit={editor} />
      <Suspense>
        <Tour seen={toursSeen} />
      </Suspense>
    </>
  );
}
