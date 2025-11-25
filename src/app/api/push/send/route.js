import { NextResponse } from 'next/server';
import webpush from 'web-push';
import connectToDatabase from '@/app/lib/db';

/**
 * API endpoint to send push notifications
 * POST /api/push/send
 * 
 * This is a server-side endpoint to send push notifications to subscribed users
 * You would typically call this from your backend when you want to notify users
 */

// Configure web-push with your VAPID keys
// Make sure to set these environment variables:
// NEXT_PUBLIC_VAPID_PUBLIC_KEY
// VAPID_PRIVATE_KEY
// VAPID_EMAIL (your email)

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:projectqreturn@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidEmail,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(request) {
  try {
    const { title, body, url, userId, data } = await request.json();

    // Validate required fields
    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user subscriptions from database
    const db = await connectToDatabase();
    
    const subscriptions = await db.collection('pushSubscriptions').find({
      userId: userId
    }).toArray();

    if (subscriptions.length === 0) {
      console.log('No subscriptions found for user:', userId);
      return NextResponse.json(
        { 
          success: false,
          message: 'No subscriptions found' 
        },
        { status: 200 }
      );
    }

    console.log(`Found ${subscriptions.length} subscription(s) for user:`, userId);

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/192.png',
      badge: '/icons/100.png',
      url: url || '/',
      tag: 'qreturn-notification',
      timestamp: Date.now(),
      data: data || {},
    });

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        // Handle FCM tokens (for Firebase Cloud Messaging)
        if (sub.fcmToken) {
          // FCM tokens are handled by Firebase on the client side
          // or you can use Firebase Admin SDK here
          console.log('FCM token found, notification will be handled by Firebase');
          return { success: true, type: 'fcm', userId: sub.userId };
        }
        
        // Handle web-push subscriptions (for browsers)
        if (sub.endpoint && sub.keys) {
          // Check if VAPID keys are configured
          if (!vapidPublicKey || !vapidPrivateKey) {
            console.error('VAPID keys not configured');
            return { success: false, type: 'web-push', error: 'VAPID not configured' };
          }

          const subscription = {
            endpoint: sub.endpoint,
            keys: sub.keys,
            expirationTime: sub.expirationTime
          };

          await webpush.sendNotification(subscription, payload);
          return { success: true, type: 'web-push', endpoint: sub.endpoint };
        }

        return { success: false, error: 'No valid subscription method found' };
      } catch (error) {
        console.error('Error sending to subscription:', error);
        
        // If subscription is no longer valid, remove it from database
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log('Removing invalid subscription');
          await db.collection('pushSubscriptions').deleteOne({
            _id: sub._id
          });
        }
        
        return { success: false, endpoint: sub.endpoint, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent to ${successCount} out of ${subscriptions.length} subscriptions`,
      results
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
