import {
  AtSignIcon,
  BadgeCheckIcon,
  GlobeIcon,
  MailIcon,
  MessageCircleIcon,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { HirePanel } from "@/components/vendors/hire-panel";
import { VendorEditor } from "@/components/vendors/vendor-editor";
import { getBudget, getVendor } from "@/lib/data";
import { m } from "@/lib/i18n";
import { formatWholeBRL } from "@/lib/money";
import { canEdit } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: m.vendors.editVendor };

const action = cn(
  buttonVariants({ variant: "secondary", size: "lg" }),
  "flex-1 sm:flex-none",
);

export default async function VendorPage({
  params,
}: PageProps<"/fornecedores/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [{ role }, vendor, budget] = await Promise.all([
    requireWedding(),
    getVendor(id),
    getBudget(),
  ]);
  if (!vendor) notFound();
  const editable = canEdit(role);
  const expense = budget.expenses.find((e) => e.vendor_id === vendor.id);
  const whatsapp = vendor.phone ? whatsappLink(vendor.phone, "") : null;

  return (
    <>
      <PageHeader
        title={vendor.name}
        back={{ href: "/fornecedores", label: m.vendors.title }}
      />
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-2">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={action}
              aria-label={m.vendors.whatsapp(vendor.name)}
            >
              <MessageCircleIcon aria-hidden="true" />
              WhatsApp
            </a>
          )}
          {vendor.instagram && (
            <a
              href={`https://instagram.com/${vendor.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className={action}
            >
              <AtSignIcon aria-hidden="true" />
              {m.vendors.instagram}
            </a>
          )}
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className={action}
            >
              <GlobeIcon aria-hidden="true" />
              {m.vendors.website}
            </a>
          )}
          {vendor.email && (
            <a href={`mailto:${vendor.email}`} className={action}>
              <MailIcon aria-hidden="true" />
              {m.vendors.email}
            </a>
          )}
        </div>

        {expense ? (
          <Link
            href={`/orcamento/gastos/${expense.id}` as Route}
            className="flex min-h-14 items-center gap-3 rounded-2xl bg-card px-4 py-3"
          >
            <BadgeCheckIcon
              aria-hidden="true"
              className="size-6 text-success"
            />
            <span className="flex flex-col">
              <span className="text-body font-medium">
                {m.vendors.hiredBadge}
              </span>
              <span className="text-subhead text-link">
                {m.vendors.seeExpense}
              </span>
            </span>
          </Link>
        ) : (
          editable &&
          budget.categories.length > 0 && (
            <HirePanel vendor={vendor} categories={budget.categories} />
          )
        )}

        {editable ? (
          <VendorEditor vendor={vendor} categories={budget.categories} />
        ) : (
          <dl className="grid gap-4 rounded-2xl bg-card p-5 sm:grid-cols-2">
            {[
              [m.vendors.status, m.vendorStatus[vendor.status]],
              [
                m.vendors.quote,
                vendor.quote_cents ? formatWholeBRL(vendor.quote_cents) : null,
              ],
              [m.vendors.quoteDetails, vendor.quote_details],
              [m.vendors.contactName, vendor.contact_name],
              [m.vendors.phone, vendor.phone],
              [
                m.vendors.capacity,
                vendor.capacity
                  ? m.vendors.capacityValue(vendor.capacity)
                  : null,
              ],
              [
                m.vendors.rating,
                vendor.rating ? m.vendors.ratingValue(vendor.rating) : null,
              ],
              [m.vendors.notes, vendor.notes],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-footnote text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-body whitespace-pre-line">{value}</dd>
                </div>
              ))}
          </dl>
        )}
      </div>
    </>
  );
}
