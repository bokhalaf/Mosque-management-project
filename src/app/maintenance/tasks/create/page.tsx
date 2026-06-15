"use client";

import { useRouter } from "next/navigation";
import { CreateMaintenanceRequestSection } from "../../../../presentation/sections/CreateMaintenanceRequestSection";

export default function CreateMaintenanceTaskPage() {
  const router = useRouter();
  return (
    <CreateMaintenanceRequestSection 
      onBack={() => router.push("/maintenance/tasks")}
    />
  );
}
