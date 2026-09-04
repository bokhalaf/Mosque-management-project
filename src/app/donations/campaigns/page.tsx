"use client";

import { useRouter } from "next/navigation";
import { CampaignsSection } from "../../../presentation/sections/campaigns/CampaignsSection";

export default function CampaignsPage() {
  const router = useRouter();
  return (
    <CampaignsSection 
      onCreateCampaign={() => router.push("/donations/campaigns/create")}
      onViewCampaignDetails={(id) => router.push(`/donations/campaigns/${id}`)}
    />
  );
}
