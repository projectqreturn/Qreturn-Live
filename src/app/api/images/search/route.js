import { NextResponse } from "next/server";
import LostPost from "../../../lib/modals/lostPost.modal";
import FoundPost from "../../../lib/modals/foundPost.modal";
import { connect } from "../../../lib/db";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const postType = formData.get("postType"); // 'lost' or 'found'

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!postType || !["lost", "found"].includes(postType)) {
      return NextResponse.json(
        { error: "Invalid or missing postType. Must be 'lost' or 'found'" },
        { status: 400 }
      );
    }

    // Prepare form data for external API
    const externalFormData = new FormData();
    externalFormData.append("file", file);

    // Send image to external search API with type-specific endpoint
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_API_URL || "http://18.136.211.184:8000";
    const endpoint = postType === 'lost' ? 'search-lost-image' : 'search-found-image';
    const searchResponse = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      body: externalFormData,
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("External search API failed:", errorText);
      return NextResponse.json(
        { error: "External search API failed", detail: errorText },
        { status: 502 }
      );
    }

    const searchResults = await searchResponse.json();
    console.log("Search API response:", searchResults);

    // Extract IDs from search results
    const searchIds = searchResults.results?.map(result => result.id) || [];

    if (searchIds.length === 0) {
      return NextResponse.json({
        message: "No matching posts found",
        posts: [],
        searchResults,
      });
    }

    // Connect to database
    await connect();

    // Query the appropriate collection based on postType
    let posts = [];
    if (postType === "lost") {
      posts = await LostPost.find({
        search_Id: { $in: searchIds }
      }).sort({ createdAt: -1 });
    } else if (postType === "found") {
      posts = await FoundPost.find({
        search_Id: { $in: searchIds }
      }).sort({ createdAt: -1 });
    }

    // Sort posts by score from search results (highest score first)
    const scoreMap = {};
    searchResults.results.forEach(result => {
      // Store score by ID (handle both with and without extension)
      scoreMap[result.id] = result.score;
      // Also store without extension for flexibility
      const idWithoutExt = result.id.replace(/\.[^/.]+$/, "");
      scoreMap[idWithoutExt] = result.score;
    });

    // Sort posts by similarity score (highest first)
    posts.sort((a, b) => {
      const searchIdA = a.search_Id || "";
      const searchIdB = b.search_Id || "";
      const searchIdAWithoutExt = searchIdA.replace(/\.[^/.]+$/, "");
      const searchIdBWithoutExt = searchIdB.replace(/\.[^/.]+$/, "");
      
      const scoreA = scoreMap[searchIdA] || scoreMap[searchIdAWithoutExt] || 0;
      const scoreB = scoreMap[searchIdB] || scoreMap[searchIdBWithoutExt] || 0;
      return scoreB - scoreA; // Higher score first (descending order)
    });

    // Add similarity score to each post for frontend display
    const postsWithScores = posts.map(post => {
      const searchId = post.search_Id || "";
      const searchIdWithoutExt = searchId.replace(/\.[^/.]+$/, "");
      const score = scoreMap[searchId] || scoreMap[searchIdWithoutExt] || 0;
      return {
        ...post.toObject(),
        similarityScore: score
      };
    });

    return NextResponse.json({
      message: "Search completed successfully",
      posts: postsWithScores,
      searchResults,
      postType,
    });

  } catch (error) {
    console.error("Error in image search:", error);
    return NextResponse.json(
      { error: "Server error during image search", detail: error.message },
      { status: 500 }
    );
  }
}
