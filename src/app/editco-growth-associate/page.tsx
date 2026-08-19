export const dynamic = "force-dynamic";

import { getEGAFormConfig } from "@/actions/ega-form";
import { EGAForm } from "@/app/ega/EGAForm";

export const metadata = {
  title: "Editco Growth Associate | Editco",
  description:
    "Apply to the Editco Growth Associate program — real-world experience in business development, sales, and client acquisition.",
};

export default async function EditcoGrowthAssociatePage() {
  const config = await getEGAFormConfig();
  return <EGAForm config={config} />;
}
