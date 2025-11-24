import { NextResponse } from "next/server";
import { updateUserLocation, getUserByClerkId } from "../../../lib/actions/user.action";

/**
 * Update user's GPS location
 * POST /api/user/location
 */
export async function POST(req) {
  try {
    const { clerkId, gps } = await req.json();

    if (!clerkId || !gps) {
      return NextResponse.json(
        { message: "Missing required fields: clerkId and gps" },
        { status: 400 }
      );
    }

    // Validate GPS format (should be "lat,lng")
    const gpsPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!gpsPattern.test(gps)) {
      return NextResponse.json(
        { message: "Invalid GPS format. Expected format: 'lat,lng'" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserLocation(clerkId, gps);

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Failed to update user location" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Location updated successfully",
      user: updatedUser
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user location:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * Get user's current location
 * GET /api/user/location?clerkId=xxx
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { message: "Missing clerkId parameter" },
        { status: 400 }
      );
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      clerkId: user.clerkId,
      gps: user.gps
    }, { status: 200 });
  } catch (error) {
    console.error("Error getting user location:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
