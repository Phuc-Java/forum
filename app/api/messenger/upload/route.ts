import { NextRequest, NextResponse } from "next/server";
import { Storage, ID } from "node-appwrite";
import { cookies } from "next/headers";
import { Client, Account } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

async function getServerClientWithSession() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("appwrite-jwt");
  if (jwtCookie?.value) {
    client.setJWT(jwtCookie.value);
  } else {
    const sessionCookie = cookieStore.get("appwrite-session");
    if (sessionCookie?.value) {
      client.setSession(sessionCookie.value);
    }
  }

  return client;
}

async function getCurrentUser(client: Client) {
  try {
    const account = new Account(client);
    return await account.get();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await getServerClientWithSession();
    const user = await getCurrentUser(client);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB" },
        { status: 400 }
      );
    }

    const storage = new Storage(client);

    // Upload file to messenger bucket
    const uploadedFile = await storage.createFile(
      APPWRITE_CONFIG.messengerBucketId,
      ID.unique(),
      file
    );

    // Get file URL for viewing
    const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.messengerBucketId}/files/${uploadedFile.$id}/view?project=${APPWRITE_CONFIG.projectId}`;

    // Determine file type
    let fileType: "image" | "video" | "audio" | "file" = "file";
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith("image/")) {
      fileType = "image";
    } else if (mimeType.startsWith("video/")) {
      fileType = "video";
    } else if (mimeType.startsWith("audio/")) {
      fileType = "audio";
    }

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.$id,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await getServerClientWithSession();
    const user = await getCurrentUser(client);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const storage = new Storage(client);

    await storage.deleteFile(APPWRITE_CONFIG.messengerBucketId, fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
