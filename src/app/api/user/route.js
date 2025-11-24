import { NextResponse } from "next/server";
import { getUserByClerkId } from "../../lib/actions/user.action";

/**
 * GET handler to fetch user by clerkId
 * @param {Request} req - The request object
 * @returns {Promise<NextResponse>} User data or error response
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { message: "clerkId is required" },
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

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
