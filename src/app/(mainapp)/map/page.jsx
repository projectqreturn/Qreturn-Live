"use client";
import React, { useEffect, useState } from "react";
import Gmap from "@/components/map/Gmap";

const Page = () => {
  const [posts, setPosts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyType, setNearbyType] = useState("lost"); // default
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    const type = localStorage.getItem("postType") || "lost";
    setNearbyType(type);
  }, []);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
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
          // Set a default location if geolocation fails (Sri Lanka center)
          setUserLocation({
            lat: 7.8731,
            lng: 80.7718,
          });
          setLoading(false);
        },
        {
          enableHighAccuracy: false, // Faster, less accurate
          timeout: 5000, // 5 second timeout
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser");
      // Set default location
      setUserLocation({
        lat: 7.8731,
        lng: 80.7718,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userLocation) return;

      setLoadingPosts(true);
      const endpoint = nearbyType.includes("lost")
        ? "/api/post/lost"
        : "/api/post/found";

      try {
        console.log("Fetching posts:", endpoint, userLocation);

        const res = await fetch(
          `${endpoint}?gps=${userLocation.lat},${userLocation.lng}`,
          { 
            cache: "force-cache",
            next: { revalidate: 60 } // Cache for 60 seconds
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch posts: ${res.status}`);
        }

        const data = await res.json();
        const list = Array.isArray(data.posts) ? data.posts : [];

        const mapped = list
          .map((p) => {
            const parts = typeof p.gps === "string" ? p.gps.split(",") : [];
            const lat = parseFloat(parts[0]) || null;
            const lng = parseFloat(parts[1]) || null;

            if (!lat || !lng) return null; // skip invalid coords

            return {
              id: p.lostPostId ?? p.foundPostId,
              imageUrl:
                Array.isArray(p.photo) && p.photo.length
                  ? p.photo[0]
                  : "/slider/bag1.jpg",
              title: p.title,
              hasReward: Boolean(p.reward),
              rewardAmount:
                p.reward && p.price ? `Rs. ${p.price}` : undefined,
              gps: { lat, lng },
              category: p.category || "other",
            };
          })
          .filter(Boolean); // remove nulls

        setPosts(mapped);
      } catch (e) {
        console.error("Failed to load posts:", e);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchData();
  }, [userLocation, nearbyType]);

  if (loading) {
    return (
      <div className="pt-[23vh] lg:pt-44 px-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[23vh] lg:pt-44 px-4">
      {loadingPosts && (
        <div className="mb-3 text-center">
          <span className="text-sm text-blue-400">Loading nearby items...</span>
        </div>
      )}
      <Gmap
        locations={posts.map((post) => ({
          lat: post.gps.lat,
          lng: post.gps.lng,
          name: post.title,
          url: `/${nearbyType}/${post.id}`,
          imageUrl: post.imageUrl,
          hasReward: post.hasReward,
          rewardAmount: post.rewardAmount,
          category: post.category,
        }))}
        userLocation={userLocation}
        postType={nearbyType}
      />
    </div>
  );
};

export default Page;
