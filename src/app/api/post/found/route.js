import { NextResponse } from "next/server";

import { createFoundPost } from "../../../lib/actions/foundPost.action";
import FoundPost from "../../../lib/modals/foundPost.modal";
import { connect } from "../../../lib/db";
import { uploadMainImageToExternalApi } from "../../../lib/utils/imageUpload";
import { deleteImageFromExternalApi } from "../../../lib/utils/imageDelete";
import { getUserByEmail, getNearbyUsers } from "../../../lib/actions/user.action";
import { bulkCreateNotifications, NOTIFICATION_TYPES } from "../../../lib/notification/notification";



// create found post
export async function POST(req) {
  try {
    const data = await req.json();

    // Check if data is array or object
    if (Array.isArray(data)) {
      // Validate each item (simplified here)
      for (const item of data) {
        if (!item.title || !item.date /* ... etc */) {
          return NextResponse.json(
            { message: "Missing required fields in one of the items" },
            { status: 400 }
          );
        }
      }
      // Insert many - handle search_Id for each
      const createdPosts = [];
      for (const item of data) {
        // Get user's verification status
        let userVerificationStatus = false;
        try {
          const user = await getUserByEmail(item.email);
          if (user) {
            userVerificationStatus = user.isVerified || false;
          }
        } catch (error) {
          console.error("Error fetching user verification status:", error);
        }

        // Upload main image and get search_Id
        let searchId = '';
        if (item.photo && item.photo.length > 0) {
          const mainImageUrl = item.photo[0];
          console.log('Uploading main image for bulk item:', mainImageUrl);
          
          try {
            const uploadResult = await uploadMainImageToExternalApi(mainImageUrl, 'found');
            console.log('Upload result received:', uploadResult);
            
            if (uploadResult && uploadResult.searchId) {
              searchId = uploadResult.searchId;
              console.log('Bulk item image uploaded with search_Id:', searchId);
            } else {
              console.error('Upload result missing searchId:', uploadResult);
              throw new Error('Image upload did not return a valid search ID');
            }
          } catch (uploadError) {
            console.error('Failed to upload main image:', uploadError);
            console.error('Error details:', uploadError.message);
            return NextResponse.json(
              { message: "Failed to upload main image to external API", error: uploadError.message },
              { status: 500 }
            );
          }
        }
        const postData = { 
          ...item, 
          search_Id: searchId,
          is_verified: userVerificationStatus,
          clerkUserId: item.clerkUserId || ""
        };
        const createdPost = await createFoundPost(postData);
        createdPosts.push(createdPost);
      }
      return NextResponse.json({ message: "Multiple posts created", createdPosts });
    } else {
      // Single object validation
      const { title, date, phone, Category, District, gps, description, email, photo } = data;
      if (!title || !date || !phone || !Category || !District || !gps || !description || !email) {
        return NextResponse.json(
          { message: "Missing required fields" },
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

      // Upload main image and get search_Id
      let searchId = '';
      if (photo && Array.isArray(photo) && photo.length > 0) {
        const mainImageUrl = photo[0];
        console.log('Uploading main image to external API:', mainImageUrl);
        
        try {
          const uploadResult = await uploadMainImageToExternalApi(mainImageUrl, 'found');
          console.log('Upload result received:', uploadResult);
          
          if (uploadResult && uploadResult.searchId) {
            searchId = uploadResult.searchId;
            console.log('Main image uploaded with search_Id:', searchId);
          } else {
            console.error('Upload result missing searchId:', uploadResult);
            throw new Error('Image upload did not return a valid search ID');
          }
        } catch (uploadError) {
          console.error('Failed to upload main image:', uploadError);
          console.error('Error details:', uploadError.message);
          // Fail the post creation if image upload fails when photos are provided
          return NextResponse.json(
            { 
              message: 'Failed to upload image to search service', 
              error: uploadError.message 
            },
            { status: 500 }
          );
        }
      } else {
        console.log('No photos provided, creating post without search_Id');
      }

      // Add search_Id and user verification status to data
      const postData = { 
        ...data, 
        search_Id: searchId,
        is_verified: userVerificationStatus,
        clerkUserId: data.clerkUserId || ""
      };

      console.log('Creating found post with search_Id:', searchId);
      console.log('Final search_Id being saved:', searchId);
      console.log('Post data being saved:', { ...postData, photo: postData.photo?.length || 0 });

      // Create single post
      const foundPost = await createFoundPost(postData);
      if (!foundPost) return NextResponse.json({ message: "Failed to create" }, { status: 500 });

      console.log('Found post created successfully with search_Id:', foundPost.search_Id);

      // Notify nearby users about the new found post
      try {
        console.log("========== NOTIFICATION PROCESS START (FOUND) ==========");
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
            type: NOTIFICATION_TYPES.ITEM_FOUND,
            title: `Found Item Nearby: ${title}`,
            message: `Someone found a ${title} near your location in ${District}`,
            data: {
              postId: foundPost.foundPostId,
              category: Category,
              location: District,
              distance: `${user.distance.toFixed(1)} km away`
            },
            link: `/found/${foundPost.foundPostId}`,
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
        console.log("========== NOTIFICATION PROCESS END (FOUND) ==========");
      } catch (notifyError) {
        // Log error but don't fail the post creation
        console.error("❌ Error notifying nearby users:", notifyError);
        console.error("Error stack:", notifyError.stack);
      }

      return NextResponse.json({ message: "found post created", foundPost }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating found post:", error);
    return NextResponse.json(
      { message: "Failed to create found post" },
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

//update post
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
    const existingPost = await FoundPost.findOne({ foundPostId: Number(id) });
    if (!existingPost) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    const { title, date, phone, Category, District, gps, description, email, photo } = data;

    // Prepare update data - only update fields that are provided
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (date !== undefined) updateData.date = date;
    if (phone !== undefined) updateData.phone = phone;
    if (Category !== undefined) updateData.Category = Category;
    if (District !== undefined) updateData.District = District;
    if (gps !== undefined) updateData.gps = gps;
    if (description !== undefined) updateData.description = description;
    if (email !== undefined) updateData.email = email;
    if (photo !== undefined) updateData.photo = photo;

    // Handle image upload if new photos are provided
    if (photo && Array.isArray(photo) && photo.length > 0) {
      // Check if the first photo is different from existing (new upload)
      if (photo[0] !== existingPost.photo[0]) {
        const mainImageUrl = photo[0];
        console.log('New main image detected, uploading to external API:', mainImageUrl);
        
        try {
          const uploadResult = await uploadMainImageToExternalApi(mainImageUrl, 'found');
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
    const updatedPost = await FoundPost.findOneAndUpdate(
      { foundPostId: Number(id) },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { message: "Failed to update post" },
        { status: 500 }
      );
    }

    console.log('Found post updated successfully:', updatedPost.foundPostId);
    return NextResponse.json(
      {
        message: "Found post updated successfully",
        post: updatedPost,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating found post:", error);
    return NextResponse.json(
      { message: "Failed to update found post", error: error.message },
      { status: 500 }
    );
  }
}

// Delete found post
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
    const existingPost = await FoundPost.findOne({ foundPostId: Number(id) });
    
    if (!existingPost) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Delete image from external API if search_Id exists
    if (existingPost.search_Id) {
      console.log(`Deleting found image with search_Id: ${existingPost.search_Id}`);
      await deleteImageFromExternalApi(existingPost.search_Id, 'found');
    }

    // Delete the post
    const deletedPost = await FoundPost.findOneAndDelete({ 
      foundPostId: Number(id) 
    });

    if (!deletedPost) {
      return NextResponse.json(
        { message: "Failed to delete post" },
        { status: 500 }
      );
    }

    console.log('Found post deleted successfully:', deletedPost.foundPostId);
    
    return NextResponse.json(
      {
        message: "Found post deleted successfully",
        deletedPost: {
          id: deletedPost.foundPostId,
          title: deletedPost.title
        }
      },
      { status: 200 }
    );


  } catch (error) {
    console.error("Error deleting found post:", error);
    return NextResponse.json(
      { message: "Failed to delete found post", error: error.message },
      { status: 500 }
    );
  }
}

// get all found posts
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("userEmail"); // userEmail : email
    const userGps = searchParams.get("gps"); // Format: "latitude,longitude"
    const district = searchParams.get("district"); // District name
    const searchQuery = searchParams.get("search");  // search query
    const category = searchParams.get("category");  // category filter
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    // Server-side page size control
    const limit = 20;
    const skip = (page - 1) * limit;

    await connect();

    if (id) {
      const post = await FoundPost.findOne({ foundPostId: Number(id) });
      if (!post) return NextResponse.json({ message: "Not found" }, { status: 404 });
      return NextResponse.json({ message: "found post retrieved", post }, { status: 200 });
    }

    // Build filter object for search and category
    let filter = {};
    
    // Filter out disabled posts (unless requesting by ID which is handled above)
    filter.isDisabled = { $ne: true };

    // Add email filter
    if (email) {
      filter.email = email;
      // Show disabled posts to owner
      delete filter.isDisabled;
    }

    // Add search query filter (search in title and description)
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category && category !== 'Reset') {
      filter.Category = category;
    }

    // Filter by district with pagination
    if (district) {
      filter.District = String(district);
      const total = await FoundPost.countDocuments(filter);
      const posts = await FoundPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return NextResponse.json(
        {
          message: "Found posts retrieved by district",
          posts,
          totalPages: Math.ceil(total / limit) || 1,
          currentPage: page,
          totalPosts: total,
        },
        { status: 200 }
      );
    }

    // If GPS is provided, filter posts within 10km radius and paginate in-memory
    if (userGps) {
      const allPosts = await FoundPost.find(filter).sort({ createdAt: -1 });

      // Filter posts within 10km radius
      const nearbyPosts = allPosts.filter((post) => {
        if (!post.gps) return false;
        const distance = getDistance(userGps, post.gps);
        return isFinite(distance) && distance <= 10; // 10km radius
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

    // Default: all posts with filter and pagination
    const total = await FoundPost.countDocuments(filter);
    const posts = await FoundPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        message: "found posts retrieved successfully",
        posts,
        totalPages: Math.ceil(total / limit) || 1,
        currentPage: page,
        totalPosts: total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching found posts:", error);
    return NextResponse.json(
      { message: "Failed to fetch found posts" },
      { status: 500 }
    );
  }
}