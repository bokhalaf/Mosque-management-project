"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { DonationDetailsSection } from "../../../presentation/sections/DonationDetailsSection";

export default function DonationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <DonationDetailsSection 
      donationId={id}
      onBack={() => router.push("/donations")}
    />
  );
}
