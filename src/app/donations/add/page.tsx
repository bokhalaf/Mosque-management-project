"use client";

import { useRouter } from "next/navigation";
import { AddDonationSection } from "../../../presentation/sections/AddDonationSection";

export default function AddDonationPage() {
  const router = useRouter();
  return (
    <AddDonationSection 
      onBack={() => router.push("/donations")}
    />
  );
}
