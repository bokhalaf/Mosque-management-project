'use client';
import { useRouter } from "next/navigation";
import { CreateSermonSection } from "../../../presentation/sections/sermons";

export default function CreateSermonPage() {
  const router = useRouter();
  return <CreateSermonSection onBack={() => router.push('/sermons')} />;
}
