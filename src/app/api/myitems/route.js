import { NextResponse } from "next/server";
import {
  getAllMyItems,
  createMyItem,
  getMyItemById,
  updateMyItem,
  deleteMyItem,
  getMyItemsByCategory,
  getMyItemsByUserId
} from "../../lib/actions/myitems.action";
import { uploadMainImageToExternalApi } from "../../lib/utils/imageUpload";
import { deleteImageFromExternalApi } from "../../lib/utils/imageDelete";

// GET all items, or by query (category/userId), or by id (if /myitems?id=...)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const userId = searchParams.get("userId");
    let result;
    if (id) {
      result = await getMyItemById(id);
    } else if (category) {
      result = await getMyItemsByCategory(category);
    } else if (userId) {
      result = await getMyItemsByUserId(userId);
    } else {
      result = await getAllMyItems();
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.error();
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    // Remove gps if present in request body
    if (data.gps) delete data.gps;
    
    // Handle main image upload if photos exist
    let searchId = null;
    if (data.photo && data.photo.length > 0) {
      try {
        const mainImageUrl = data.photo[0]; // First image is the main image
        console.log("Uploading main image to external API:", mainImageUrl);
        
        // Upload main image and get UUID-based search ID
        const uploadResult = await uploadMainImageToExternalApi(mainImageUrl, 'myitem');
        searchId = uploadResult.searchId;
        
        console.log("Image uploaded successfully with search ID:", searchId);
      } catch (uploadError) {
        console.error("Error uploading image to external API:", uploadError);
        // Continue with item creation even if image upload fails
        // You can choose to throw error here if image upload is mandatory
      }
    }
    
    // Add search_Id to data if generated
    if (searchId) {
      data.search_Id = searchId;
    }
    
    const newItem = await createMyItem(data);
    
    if (!newItem) {
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
    
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    // Return validation error details if present
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message, details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// PUT: update item by id
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const data = await req.json();
    const updatedItem = await updateMyItem(id, data);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.error();
  }
}

// DELETE: delete item by id
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    
    // Delete item and get search_Id
    const deleteResult = await deleteMyItem(id);
    
    if (!deleteResult.success) {
      return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
    }
    
    // Delete image from external API if search_Id exists
    if (deleteResult.searchId) {
      console.log(`Deleting image with search_Id: ${deleteResult.searchId}`);
      await deleteImageFromExternalApi(deleteResult.searchId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.error();
  }
}

