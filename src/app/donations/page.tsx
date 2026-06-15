"use client";

import { useRouter } from "next/navigation";
import { DonationsSection } from "../../presentation/sections/DonationsSection";

export default function DonationsPage() {
  const router = useRouter();
  return (
    <DonationsSection 
      onAddDonation={() => router.push("/donations/add")}
      onViewDonationDetails={(id) => router.push(`/donations/${id}`)}
    />
  );
}
