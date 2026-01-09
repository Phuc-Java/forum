import { NextRequest, NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { Databases, Client, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

// Webhook receiver để verify LiveKit webhooks
const receiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

function getServerClient(): Client {
  return new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const event = await receiver.receive(body, authHeader);

    const client = getServerClient();
    const databases = new Databases(client);

    switch (event.event) {
      case "room_started": {
        console.log(`Room started: ${event.room?.name}`);
        break;
      }

      case "room_finished": {
        console.log(`Room finished: ${event.room?.name}`);
        // Update call session status to ended
        const roomName = event.room?.name;
        if (roomName) {
          try {
            // Find call session by roomId
            const sessions = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.callSessions,
              [Query.equal("roomId", roomName)]
            );

            if (sessions.documents.length > 0) {
              await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.callSessions,
                sessions.documents[0].$id,
                { status: "ended" }
              );
            }
          } catch (err) {
            console.error("Failed to update call session:", err);
          }
        }
        break;
      }

      case "participant_joined": {
        console.log(
          `Participant joined: ${event.participant?.identity} in room ${event.room?.name}`
        );
        break;
      }

      case "participant_left": {
        console.log(
          `Participant left: ${event.participant?.identity} from room ${event.room?.name}`
        );
        break;
      }

      case "track_published": {
        console.log(
          `Track published: ${event.track?.type} by ${event.participant?.identity}`
        );
        break;
      }

      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
