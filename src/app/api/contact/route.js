import { NextResponse } from "next/server";
import { 
  createContact, 
  getContactsByUserId, 
  updateContactByUserId,
  deleteContactByUserId,
  getAllContacts,
  getPublicContacts
} from "../../lib/actions/contact.action";


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const isPublic = searchParams.get("public");
    const getAll = searchParams.get("all");

    // Get all public contacts
    if (isPublic === "true") {
      const contacts = await getPublicContacts();
      if (!contacts) {
        return NextResponse.json(
          { message: "No public contacts found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ contacts }, { status: 200 });
    }

    // Get all contacts
    if (getAll === "true") {
      const contacts = await getAllContacts();
      if (!contacts) {
        return NextResponse.json(
          { message: "No contacts found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ contacts }, { status: 200 });
    }

    // Get contacts by userId
    if (userId) {
      const contacts = await getContactsByUserId(userId);
      if (!contacts || contacts.length === 0) {
        return NextResponse.json(
          { message: "No contacts found for this user" },
          { status: 404 }
        );
      }
      return NextResponse.json({ contacts }, { status: 200 });
    }

    return NextResponse.json(
      { message: "Missing required query parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in GET /api/contact:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.userId) {
      return NextResponse.json(
        { message: "Missing required field: userId" },
        { status: 400 }
      );
    }

    const newContact = await createContact(data);
    
    if (!newContact) {
      return NextResponse.json(
        { message: "Failed to create contact" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Contact created successfully", contact: newContact },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/contact:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(req) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.userId) {
      return NextResponse.json(
        { message: "Missing required field: userId" },
        { status: 400 }
      );
    }

    // Extract userId and prepare update data
    const { userId, ...updateData } = data;

    const updatedContact = await updateContactByUserId(userId, updateData);
    
    if (!updatedContact) {
      return NextResponse.json(
        { message: "Contact not found or failed to update" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Contact updated successfully", contact: updatedContact },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/contact:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "Missing required query parameter: userId" },
        { status: 400 }
      );
    }

    const deletedContact = await deleteContactByUserId(userId);
    
    if (!deletedContact) {
      return NextResponse.json(
        { message: "Contact not found or failed to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Contact deleted successfully", contact: deletedContact },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/contact:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
