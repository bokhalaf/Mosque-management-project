import { VolunteerManagementSection } from "../../../presentation/sections/VolunteerManagementSection";

export const metadata = {
  title: "طلبات التقديم للتطوع | نظام إدارة المسجد",
  description: "مراجعة وقبول أو رفض طلبات التقديم الواردة من المتطوعين.",
};

export default function ApplicationsPage() {
  return <VolunteerManagementSection />;
}
