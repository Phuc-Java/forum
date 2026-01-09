import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

// LiveKit credentials - Đặt trong .env.local
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_WS_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomName, participantName, participantId } = body;

    // Validate required fields
    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    if (!participantId || !participantName) {
      return NextResponse.json(
        { error: "Participant info is required" },
        { status: 400 }
      );
    }

    // Create LiveKit access token
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantId,
      name: participantName,
      // Token expires in 24 hours
      ttl: "24h",
    });

    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      roomName,
      wsUrl: LIVEKIT_WS_URL,
      participantIdentity: participantId,
      participantName: participantName,
    });
  } catch (error) {
    console.error("LiveKit token error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
