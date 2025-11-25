import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/app/lib/db';

/**
 * API endpoint to handle push notification unsubscriptions
 * POST /api/push/unsubscribe
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

    const { endpoint } = await request.json();

    console.log('Unsubscribing user:', userId, endpoint ? `with endpoint: ${endpoint}` : '');

    const db = await connectToDatabase();

    // Remove the subscription from database
    if (endpoint) {
      // Remove specific endpoint
      await db.collection('pushSubscriptions').deleteOne({
        userId,
        endpoint
      });
    } else {
      // Remove all subscriptions for user
      await db.collection('pushSubscriptions').deleteMany({
        userId
      });
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Unsubscribed successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
