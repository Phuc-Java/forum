import ChatPageClient from "./ChatPage.client";
import { getServerUser, getServerProfile } from "@/lib/appwrite/server";
import { ChatAccessDenied } from "./ChatAccessDenied";

// Các role được phép truy cập chat
const ALLOWED_ROLES = ["chi_cuong_gia", "thanh_nhan", "chi_ton"];

export default async function Page() {
  const user = await getServerUser();
  if (!user) return <ChatAccessDenied minRole="Chí Cường Giả" />;

  const profile = await getServerProfile(user.$id);
  const role = profile?.role || "";
  const hasAccess = ALLOWED_ROLES.includes(role);

  if (!hasAccess) return <ChatAccessDenied minRole="Chí Cường Giả" />;

  return <ChatPageClient initialHasAccess={true} initialChecking={false} />;
}
