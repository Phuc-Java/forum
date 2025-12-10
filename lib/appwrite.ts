import { Client, Databases } from "appwrite";

// Appwrite Configuration Constants
export const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
export const PROJECT_ID = "6938fff4002177d39dc0";
export const DATABASE_ID = "6939050d003171236d62"; // ForumDB
export const COLLECTION_ID = "posts"; // posts collection

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(PROJECT_ID);

// Initialize Databases
const databases = new Databases(client);

// Export instances
export { client, databases };
