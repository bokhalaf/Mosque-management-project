'use client';
import { useParams, useRouter } from "next/navigation";
import { TameemDetailsSection } from "../../../presentation/sections/tameems";

export default function TameemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  return (
    <TameemDetailsSection 
      tameemId={id} 
      onBack={() => router.push('/tameems')}
    />
  );
}
