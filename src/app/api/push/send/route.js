import { NextResponse } from 'next/server';
import webpush from 'web-push';

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
    const { title, body, url, userId } = await request.json();

    // Validate required fields
    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Check if VAPID keys are configured
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 500 }
      );
    }

    // TODO: Get user subscriptions from your database
    // Example:
    /*
    const subscriptions = await db.collection('pushSubscriptions').find({
      userId: userId || { $exists: true }
    }).toArray();
    */

    // For demonstration, we'll use an empty array
    const subscriptions = [];

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'No subscriptions found' 
        },
        { status: 200 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/192.png',
      badge: '/icons/100.png',
      url: url || '/',
      tag: 'qreturn-notification',
      timestamp: Date.now(),
    });

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload);
        return { success: true, endpoint: subscription.endpoint };
      } catch (error) {
        console.error('Error sending to subscription:', error);
        
        // If subscription is no longer valid, remove it from database
        if (error.statusCode === 410) {
          // TODO: Remove invalid subscription from database
          /*
          await db.collection('pushSubscriptions').deleteOne({
            endpoint: subscription.endpoint
          });
          */
        }
        
        return { success: false, endpoint: subscription.endpoint, error: error.message };
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
