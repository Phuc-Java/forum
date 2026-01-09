// Script để test Appwrite enum
// Chạy: npx tsx scripts/test-appwrite-enum.ts

import { Client, Databases, ID } from "node-appwrite";

const ENDPOINT = "https://cloud.appwrite.io/v1";
const PROJECT_ID = "6939050d003171236d62";
const DATABASE_ID = "6939050d003171236d62";
const COLLECTION_ID = "messages"; // messengerConversations

// Thay API Key của bạn vào đây
const API_KEY = process.env.APPWRITE_API_KEY || "YOUR_API_KEY";

async function testEnum() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);

  console.log("Testing enum values...\n");

  // Test các giá trị khác nhau
  const testValues = [
    "direct",
    "group",
    '"direct"',
    '"group"',
    " direct",
    "direct ",
    " direct ",
  ];

  for (const testValue of testValues) {
    try {
      console.log(`Testing type = ${JSON.stringify(testValue)}`);

      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          type: testValue,
          name: "Test",
          avatar: null,
          createdBy: "test-user",
          participants: JSON.stringify(["test-user"]),
          lastMessage: null,
          lastMessageAt: null,
          isActive: true,
        }
      );

      console.log(`✅ SUCCESS with value: ${JSON.stringify(testValue)}`);
      console.log(`   Document ID: ${doc.$id}`);

      // Xóa document test
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
      console.log(`   (Deleted test document)\n`);
    } catch (error: any) {
      console.log(`❌ FAILED with value: ${JSON.stringify(testValue)}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
}

testEnum().catch(console.error);
