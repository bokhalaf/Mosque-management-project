import { MosqueManagerProfileSection } from "../../presentation/sections/MosqueManagerProfileSection";

export const metadata = {
  title: "الملف الشخصي لمدير المسجد | نظام إدارة المسجد",
  description: "لوحة تعريف شاملة لمدير المسجد، بيانات المسجد، الصلاحيات المعتمدة، وإعدادات أمان الحساب.",
};

export default function ProfilePage() {
  return <MosqueManagerProfileSection />;
}
