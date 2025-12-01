"use client";
import React, { useEffect, useState } from "react";
import PostCard from "@/components/postcard/PostCard";
import { usePathname, useRouter } from "next/navigation";
import PostPageNav from "@/components/PostPageNav/PostPageNav";

export default function Index() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const isLost = pathname?.includes("/lost");
  const endpoint = "/api/post/lost";
  const [savedFindNearby, setSavedFindNearby] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState(null);
  const FILTERS_EVENT = "qreturn:postFiltersChange";
  const SEARCH_EVENT = "qreturn:searchChange";
  const getCurrentLocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    } else {
      console.error(
        "Geolocation is not supported by your browser or localStorage is not defined"
      );
      setLoading(false);
    }
  };

  // Effect to load saved states from localStorage on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFindNearby = localStorage.getItem("findNearby");
      const storedSelectedLocation = localStorage.getItem("selectedLocation");
      const storedSearchQuery = localStorage.getItem("searchQuery");
      const storedSearchCategory = localStorage.getItem("searchCategory");
      setSavedFindNearby(storedFindNearby);
      setSelectedLocation(storedSelectedLocation);
      setSearchQuery(storedSearchQuery || "");
      setSearchCategory(storedSearchCategory || null);
    }
  }, [pathname]); // Rerun when pathname changes to re-evaluate local storage values

  // Listen for filter changes from the PostNav without requiring a page refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFiltersChange = (e) => {
      const { findNearby, selectedLocation: city } = e.detail || {};
      setSavedFindNearby(findNearby ? "true" : "false");
      setSelectedLocation(city ?? null);
      setPage(1);
      if (findNearby) {
        getCurrentLocation();
      } else {
        setUserLocation(null);
      }
    };
    window.addEventListener(FILTERS_EVENT, onFiltersChange);
    return () => window.removeEventListener(FILTERS_EVENT, onFiltersChange);
  }, []);

  // Listen for search changes from SearchBar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onSearchChange = (e) => {
      const { query, category } = e.detail || {};
      setSearchQuery(query || "");
      setSearchCategory(category || null);
      setPage(1);
    };
    window.addEventListener(SEARCH_EVENT, onSearchChange);
    return () => window.removeEventListener(SEARCH_EVENT, onSearchChange);
  }, []);

  // Effect to get current location when savedFindNearby changes
  useEffect(() => {
    if (savedFindNearby === "true") {
      getCurrentLocation();
    }
  }, [savedFindNearby]); // Run when savedFindNearby changes

  const handlePostClick = (postId) => {
    router.push(`${pathname}/${postId}`);
  };

  useEffect(() => {
    // Make sure savedFindNearby is a string or null from localStorage before comparison
    const isFindNearbyEnabled = savedFindNearby === "true";

    if (isFindNearbyEnabled && !userLocation) {
      console.log("Waiting for user location...");
      return;
    }

    let isMounted = true;
    const fetchPosts = async () => {
      if (isFindNearbyEnabled && !userLocation) {
        // This case should ideally be caught by the outer if, but as a safeguard
        return;
      }

      let currentEndpoint = `${endpoint}?page=${page}&limit=20`;

      // Add search query if exists
      if (searchQuery) {
        currentEndpoint += `&search=${encodeURIComponent(searchQuery)}`;
      }

      // Add category filter if exists
      if (searchCategory) {
        currentEndpoint += `&category=${encodeURIComponent(searchCategory)}`;
      }

      if (isFindNearbyEnabled && userLocation) {
        currentEndpoint += `&gps=${userLocation.lat},${userLocation.lng}`;
      } else if (selectedLocation && selectedLocation !== "null") {
        currentEndpoint += `&district=${encodeURIComponent(selectedLocation)}`;
      }

      try {
        const res = await fetch(currentEndpoint, { cache: "no-store" });
        const data = await res.json();
        const list = Array.isArray(data.posts) ? data.posts : [];
        const mapped = list.map((p) => {
          const imageUrl =
            Array.isArray(p.photo) && p.photo.length
              ? p.photo[0]
              : "/slider/bag1.jpg";
          if (isLost) {
            return {
              id: p.lostPostId ?? p._id,
              imageUrl,
              title: p.title,
              category: p.Category,
              isVerified: Boolean(p.is_verified),
              hasReward: Boolean(p.reward),
              rewardAmount: p.reward && p.price ? `Rs. ${p.price}` : undefined,
              location: p.District,
              date: p.date,
            };
          }
          return {
            id: p.foundPostId ?? p._id,
            imageUrl,
            title: p.title,
            category: p.Category,
            isVerified: Boolean(p.is_verified),
            hasReward: false,
            rewardAmount: undefined,
            location: p.District,
            date: p.date,
          };
        });
        if (isMounted) {
          setPosts(mapped);
          setTotalPages(data.totalPages ?? 1);
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("Failed to load posts", e);
        if (isMounted) setIsLoaded(true);
      }
    };
    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [
    endpoint,
    isLost,
    savedFindNearby,
    userLocation,
    selectedLocation,
    page,
    searchQuery,
    searchCategory,
  ]);

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white sm:mt-10 mt-20">
      <div className="w-full max-w-6xl space-y-8">
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isLoaded ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="post-card flex items-start gap-3 p-3 rounded-xl animate-pulse"
                >
                  <div className="h-24 w-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No posts found.
            </p>
          ) : (
            posts.map((post, index) => (
              <div
                key={post.id ?? index}
                style={{ animationDelay: `${index * 150}ms` }}
                className="animate-fade-in"
                onClick={() => handlePostClick(post.id)}
              >
                <PostCard
                  postId={post.id}
                  imageUrl={post.imageUrl}
                  title={post.title}
                  category={post.category}
                  isVerified={post.isVerified}
                  hasReward={post.hasReward}
                  rewardAmount={post.rewardAmount}
                  location={post.location}
                  date={post.date}
                />
              </div>
            ))
          )}
        </div>
        <PostPageNav page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div>
  );
}
