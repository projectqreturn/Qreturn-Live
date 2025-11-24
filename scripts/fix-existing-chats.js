/**
 * Script to fix existing chat rooms by adding missing user IDs
 * 
 * This script:
 * 1. Fetches all chat rooms from Firestore
 * 2. For each chat room, finds the corresponding post (lost or found)
 * 3. Updates the chat room with the post owner's clerkUserId
 * 
 * Run this ONCE after deploying the new changes to fix existing chats
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  where 
} from 'firebase/firestore';

// Your Firebase config (copy from firebase.config.ts)
const firebaseConfig = {
  // Add your config here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixExistingChats() {
  console.log("Starting to fix existing chat rooms...");
  
  try {
    // Get all chat rooms
    const chatRoomsRef = collection(db, "chatRoom");
    const chatSnapshot = await getDocs(chatRoomsRef);
    
    console.log(`Found ${chatSnapshot.size} chat rooms to process`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const chatDoc of chatSnapshot.docs) {
      const chatData = chatDoc.data();
      const chatId = chatDoc.id;
      
      console.log(`\nProcessing chat ${chatId}:`, chatData.title);
      
      // Skip if already has user IDs
      if (chatData.postOwnerUserId && chatData.postOwnerUserId !== "" &&
          chatData.chatOwnerUserId && chatData.chatOwnerUserId !== "") {
        console.log("  ✓ Already has user IDs, skipping");
        skipCount++;
        continue;
      }
      
      try {
        const updates = {};
        
        // Get post owner's clerkUserId from the post
        // Note: You'll need to fetch from your MongoDB API or directly from MongoDB
        const postId = chatData.postId;
        console.log(`  Fetching post ${postId}...`);
        
        // Make API call to get post data
        const isLostPost = chatData.postId.toString().length < 10; // Simple heuristic
        const endpoint = isLostPost 
          ? `/api/post/lost?id=${postId}`
          : `/api/post/found?id=${postId}`;
        
        const response = await fetch(`http://localhost:3000${endpoint}`);
        const postData = await response.json();
        
        if (postData.post && postData.post.clerkUserId) {
          updates.postOwnerUserId = postData.post.clerkUserId;
          console.log(`  Found post owner ID: ${postData.post.clerkUserId}`);
        } else {
          console.log(`  ⚠️  Post doesn't have clerkUserId`);
          updates.postOwnerUserId = "";
        }
        
        // Get chat owner's clerkUserId from users collection
        // You'll need to query your user database by email
        const chatOwnerEmail = chatData.chatOwner;
        console.log(`  Looking up chat owner: ${chatOwnerEmail}`);
        
        // This requires your user API endpoint
        const userResponse = await fetch(`http://localhost:3000/api/user?email=${chatOwnerEmail}`);
        const userData = await userResponse.json();
        
        if (userData.user && userData.user.clerkId) {
          updates.chatOwnerUserId = userData.user.clerkId;
          console.log(`  Found chat owner ID: ${userData.user.clerkId}`);
        } else {
          console.log(`  ⚠️  Chat owner not found in database`);
          updates.chatOwnerUserId = "";
        }
        
        // Update the chat room
        if (Object.keys(updates).length > 0) {
          const chatDocRef = doc(db, "chatRoom", chatId);
          await updateDoc(chatDocRef, updates);
          console.log(`  ✅ Updated chat room with user IDs`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing chat ${chatId}:`, error);
        errorCount++;
      }
    }
    
    console.log("\n========== SUMMARY ==========");
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`⏭️  Skipped (already has IDs): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${chatSnapshot.size}`);
    
  } catch (error) {
    console.error("Fatal error:", error);
  }
}

// Run the script
fixExistingChats()
  .then(() => {
    console.log("\nScript completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
