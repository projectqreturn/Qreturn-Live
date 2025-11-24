"use client";
import React, { useState } from 'react';
import { db } from "@/firebase/firebase.config";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc 
} from "firebase/firestore";

/**
 * Admin tool to fix existing chat rooms by adding missing user IDs
 * Access this page at: /admin/fix-chats
 * 
 * This will:
 * 1. Fetch all chat rooms
 * 2. For each chat, fetch the post to get the post owner's clerkUserId
 * 3. Update the chat room with the correct user IDs
 */
export default function FixChatsPage() {
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);
  const [processing, setProcessing] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const fixChats = async () => {
    setProcessing(true);
    setLogs([]);
    addLog('Starting to fix chat rooms...', 'info');

    try {
      // Get all chat rooms
      const chatRoomsRef = collection(db, "chatRoom");
      const chatSnapshot = await getDocs(chatRoomsRef);
      
      addLog(`Found ${chatSnapshot.size} chat rooms to process`, 'info');

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const chatDoc of chatSnapshot.docs) {
        const chatData = chatDoc.data();
        const chatId = chatDoc.id;
        
        addLog(`Processing: ${chatData.title || chatId}`, 'info');

        // Skip if already has valid user IDs
        if (chatData.postOwnerUserId && chatData.postOwnerUserId !== "" &&
            chatData.chatOwnerUserId && chatData.chatOwnerUserId !== "") {
          addLog(`  ✓ Already has user IDs, skipping`, 'success');
          skipCount++;
          continue;
        }

        try {
          const updates = {};
          
          // Fetch post to get clerkUserId
          const postId = chatData.postId;
          
          // Try lost post first
          let postResponse = await fetch(`/api/post/lost?id=${postId}`);
          let postData = await postResponse.json();
          
          // If not found, try found post
          if (!postData.post) {
            postResponse = await fetch(`/api/post/found?id=${postId}`);
            postData = await postResponse.json();
          }

          if (postData.post && postData.post.clerkUserId) {
            updates.postOwnerUserId = postData.post.clerkUserId;
            addLog(`  Found post owner ID: ${postData.post.clerkUserId.substring(0, 10)}...`, 'success');
          } else {
            addLog(`  ⚠️ Post doesn't have clerkUserId, setting empty`, 'warning');
            updates.postOwnerUserId = "";
          }

          // Fetch chat owner's clerkUserId
          const chatOwnerEmail = chatData.chatOwner;
          const userResponse = await fetch(`/api/user?email=${encodeURIComponent(chatOwnerEmail)}`);
          const userData = await userResponse.json();

          if (userData.user && userData.user.clerkId) {
            updates.chatOwnerUserId = userData.user.clerkId;
            addLog(`  Found chat owner ID: ${userData.user.clerkId.substring(0, 10)}...`, 'success');
          } else {
            addLog(`  ⚠️ Chat owner not found, setting empty`, 'warning');
            updates.chatOwnerUserId = "";
          }

          // Update the chat room
          const chatDocRef = doc(db, "chatRoom", chatId);
          await updateDoc(chatDocRef, updates);
          addLog(`  ✅ Updated successfully`, 'success');
          successCount++;

        } catch (error) {
          addLog(`  ❌ Error: ${error.message}`, 'error');
          errorCount++;
        }
      }

      addLog('\n========== SUMMARY ==========', 'info');
      addLog(`✅ Successfully updated: ${successCount}`, 'success');
      addLog(`⏭️ Skipped (already has IDs): ${skipCount}`, 'info');
      addLog(`❌ Errors: ${errorCount}`, 'error');
      addLog(`📊 Total processed: ${chatSnapshot.size}`, 'info');
      
      setStatus('Complete!');

    } catch (error) {
      addLog(`Fatal error: ${error.message}`, 'error');
      setStatus('Failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Fix Existing Chat Rooms</h1>
        <p className="text-gray-400 mb-6">
          This tool will update all existing chat rooms with the correct user IDs
          so that notifications work properly.
        </p>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Make sure you have admin access</li>
            <li>Click the "Fix Chat Rooms" button below</li>
            <li>Wait for the process to complete</li>
            <li>Check the logs for any errors</li>
          </ol>
        </div>

        <button
          onClick={fixChats}
          disabled={processing}
          className={`px-6 py-3 rounded-lg font-semibold ${
            processing 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {processing ? 'Processing...' : 'Fix Chat Rooms'}
        </button>

        {status && (
          <div className={`mt-4 p-4 rounded-lg ${
            status === 'Complete!' ? 'bg-green-900' : 'bg-red-900'
          }`}>
            {status}
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Logs</h2>
            <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    log.type === 'success' ? 'text-green-400' :
                    'text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
