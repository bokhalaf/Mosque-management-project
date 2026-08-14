"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ComplaintDetailsSection } from "../../../../presentation/sections/complaints";

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
