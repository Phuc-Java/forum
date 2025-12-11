import { NextResponse } from "next/server";
import { Client, Storage, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

// Server-side client with API key for storage operations
function getStorageClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey) {
    console.error("⚠️ APPWRITE_API_KEY not found in environment variables!");
    throw new Error("Storage API key not configured");
  }

  console.log("✅ Using API key for storage upload");
  client.setKey(apiKey);

  return new Storage(client);
}

/**
 * POST /api/storage/upload
 * Upload file to Appwrite Storage bucket
 * Returns the file URL for embedding in content
 */
export async function POST(request: Request) {
  try {
    // Check API key first
    const apiKey = process.env.APPWRITE_API_KEY;
    if (!apiKey) {
      console.error("APPWRITE_API_KEY missing!");
      return NextResponse.json(
        { success: false, error: "Server chưa cấu hình API key cho Storage" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // 'image' | 'file' | 'thumbnail'

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB for attachments, 10MB for images)
    const maxSize = type === "file" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          success: false,
          error: `File quá lớn. Giới hạn: ${maxSizeMB}MB`,
        },
        { status: 400 }
      );
    }

    // Convert File to buffer for node-appwrite
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFilename = `${timestamp}_${randomStr}_${safeFilename}`;

    // Upload to Appwrite Storage
    const storage = getStorageClient();
    const inputFile = InputFile.fromBuffer(buffer, uniqueFilename);

    const uploadedFile = await storage.createFile(
      APPWRITE_CONFIG.storageBucketId,
      ID.unique(),
      inputFile
    );

    // Build the public URL for viewing/downloading
    // Format: https://sgp.cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
    const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.storageBucketId}/files/${uploadedFile.$id}/view?project=${APPWRITE_CONFIG.projectId}`;

    // For downloads, use the download endpoint
    const downloadUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.storageBucketId}/files/${uploadedFile.$id}/download?project=${APPWRITE_CONFIG.projectId}`;

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.$id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      viewUrl: fileUrl,
      downloadUrl: downloadUrl,
    });
  } catch (error) {
    console.error("Storage upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/storage/upload
 * Delete file from Appwrite Storage bucket
 */
export async function DELETE(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "No fileId provided" },
        { status: 400 }
      );
    }

    const storage = getStorageClient();
    await storage.deleteFile(APPWRITE_CONFIG.storageBucketId, fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Storage delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 }
    );
  }
}
