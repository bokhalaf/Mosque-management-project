"use client";

import { useRouter } from "next/navigation";
import { MaintenanceTasksSection } from "../../../presentation/sections/maintenance";

export default function MaintenanceTasksPage() {
  const router = useRouter();
  return (
    <MaintenanceTasksSection 
      onViewTaskDetails={(id) => router.push(`/maintenance/tasks/${id}`)}
      onCreateTask={() => router.push("/maintenance/tasks/create")}
    />
  );
}
