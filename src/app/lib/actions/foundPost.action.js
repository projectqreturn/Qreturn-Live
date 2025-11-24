"use server";

import Post from "../modals/foundPost.modal";
import { connect } from "../db";
//add
/**
 * Creates a new post in the database
 * @param {Object} data - post data to create
 * @returns {Promise<Object|null>} Created post object or null on error
 */

// create found post in db
export async function createFoundPost(data) {
  try {
    await connect();
    if (Array.isArray(data.photo)) {
      data.photo = data.photo.map((u) => (typeof u === "string" ? u : u?.url)).filter(Boolean);
    }
    try {
      const newPost = await Post.create(data);
      return JSON.parse(JSON.stringify(newPost));
    } catch (err) {
      if (err?.code === 11000 && (err?.keyPattern?.foundPostId || err?.keyValue?.foundPostId)) {
        const retryPost = await Post.create(data);
        return JSON.parse(JSON.stringify(retryPost));
      }
      throw err;
    }
  } catch (error) {
    console.error("Error creating found post:", error);
    return null;
  }
}

// get all found posts from db
export async function getAllFoundPosts() {
  try {
    // Connect to database
    await connect();

    // Find all lost posts
    const posts = await Post.find({}).sort({ createdAt: -1 });

    return posts;
  } catch (error) {
    console.error("Error fetching found posts:", error);
    throw error;
  }
}