import { ColumnsIcon, PlusIcon, StoreIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { VendorBoard } from "@/components/vendors/vendor-board";
import { getBudget, getVendors } from "@/lib/data";
import { m } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: m.vendors.title };

export default async function VendorsPage() {
  const [{ role }, vendors, { categories }] = await Promise.all([
    requireWedding(),
    getVendors(),
    getBudget(),
  ]);
  const editable = canEdit(role);

  return (
    <>
      <PageHeader
        title={m.vendors.title}
        action={
          editable ? (
            <Link
              href="/fornecedores/novo"
              aria-label={m.vendors.newVendor}
              className={buttonVariants({
                size: "icon-lg",
                variant: "secondary",
              })}
            >
              <PlusIcon aria-hidden="true" className="size-6" />
            </Link>
          ) : undefined
        }
      />
      {vendors.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title={m.vendors.emptyTitle}
          description={m.vendors.emptyDescription}
          action={
            editable ? (
              <Link
                href="/fornecedores/novo"
                className={buttonVariants({ size: "lg" })}
              >
                <PlusIcon aria-hidden="true" />
                {m.vendors.newVendor}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-subhead text-muted-foreground">
              {m.vendors.count(vendors.length)}
            </p>
            <Link
              href="/fornecedores/comparar"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
              )}
            >
              <ColumnsIcon aria-hidden="true" />
              {m.vendors.compare}
            </Link>
          </div>
          <VendorBoard
            vendors={vendors}
            categories={Object.fromEntries(
              categories.map((c) => [c.id, c.name]),
            )}
            editable={editable}
          />
        </div>
      )}
    </>
  );
}
