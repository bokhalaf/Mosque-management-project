"use client";

import { useRouter } from "next/navigation";
import { ComplaintsSection } from "../../../presentation/sections/ComplaintsSection";

export default function ComplaintsPage() {
  const router = useRouter();
  return (
    <ComplaintsSection 
      onViewComplaintDetails={(id) => router.push(`/maintenance/complaints/${id}`)}
    />
  );
}
