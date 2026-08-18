import { OpportunityDetailsSection } from "../../../../presentation/sections/volunteers/OpportunityDetailsSection";

export const metadata = {
  title: "تفاصيل الفرصة التطوعية | نظام إدارة المسجد",
  description: "عرض تفاصيل الفرصة التطوعية، إسناد المهام للمتطوعين، تسجيل الساعات، وإصدار الشهادات.",
};

interface OpportunityDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityDetailsPage({ params }: OpportunityDetailsPageProps) {
  const resolvedParams = await params;
  return <OpportunityDetailsSection opportunityId={resolvedParams.id} />;
}
