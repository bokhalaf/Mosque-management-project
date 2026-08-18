"use client";

import { useRouter } from "next/navigation";
import { CreateMosqueSection } from "../../../presentation/sections/mosques";

export default function CreateMosquePage() {
  const router = useRouter();
  return (
    <CreateMosqueSection 
      onBack={() => router.push("/mosques")}
    />
  );
}
