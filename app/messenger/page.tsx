import { getServerUser, getServerProfile } from "@/lib/appwrite/server";
import { redirect } from "next/navigation";
import MessengerClient from "./MessengerClient";
import { getMyConversations, getAllUsers } from "@/lib/messenger/actions";
import { ROLE_LEVELS, RoleType } from "@/lib/roles";
import MessengerAccessDenied from "./MessengerAccessDenied";

export const metadata = {
  title: "Messenger | Xóm Nhà Lá",
  description: "Nhắn tin và gọi video trực tuyến",
};

export default async function MessengerPage() {
  // Server-side auth check
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirect=/messenger");
  }

  const profile = await getServerProfile(user.$id);
  const role = (profile?.role || "no_le") as RoleType;
  const currentLevel = ROLE_LEVELS[role] || ROLE_LEVELS.no_le;
  const minLevel = ROLE_LEVELS.pham_nhan;

  if (currentLevel < minLevel) {
    return <MessengerAccessDenied />;
  }

  // Prefetch data on server
  const [conversations, users] = await Promise.all([
    getMyConversations(user.$id),
    getAllUsers(),
  ]);

  return (
    <MessengerClient
      currentUser={{
        $id: user.$id,
        name: user.name,
        email: user.email,
        displayName: profile?.displayName || user.name,
        avatarUrl: profile?.avatarUrl || null,
        role: profile?.role || null,
      }}
      initialConversations={conversations}
      initialUsers={users.filter((u) => u.userId !== user.$id)}
    />
  );
}
