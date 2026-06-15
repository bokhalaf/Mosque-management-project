"use client";

import { useRouter } from "next/navigation";
import { CreateCampaignSection } from "../../../../presentation/sections/CreateCampaignSection";

export default function CreateCampaignPage() {
  const router = useRouter();
  return (
    <CreateCampaignSection 
      onBack={() => router.push("/donations/campaigns")}
    />
  );
}
