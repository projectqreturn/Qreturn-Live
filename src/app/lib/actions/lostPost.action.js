"use server";

import Post from "../modals/lostPost.modal";
import { connect } from "../db";
//add
/**
 * Creates a new post in the database
 * @param {Object} data - post data to create
 * @returns {Promise<Object|null>} Created post object or null on error
 */

// create lost post in db
export async function createLostPost(data) {
  try {
    await connect();
    console.log("Connected to database, creating post with data:", JSON.stringify(data, null, 2));
    
    // basic normalization: ensure photo is an array of strings
    if (Array.isArray(data.photo)) {
      data.photo = data.photo.map((u) => (typeof u === "string" ? u : u?.url)).filter(Boolean);
    } else {
      data.photo = [];
    }
    
    console.log("Normalized photo array:", data.photo);
    
    // Ensure all required fields are present
    const requiredFields = ['title', 'date', 'phone', 'Category', 'District', 'gps', 'description', 'email'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    try {
      const newPost = await Post.create(data);
      console.log("Post created successfully with ID:", newPost.lostPostId);
      return JSON.parse(JSON.stringify(newPost));
    } catch (err) {
      console.error("Database error creating post:", err);
      console.error("Error details:", {
        code: err.code,
        keyPattern: err.keyPattern,
        keyValue: err.keyValue,
        message: err.message,
        name: err.name
      });
      
      // Handle duplicate key errors
      if (err?.code === 11000) {
        if (err?.keyPattern?.lostPostId || err?.keyValue?.lostPostId) {
          console.log("Duplicate lostPostId, retrying after delay...");
          await new Promise(resolve => setTimeout(resolve, 100));
          const retryPost = await Post.create(data);
          return JSON.parse(JSON.stringify(retryPost));
        }
        
        // Handle duplicate title
        if (err?.keyPattern?.title || err?.keyValue?.title) {
          console.log("Duplicate title detected, appending timestamp...");
          data.title = `${data.title} (${Date.now()})`;
          const retryPost = await Post.create(data);
          return JSON.parse(JSON.stringify(retryPost));
        }
      }
      throw err;
    }
  } catch (error) {
    console.error("Error creating lost post - FULL ERROR:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Return more detailed error information
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })));
    }
    
    return null;
  }
}

// get all lost posts from db
export async function getAllLostPosts() {
  try {
    // Connect to database
    await connect();

    // Find all lost posts
    const posts = await Post.find({}).sort({ createdAt: -1 });

    return posts;
  } catch (error) {
    console.error("Error fetching lost posts:", error);
    throw error;
  }
}