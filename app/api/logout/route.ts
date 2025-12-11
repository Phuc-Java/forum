import { cookies } from "next/headers";
import { Client, Account } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Get session from cookies
    const sessionCookie =
      cookieStore.get("appwrite-session") ||
      cookieStore.get(`a_session_${APPWRITE_CONFIG.projectId}`) ||
      cookieStore.get(`a_session_${APPWRITE_CONFIG.projectId}_legacy`);

    if (sessionCookie?.value) {
      // Create client with session
      const client = new Client()
        .setEndpoint(APPWRITE_CONFIG.endpoint)
        .setProject(APPWRITE_CONFIG.projectId)
        .setSession(sessionCookie.value);

      const account = new Account(client);

      try {
        // Delete current session
        await account.deleteSession("current");
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    }

    // Clear all auth cookies
    const cookiesToClear = [
      "appwrite-session",
      "appwrite-user",
      "session",
      `a_session_${APPWRITE_CONFIG.projectId}`,
      `a_session_${APPWRITE_CONFIG.projectId}_legacy`,
    ];

    for (const name of cookiesToClear) {
      cookieStore.delete(name);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Logout API error:", error);
    return new Response("Error", { status: 500 });
  }
}

// Also handle GET for beacon fallback
export async function GET() {
  return POST();
}
