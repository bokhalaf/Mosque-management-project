import { VolunteerManagementSection } from "../../presentation/sections/VolunteerManagementSection";

export const metadata = {
  title: "إدارة المتطوعين والفرص التطوعية | نظام إدارة المسجد",
  description: "مسار عمل كامل لمدير المسجد لإنشاء الفرص التطوعية، قبول المتقدمين، إسناد المهام، وتسجيل الساعات والشهادات.",
};

export default function VolunteersPage() {
  return <VolunteerManagementSection />;
}
