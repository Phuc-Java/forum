// app/api/audio-proxy/route.ts
// Proxy để stream audio từ external URLs, bypass CORS

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Validate URL
  try {
    const parsedUrl = new URL(url);

    // Only allow certain domains for security
    const allowedDomains = [
      "www.soundhelix.com",
      "soundhelix.com",
      "cdn.pixabay.com",
      "upload.wikimedia.org",
      "www.learningcontainer.com",
      "freemusicarchive.org",
    ];

    if (!allowedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    // Fetch the audio file
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "audio/*,*/*;q=0.9",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch audio: ${response.status}` },
        { status: response.status }
      );
    }

    // Get content type
    const contentType = response.headers.get("content-type") || "audio/mpeg";
    const contentLength = response.headers.get("content-length");

    // Create response with proper headers
    const headers: HeadersInit = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400", // Cache for 1 day
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }

    // Stream the response
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Audio Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
    },
  });
}
