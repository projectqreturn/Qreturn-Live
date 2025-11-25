import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/app/lib/db';

/**
 * API endpoint to handle push notification subscriptions
 * POST /api/push/subscribe
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subscription, fcmToken } = await request.json();

    // Validate subscription object or FCM token
    if (!subscription && !fcmToken) {
      return NextResponse.json(
        { error: 'Subscription or FCM token required' },
        { status: 400 }
      );
    }

    console.log('Received push subscription for user:', userId);

    const db = await connectToDatabase();

    // Store or update the subscription in MongoDB
    const subscriptionData = {
      userId,
      endpoint: subscription?.endpoint || null,
      keys: subscription?.keys || null,
      fcmToken: fcmToken || null,
      expirationTime: subscription?.expirationTime || null,
      userAgent: request.headers.get('user-agent'),
      updatedAt: new Date(),
    };

    // Update or insert subscription
    await db.collection('pushSubscriptions').updateOne(
      { userId },
      { 
        $set: subscriptionData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    console.log('Push subscription saved for user:', userId);

    return NextResponse.json(
      { 
        success: true,
        message: 'Subscription saved successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
