'use client';
import { useRouter } from "next/navigation";
import { CreateKhutbahSection } from "../../../presentation/sections/CreateKhutbahSection";

export default function CreateSermonPage() {
  const router = useRouter();
  return <CreateKhutbahSection onBack={() => router.push('/sermons')} />;
}
