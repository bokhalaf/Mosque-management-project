'use client';
import { useParams, useRouter } from "next/navigation";
import { SermonDetailsSection } from "../../../presentation/sections/sermons";

export default function SermonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  return (
    <SermonDetailsSection 
      sermonId={id} 
      onBack={() => router.push('/sermons')}
      onSelectForFriday={() => {
        router.push('/sermons');
      }}
    />
  );
}
