import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

// POST: Set session cookie after login
// Supports both session secret and JWT
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session, jwt } = body;

    if (!session && !jwt) {
      return NextResponse.json(
        { error: "Session or JWT is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // If using JWT, verify it and get user info
    if (jwt) {
      try {
        // Verify JWT by trying to use it
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId)
          .setJWT(jwt);

        const account = new Account(client);
        const user = await account.get();

        if (!user) {
          return NextResponse.json({ error: "Invalid JWT" }, { status: 401 });
        }

        // Store JWT as session (will be refreshed periodically)
        cookieStore.set("appwrite-jwt", jwt, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          // JWT is valid for 15 minutes, but we set shorter expiry to trigger refresh
          maxAge: 60 * 14,
        });

        return NextResponse.json({ success: true, type: "jwt" });
      } catch {
        return NextResponse.json(
          { error: "Invalid or expired JWT" },
          { status: 401 }
        );
      }
    }

    // If using session secret (from login/register)
    if (session) {
      cookieStore.set("appwrite-session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // Session expires in 7 days (matching Appwrite default)
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({ success: true, type: "session" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting session cookie:", error);
    return NextResponse.json(
      { error: "Failed to set session" },
      { status: 500 }
    );
  }
}

// DELETE: Clear session cookie (logout)
export async function DELETE() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("appwrite-session");
    cookieStore.delete("appwrite-jwt");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing session cookie:", error);
    return NextResponse.json(
      { error: "Failed to clear session" },
      { status: 500 }
    );
  }
}
