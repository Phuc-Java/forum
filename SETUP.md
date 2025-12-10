# HackerForum Setup Guide

## 🚀 Appwrite Configuration

Before running the application, you need to configure your Appwrite credentials.

### Step 1: Get Your Appwrite IDs

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your project: **"Forum"**
3. Navigate to **Databases** in the sidebar
4. Click on your database: **"ForumDB"**
5. Copy the **Database ID** (shown at the top)
6. Click on the collection: **"posts"**
7. Copy the **Collection ID**

### Step 2: Update Configuration

Open `lib/appwrite.ts` and replace the placeholders:

```typescript
export const DATABASE_ID = "YOUR_DATABASE_ID"; // Replace with your Database ID
export const COLLECTION_ID = "YOUR_COLLECTION_ID"; // Replace with your Collection ID
```

### Step 3: Verify Collection Structure

Make sure your **"posts"** collection has the following attributes:

- **title** (String, Required)
- **content** (String, Required)

Both attributes should be marked as required and have appropriate size limits.

### Step 4: Set Permissions

In the Appwrite Console, go to your **posts** collection settings:

1. Click on **Settings** tab
2. Under **Permissions**, add:
   - **Role: Any** → Read documents
   - **Role: Any** → Create documents

This allows anyone to read and create posts (perfect for an anonymous forum).

### Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Features

✅ Real-time post creation with Appwrite
✅ Automatic list updates without page reload
✅ Loading states with skeleton screens
✅ Error handling with retry functionality
✅ Cyberpunk/Hacker themed UI
✅ Glassmorphism effects
✅ Responsive design

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Backend**: Appwrite Cloud
- **Language**: TypeScript

---

Made with ⚡ by a Senior Frontend Architect
