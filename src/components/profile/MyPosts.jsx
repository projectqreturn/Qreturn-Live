"use client";
import { useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const POSTS_PER_PAGE = 10;

// Reusable Post Card Component
const PostCard = ({ post, onDelete, onEdit, postType }) => {
  // Different edit links based on post type
  const editLink =
    postType === "lost"
      ? `/edit-lostpost/${post.id}`
      : `/edit-foundpost/${post.id}`;

  return (
    <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 mb-2">
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-lg mr-4 overflow-hidden relative">
          <Image
            src={post.imageSrc}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold text-white">{post.title}</h3>
          <p className="text-sm text-gray-400">Posted on {post.date}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Link href={editLink}>
          <button className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors">
            <MdEdit size={16} className="text-white" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(post.id)}
          className="p-2 rounded-full bg-gray-600 hover:bg-red-500 transition-colors"
        >
          <RiDeleteBin6Line
            size={16}
            className="text-red-500 hover:text-white"
          />
        </button>
      </div>
    </div>
  );
};

// Main App Component
export default function PostsApp() {
  // Clerk user data
  const { isSignedIn, user, isLoaded } = useUser();
  const [userEmail, setUserEmail] = useState("");

  // State management
  const [lostPosts, setLostPosts] = useState([]);
  const [foundPosts, setFoundPosts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: null,
    type: null,
  });

  // Pagination state
  const [lostPostsPage, setLostPostsPage] = useState(1);
  const [foundPostsPage, setFoundPostsPage] = useState(1);

  const urlFound = "/api/post/found?";
  const urlLost = "/api/post/lost?";

  // Set user email when loaded clerk user data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, isSignedIn, user]);

  console.log("UserEmail:", userEmail);

  // Fetch posts
  useEffect(() => {
    if (!userEmail) return; // Don't fetch if email is not set

    const fetchAllPosts = async (type) => {
      const endpoint = type === "found" ? urlFound : urlLost;
      let allPosts = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages
      while (hasMore) {
        const newEndPoint = `${endpoint}userEmail=${userEmail}&page=${page}`;
        try {
          const res = await fetch(newEndPoint, { cache: "no-store" });
          const data = await res.json();

          // Validate response format
          const list = Array.isArray(data.posts) ? data.posts : [];
          
          if (list.length === 0) {
            hasMore = false;
          } else {
            allPosts = [...allPosts, ...list];
            // Check if there are more pages
            if (page >= data.totalPages) {
              hasMore = false;
            } else {
              page++;
            }
          }
        } catch (e) {
          console.error(`Failed to load ${type} posts:`, e);
          hasMore = false;
        }
      }

      // Map data into your UI-friendly structure
      const mapped = allPosts.map((p) => ({
        id: type === "found" ? p.foundPostId : p.lostPostId,
        title: p.title,
        imageSrc: p.photo?.[0] || "/noimage.png",
        date: p.createdAt,
      }));

      if (type === "found") setFoundPosts(mapped);
      else setLostPosts(mapped);
    };

    fetchAllPosts("found");
    fetchAllPosts("lost");
  }, [userEmail]);

  const handleDeleteClick = (postId, type) => {
    setDeleteModal({ isOpen: true, postId, type });
  };

  const confirmDelete = async (postId) => {
    try {
      setIsDeleting(true);

      // Determine which API endpoint to use
      const apiUrl =
        deleteModal.type === "lost"
          ? `/api/post/lost?id=${postId}`
          : `/api/post/found?id=${postId}`;

      // Make DELETE request
      const res = await fetch(apiUrl, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Post deleted successfully:", data);

        // Remove from local state
        if (deleteModal.type === "lost") {
          const newLostPosts = lostPosts.filter((post) => post.id !== postId);
          setLostPosts(newLostPosts);
          // Reset to last valid page if current page becomes empty
          const newTotalPages = Math.ceil(newLostPosts.length / POSTS_PER_PAGE);
          if (lostPostsPage > newTotalPages && newTotalPages > 0) {
            setLostPostsPage(newTotalPages);
          }
        } else {
          const newFoundPosts = foundPosts.filter((post) => post.id !== postId);
          setFoundPosts(newFoundPosts);
          // Reset to last valid page if current page becomes empty
          const newTotalPages = Math.ceil(newFoundPosts.length / POSTS_PER_PAGE);
          if (foundPostsPage > newTotalPages && newTotalPages > 0) {
            setFoundPostsPage(newTotalPages);
          }
        }

        // Close modal
        setDeleteModal({ isOpen: false, postId: null, type: null });

        // Optional: Show success message
        toast.success("Post deleted successfully!");
      } else {
        console.error("Failed to delete post:", data.message);
        toast.error(`Failed to delete post: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("An error occurred while deleting the post");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, postId: null, type: null });
  };

  // Pagination calculations
  const lostPostsTotalPages = Math.ceil(lostPosts.length / POSTS_PER_PAGE);
  const foundPostsTotalPages = Math.ceil(foundPosts.length / POSTS_PER_PAGE);

  const paginatedLostPosts = lostPosts.slice(
    (lostPostsPage - 1) * POSTS_PER_PAGE,
    lostPostsPage * POSTS_PER_PAGE
  );

  const paginatedFoundPosts = foundPosts.slice(
    (foundPostsPage - 1) * POSTS_PER_PAGE,
    foundPostsPage * POSTS_PER_PAGE
  );

  // Pagination component
  const PaginationControls = ({ currentPage, totalPages, onPageChange, totalItems }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4 px-2">
        <span className="text-sm text-gray-400">
          Showing {((currentPage - 1) * POSTS_PER_PAGE) + 1}-{Math.min(currentPage * POSTS_PER_PAGE, totalItems)} of {totalItems}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronLeft size={20} className="text-white" />
          </button>
          <span className="text-sm text-gray-300 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="sm:w-[870px] w-full mx-auto">
      {/* Title placed at the very top, outside all other containers */}
      <h1 className="text-xl font-bold text-white mb-4">My Posts</h1>

      <div
        className={`bg-gray-900 text-white p-4 rounded-lg w-full transition-all duration-200 ${
          deleteModal.isOpen ? "blur-sm" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Lost Posts</h2>
            <div className="space-y-2">
              {paginatedLostPosts.length > 0 ? (
                paginatedLostPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    postType="lost"
                    onDelete={() => handleDeleteClick(post.id, "lost")}
                  />
                ))
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No lost posts here.
                </p>
              )}
            </div>
            <PaginationControls
              currentPage={lostPostsPage}
              totalPages={lostPostsTotalPages}
              onPageChange={setLostPostsPage}
              totalItems={lostPosts.length}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Found Posts</h2>
            <div className="space-y-2">
              {paginatedFoundPosts.length > 0 ? (
                paginatedFoundPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    postType="found"
                    onDelete={() => handleDeleteClick(post.id, "found")}
                  />
                ))
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No found posts here.
                </p>
              )}
            </div>
            <PaginationControls
              currentPage={foundPostsPage}
              totalPages={foundPostsTotalPages}
              onPageChange={setFoundPostsPage}
              totalItems={foundPosts.length}
            />
          </div>

          {/* Reported Posts Section */}
          <div className="mt-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center">
                <span className="mr-2">🚨</span> Reported Posts
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                View reports submitted by the community about your posts. Stay informed about any concerns raised.
              </p>
              <a
                href="/reports?myPosts=true"
                className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                View Reports on My Posts
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-medium text-white mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteModal.postId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}