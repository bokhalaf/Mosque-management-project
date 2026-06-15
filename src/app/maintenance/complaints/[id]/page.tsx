"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ComplaintDetailsSection } from "../../../../presentation/sections/ComplaintDetailsSection";

export default function ComplaintDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <ComplaintDetailsSection 
      complaintId={id}
      onBack={() => router.push("/maintenance/complaints")}
    />
  );
}
