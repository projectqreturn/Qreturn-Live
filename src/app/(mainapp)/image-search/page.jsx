"use client";
import React, { useState, useEffect } from "react";
import FileUploadArea from "../../../components/fileupload/FileUpload";
import PostCard from "../../../components/postcard/PostCard";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PiWarningCircleBold } from "react-icons/pi";

export default function SearchPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [postType, setPostType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  // Restore search state when component mounts
  useEffect(() => {
    const savedState = sessionStorage.getItem("imageSearchState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setResults(state.results || []);
        setPostType(state.postType || "");
        setSearchInfo(state.searchInfo || null);
        setUploadedImageUrl(state.uploadedImageUrl || null);
      } catch (error) {
        console.error("Failed to restore search state:", error);
      }
    }
  }, []);

  // Save search state whenever results change
  useEffect(() => {
    if (results.length > 0.0) {
      const state = {
        results,
        postType,
        searchInfo,
        uploadedImageUrl,
      };
      sessionStorage.setItem("imageSearchState", JSON.stringify(state));
    }
  }, [results, postType, searchInfo, uploadedImageUrl]);

  const handleSearch = async () => {
    if (files.length === 0) {
      toast.error("Please upload an image first.");
      return;
    }

    if (!postType) {
      toast.error("Please select whether this is a Lost or Found post.");
      return;
    }

    setIsSearching(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("postType", postType);

      // Call our API
      const response = await fetch("/api/images/search", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      console.log("Search results:", data);

      // Store search info
      setSearchInfo({
        count: data.searchResults?.count || 0,
        total: data.searchResults?.total_in_index || 0,
      });

      // Set results
      if (data.posts && data.posts.length > 0) {
        setResults(data.posts);
        setUploadedImageUrl(URL.createObjectURL(files[0]));
        toast.success(`Found ${data.posts.length} matching post(s)!`);
      } else {
        setResults([]);
        toast.error("No matching posts found. Try a different image.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error.message || "Failed to search. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCardClick = (post) => {
    // Navigate to the post detail page
    const postId = postType === "lost" ? post.lostPostId : post.foundPostId;
    const route = postType === "lost" ? `/lost/${postId}` : `/found/${postId}`;
    router.push(route);
  };

  const handleNewSearch = () => {
    setResults([]);
    setFiles([]);
    setPostType("");
    setSearchInfo(null);
    setUploadedImageUrl(null);
    sessionStorage.removeItem("imageSearchState");
  };

  return (
    <main className="min-h-screen  text-white flex flex-col items-center mb-5">
      <Toaster position="top-center" reverseOrder={false} />

      <section className="text-center max-w-2xl mb-4 mt-32 z-100 p-2">
        <div className="gap-2 inline-flex items-center justify-center">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <span>Image Search</span>
            <span className="inline-flex items-center justify-center bg-yellow-400 text-black text-sm font-sans px-2 py-0.5 rounded-full ring-1 ring-amber-600 shadow-sm leading-none">
              Beta
            </span>
          </h2>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-md p-3 text-white/70 text-sm not-italic flex items-start">
          <PiWarningCircleBold
            className="text-yellow-700 w-6 h-6 flex-shrink-0 mr-3 mt-1"
            aria-hidden="true"
          />
          <p className="m-0 text-white/60 text-sm">
            AI Image Search is a beta feature designed to assist in matching
            lost and found items through automated photo scanning and
            comparison. As this feature is experimental, search results may be
            incomplete or inaccurate. please verify any matches manually.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      {results.length === 0 && (
        <>
          <FileUploadArea files={files} setFiles={setFiles} />

          {/* Radio Buttons */}
          <div className="flex justify-center items-center mt-10 space-x-10 text-sm">
            {/* Lost Post */}
            <label className="flex items-center gap-2 cursor-pointer relative">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <input
                  type="radio"
                  name="postType"
                  value="lost"
                  checked={postType === "lost"}
                  onChange={() => setPostType("lost")}
                  disabled={isSearching}
                  className="peer w-4 h-4 rounded-full border border-gray-500 appearance-none cursor-pointer 
                             focus:ring-2 focus:ring-[#00FF91] transition-all duration-200 disabled:opacity-50"
                />
                <span
                  className={`absolute w-2 h-2 rounded-full bg-[#00FF91] transition-opacity ${
                    postType === "lost" ? "opacity-100" : "opacity-0"
                  }`}
                ></span>
              </div>
              <span>Lost post</span>
            </label>

            {/* Found Post */}
            <label className="flex items-center gap-2 cursor-pointer relative">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <input
                  type="radio"
                  name="postType"
                  value="found"
                  checked={postType === "found"}
                  onChange={() => setPostType("found")}
                  disabled={isSearching}
                  className="peer w-4 h-4 rounded-full border border-gray-500 appearance-none cursor-pointer 
                             focus:ring-2 focus:ring-[#00FF91] transition-all duration-200 disabled:opacity-50"
                />
                <span
                  className={`absolute w-2 h-2 rounded-full bg-[#00FF91] transition-opacity ${
                    postType === "found" ? "opacity-100" : "opacity-0"
                  }`}
                ></span>
              </div>
              <span>Found post</span>
            </label>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="mt-6 px-6 py-3 bg-[#00FF91] text-black rounded-md font-semibold hover:bg-[#00e580] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? "Searching..." : "Search similar posts"}
          </button>
        </>
      )}

      {/* Results Section */}
      {results.length > 0 && uploadedImageUrl && (
        <div className="w-full max-w-5xl mt-10 px-4">
          {/* Uploaded Image and Info */}
          <div className="flex flex-col sm:flex-row mb-10 gap-6 items-start">
            <div className="flex-shrink-0">
              <h2 className="text-lg font-semibold mb-2">Image uploaded</h2>
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                className="w-[300px] h-auto rounded-lg shadow-lg border border-zinc-800"
              />
            </div>

            {/* Search Info */}
            <div className="flex-1">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold mb-2 text-[#00FF91]">
                  Search Results
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-400">Search Type:</span>{" "}
                    <span className="font-medium capitalize">
                      {postType} Posts
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Matches Found:</span>{" "}
                    <span className="font-medium">{results.length}</span>
                  </p>
                  {searchInfo && (
                    <>
                      <p>
                        <span className="text-gray-400">Similar Items:</span>{" "}
                        <span className="font-medium">{searchInfo.count}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">
                          Total in Database:
                        </span>{" "}
                        <span className="font-medium">{searchInfo.total}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleNewSearch}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm transition"
              >
                New Search
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <h2 className="text-lg font-semibold mb-4">
            Matching {postType === "lost" ? "Lost" : "Found"} Posts (
            {results.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {results.map((post) => {
              const postId =
                postType === "lost" ? post.lostPostId : post.foundPostId;
              const imageUrl =
                Array.isArray(post.photo) && post.photo.length
                  ? post.photo[0]
                  : "/placeholder.jpg";

              return (
                <div key={postId} onClick={() => handleCardClick(post)}>
                  <PostCard
                    postId={postId}
                    imageUrl={imageUrl}
                    title={post.title}
                    category={post.Category}
                    isVerified={Boolean(post.is_verified)}
                    hasReward={
                      postType === "lost" ? Boolean(post.reward) : false
                    }
                    rewardAmount={
                      postType === "lost" && post.reward && post.price
                        ? `Rs. ${post.price}`
                        : undefined
                    }
                    location={post.District}
                    date={post.date}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
