"use client";

import { useParams, useRouter } from "next/navigation";
import { CampaignDetailsSection } from "../../../../presentation/sections/CampaignDetailsSection";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = (params?.id as string) || "";

  return (
    <CampaignDetailsSection
      campaignId={campaignId}
      onBack={() => router.push("/donations/campaigns")}
    />
  );
}
