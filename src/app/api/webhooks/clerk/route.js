import { clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, getAllUsers } from "../../../lib/actions/user.action";

import { createLostPost} from "../../../lib/actions/lostPost.action";

// Check for required environment variables
if (!process.env.CLERK_SECRET_KEY) {
  console.warn("CLERK_SECRET_KEY is not set. ClerkClient operations may fail.");
}

export async function POST(req) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  // CREATE User in mongodb
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username || '',
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };

    console.log(user);

    const newUser = await createUser(user);

    if (newUser) {
      try {
        if (!process.env.CLERK_SECRET_KEY) {
          console.error("Cannot update user metadata: CLERK_SECRET_KEY is not set");
        } else if (!clerkClient || typeof clerkClient.users?.updateUserMetadata !== 'function') {
          console.error("ClerkClient initialization failed. Cannot update user metadata.");
        } else {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userId: newUser._id,
            },
          });
          console.log("User metadata updated successfully");
        }
      } catch (error) {
        console.error("Error updating user metadata:", error);
      }
    }

    return NextResponse.json({ message: "New user created", user: newUser });
  }
  
  // DELETE User in mongodb
  if (eventType === "user.deleted") {
    const { id } = evt.data;
    
    // Delete the user from MongoDB
    const deletedUser = await deleteUser(id);
    
    console.log(`User ${id} deleted from database`);
    
    return NextResponse.json({ message: "User deleted", user: deletedUser });
  }

  // Handle other webhook events if needed
  // For example: user.updated, user.deleted, etc.

  return NextResponse.json({ message: "Webhook received" });
}

// get all users from db
export async function GET() {
  try {
    // Fetch all users from the database
    const users = await getAllUsers();

    if (!users) {
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Users retrieved", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}