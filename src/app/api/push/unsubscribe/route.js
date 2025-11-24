import { NextResponse } from 'next/server';

/**
 * API endpoint to handle push notification unsubscriptions
 * POST /api/push/unsubscribe
 */
export async function POST(request) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    console.log('Unsubscribing endpoint:', endpoint);

    // TODO: Remove the subscription from your database
    // Example with MongoDB:
    /*
    const { userId } = await auth(); // Get user ID from Clerk
    
    await db.collection('pushSubscriptions').deleteOne({
      userId,
      endpoint
    });
    */

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
