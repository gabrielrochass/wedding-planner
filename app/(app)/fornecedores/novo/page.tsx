import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { VendorEditor } from "@/components/vendors/vendor-editor";
import { getBudget } from "@/lib/data";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.vendors.newVendor };

export default async function NewVendorPage() {
  const { categories } = await getBudget();
  return (
    <>
      <PageHeader
        title={m.vendors.newVendor}
        back={{ href: "/fornecedores", label: m.vendors.title }}
      />
      <VendorEditor vendor={null} categories={categories} />
    </>
  );
}
