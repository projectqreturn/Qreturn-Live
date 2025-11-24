import { NextResponse } from "next/server";
import { getAllLostPosts, createLostPost } from "../../../lib/actions/lostPost.action";
import { deleteImageFromExternalApi } from "../../../lib/utils/imageDelete";
import LostPost from "../../../lib/modals/lostPost.modal";
import { connect } from "../../../lib/db";
import { uploadMainImageToExternalApi } from "../../../lib/utils/imageUpload";
import { getNearbyUsers, getUserByEmail } from "../../../lib/actions/user.action";
import { bulkCreateNotifications, NOTIFICATION_TYPES } from "../../../lib/notification/notification";

// create lost post
export async function POST(req) {
  try {
    console.log("========== POST /api/post/lost START ==========");
    const data = await req.json();
    console.log("Received data:", JSON.stringify(data, null, 2));

    // Validate required fields
    const { title, date, phone, Category, District, gps, description, reward, email, photo } = data;
    console.log("Validating fields:", { title, date, phone, Category, District, gps, description, email, photoCount: photo?.length });

    if (!title || !date || !phone || !Category || !District || !gps || !description || !email) {
      console.error("Validation failed - missing required fields");
      return NextResponse.json(
        { message: "Missing required fields", missingFields: {
          title: !title,
          date: !date,
          phone: !phone,
          Category: !Category,
          District: !District,
          gps: !gps,
          description: !description,
          email: !email
        }},
        { status: 400 }
      );
    }

    // Get user's verification status from database
    let userVerificationStatus = false;
    try {
      const user = await getUserByEmail(email);
      if (user) {
        userVerificationStatus = user.isVerified || false;
        console.log("User verification status:", userVerificationStatus);
      }
    } catch (error) {
      console.error("Error fetching user verification status:", error);
      // Continue with false if there's an error
    }

    // Handle main image upload if photos exist
    let searchId = null;
    if (photo && photo.length > 0) {
      const mainImageUrl = photo[0]; // First image is the main image
      console.log("Uploading main image to external API:", mainImageUrl);
      
      try {
        // Upload main image and get UUID-based search ID
        const uploadResult = await uploadMainImageToExternalApi(mainImageUrl, 'lost');
        console.log("Upload result received:", uploadResult);
        
        if (uploadResult && uploadResult.searchId) {
          searchId = uploadResult.searchId;
          console.log("Image uploaded successfully with search ID:", searchId);
        } else {
          console.error("Upload result missing searchId:", uploadResult);
          throw new Error("Image upload did not return a valid search ID");
        }
      } catch (uploadError) {
        console.error("Error uploading image to external API:", uploadError);
        console.error("Error details:", uploadError.message);
        // Fail the post creation if image upload fails when photos are provided
        return NextResponse.json(
          { 
            message: "Failed to upload image to search service", 
            error: uploadError.message 
          },
          { status: 500 }
        );
      }
    } else {
      console.log('No photos provided, skipping image upload');
    }

    // Add search_Id, user verification status, and clerkUserId to data
    const postData = { 
      ...data, 
      search_Id: searchId || "",
      is_verified: userVerificationStatus,
      clerkUserId: data.clerkUserId || "" // Add clerkUserId from request
    };

    console.log("Final search_Id being saved:", searchId);

    console.log('Creating lost post with data:', JSON.stringify(postData, null, 2));

    try {
      const createdPost = await createLostPost(postData);
      if (!createdPost) {
        console.error("createLostPost returned null - check server logs for database errors");
        return NextResponse.json(
          { message: "Failed to create lost post in database." },
          { status: 500 }
        );
      }

      console.log("Lost post created successfully:", createdPost);

      // Notify nearby users about the new lost post
      try {
        console.log("========== NOTIFICATION PROCESS START ==========");
        console.log("Finding nearby users for GPS:", postData.gps);
        console.log("Post creator email:", email);
        
        // Get the post creator's clerkId to exclude them from notifications
        const postCreator = await getUserByEmail(email);
        console.log("Post creator found:", postCreator ? "Yes" : "No");
        console.log("Creator clerkId:", postCreator?.clerkId);
        
        const creatorClerkId = postCreator?.clerkId;
        
        // Get users within 10km radius
        console.log("Searching for users within 10km of:", postData.gps);
        const nearbyUsers = await getNearbyUsers(postData.gps, 10, creatorClerkId);
        console.log(`Found ${nearbyUsers.length} nearby users within 10km`);
        
        if (nearbyUsers.length > 0) {
          console.log("Nearby users details:", nearbyUsers.map(u => ({
            clerkId: u.clerkId,
            email: u.email,
            gps: u.gps,
            distance: u.distance?.toFixed(2) + " km"
          })));
        }

        if (nearbyUsers.length > 0) {
          // Create notifications for all nearby users
          const notifications = nearbyUsers.map(user => ({
            userId: user.clerkId,
            type: NOTIFICATION_TYPES.ITEM_LOST,
            title: `Lost Item Nearby: ${title}`,
            message: `Someone lost a ${title} near your location in ${District}`,
            data: {
              postId: createdPost._id.toString(),
              category: Category,
              location: District,
              distance: `${user.distance.toFixed(1)} km away`
            },
            link: `/lost/${createdPost._id}`,
            priority: 'medium'
          }));

          // Send bulk notifications
          console.log("Creating notifications:", notifications.length);
          const notificationIds = await bulkCreateNotifications(notifications);
          console.log(`✅ Successfully sent ${notificationIds.length} notifications to nearby users`);
          console.log("Notification IDs:", notificationIds);
        } else {
          console.log("⚠️ No nearby users found within 10km radius");
        }
        console.log("========== NOTIFICATION PROCESS END ==========");
      } catch (notifyError) {
        // Log error but don't fail the post creation
        console.error("❌ Error notifying nearby users:", notifyError);
        console.error("Error stack:", notifyError.stack);
      }

      return NextResponse.json(createdPost, { status: 201 });
    } catch (error) {
      console.error("Error creating lost post:", error);

      // Handle duplicate title error
      if (error.message.includes("already exists") || error.code === 11000) {
        return NextResponse.json(
          { message: "A post with this title already exists. The system will automatically add a timestamp to make it unique.", error: "DUPLICATE_TITLE" },
          { status: 409 } // Conflict
        );
      }

      return NextResponse.json(
        { message: "An unexpected error occurred while creating the lost post." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/post/lost:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// Update the getDistance function to work with proper parameters
function getDistance(userGps, postGps) {
  const [lat1, lon1] = userGps.split(',').map(Number);
  const [lat2, lon2] = postGps.split(',').map(Number);
  
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Update lost post
export async function PUT(req) {
  try {
    const data = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate required ID
    if (!id) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connect();

    // Find the existing post
    const existingPost = await LostPost.findOne({ lostPostId: Number(id) });
    if (!existingPost) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    const { title, date, phone, Category, District, gps, description, reward, price, email, photo } = data;

    // Prepare update data - only update fields that are provided
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (date !== undefined) updateData.date = date;
    if (phone !== undefined) updateData.phone = phone;
    if (Category !== undefined) updateData.Category = Category;
    if (District !== undefined) updateData.District = District;
    if (gps !== undefined) updateData.gps = gps;
    if (description !== undefined) updateData.description = description;
    if (reward !== undefined) updateData.reward = reward;
    if (price !== undefined) updateData.price = price;
    if (email !== undefined) updateData.email = email;
    if (photo !== undefined) updateData.photo = photo;

    // Handle image upload if new photos are provided
    if (photo && Array.isArray(photo) && photo.length > 0) {
      // Check if the first photo is different from existing (new upload)
      if (photo[0] !== existingPost.photo[0]) {
        const mainImageUrl = photo[0];
        console.log('New main image detected, uploading to external API:', mainImageUrl);
        
        try {
          const uploadResult = await uploadMainImageToExternalApi(mainImageUrl, 'lost');
          console.log('Upload result received:', uploadResult);
          
          if (uploadResult && uploadResult.searchId) {
            updateData.search_Id = uploadResult.searchId;
            console.log('Main image updated with new search_Id:', uploadResult.searchId);
          } else {
            console.error('Upload result missing searchId:', uploadResult);
            throw new Error('Image upload did not return a valid search ID');
          }
        } catch (uploadError) {
          console.error('Failed to upload main image:', uploadError);
          console.error('Error details:', uploadError.message);
          return NextResponse.json(
            { message: "Failed to upload new image to search service", error: uploadError.message },
            { status: 500 }
          );
        }
      }
    }

    // Update the post
    const updatedPost = await LostPost.findOneAndUpdate(
      { lostPostId: Number(id) },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { message: "Failed to update post" },
        { status: 500 }
      );
    }

    console.log('Lost post updated successfully:', updatedPost.lostPostId);
    return NextResponse.json(
      {
        message: "Lost post updated successfully",
        post: updatedPost,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating lost post:", error);
    return NextResponse.json(
      { message: "Failed to update lost post", error: error.message },
      { status: 500 }
    );
  }
}

// Delete lost post
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate required ID
    if (!id) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connect();

    // Find the post first to verify it exists
    const existingPost = await LostPost.findOne({ lostPostId: Number(id) });
    
    if (!existingPost) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Delete image from external API if search_Id exists
    if (existingPost.search_Id) {
      console.log(`Deleting image with search_Id: ${existingPost.search_Id}`);
      await deleteImageFromExternalApi(existingPost.search_Id);
    }

    // Delete the post
    const deletedPost = await LostPost.findOneAndDelete({ 
      lostPostId: Number(id) 
    });

    if (!deletedPost) {
      return NextResponse.json(
        { message: "Failed to delete post" },
        { status: 500 }
      );
    }

    console.log('Lost post deleted successfully:', deletedPost.lostPostId);
    
    return NextResponse.json(
      {
        message: "Lost post deleted successfully",
        deletedPost: {
          id: deletedPost.lostPostId,
          title: deletedPost.title
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting lost post:", error);
    return NextResponse.json(
      { message: "Failed to delete lost post", error: error.message },
      { status: 500 }
    );
  }
}

// Modified GET function
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("userEmail");
    const userGps = searchParams.get("gps");
    const district = searchParams.get("district");
    const searchQuery = searchParams.get("search");
    const category = searchParams.get("category");
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    await connect();

    // If ID is provided, return specific post
    if (id) {
      const post = await LostPost.findOne({ lostPostId: Number(id) });
      if (!post) return NextResponse.json({ message: "Not found" }, { status: 404 });
      return NextResponse.json({ message: "Lost post retrieved", post }, { status: 200 });
    }

    // Build filter object for search and category
    let filter = {};
    
    // Add search query filter
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Add email filter
    if (email) {
      filter.email = email;
    }

    // Add category filter
    if (category && category !== 'Reset') {
      filter.Category = category;
    }

    // If district is provided, add to filter with pagination
    if (district) {
      filter.District = String(district);
      const total = await LostPost.countDocuments(filter);
      const posts = await LostPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return NextResponse.json(
        {
          message: "Lost posts retrieved by district",
          posts,
          totalPages: Math.ceil(total / limit) || 1,
          currentPage: page,
          totalPosts: total,
        },
        { status: 200 }
      );
    }

    // If GPS is provided, filter posts within 5km radius
    if (userGps) {
      const allPosts = await LostPost.find(filter).sort({ createdAt: -1 });
      
      // Filter posts within 5km radius
      const nearbyPosts = allPosts.filter(post => {
        if (!post.gps) return false;
        const distance = getDistance(userGps, post.gps);
        return isFinite(distance) && distance <= 5;
      });

      // Sort posts by distance
      nearbyPosts.sort((a, b) => {
        const distanceA = getDistance(userGps, a.gps);
        const distanceB = getDistance(userGps, b.gps);
        return distanceA - distanceB;
      });
      
      const total = nearbyPosts.length;
      const paged = nearbyPosts.slice(skip, skip + limit);

      return NextResponse.json(
        {
          message: "Nearby posts retrieved successfully",
          posts: paged,
          totalPages: Math.ceil(total / limit) || 1,
          currentPage: page,
          totalPosts: total,
        },
        { status: 200 }
      );
    }

    // If no GPS or district, return all posts with filter and pagination
    const total = await LostPost.countDocuments(filter);
    const posts = await LostPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        message: "Lost posts retrieved successfully",
        posts,
        totalPages: Math.ceil(total / limit) || 1,
        currentPage: page,
        totalPosts: total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lost posts:", error);
    return NextResponse.json(
      { message: "Failed to fetch lost posts" },
      { status: 500 }
    );
  }
}