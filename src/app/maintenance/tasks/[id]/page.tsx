"use client";

import { useRouter, useParams } from "next/navigation";
import { MaintenanceTaskDetailsSection } from "../../../../presentation/sections/MaintenanceTaskDetailsSection";

export default function MaintenanceTaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <MaintenanceTaskDetailsSection 
      taskId={id}
      onBack={() => router.push("/maintenance/tasks")}
    />
  );
}
