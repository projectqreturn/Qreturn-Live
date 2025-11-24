"use client";
import React, { useEffect, useState } from "react";
import Gmap from "@/components/map/Gmap";

const Page = () => {
  const [posts, setPosts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyType, setNearbyType] = useState("lost"); // default
  const [loading, setLoading] = useState(true);
  const [IdTyp, setIdType] = useState(null);

  useEffect(() => {
    const type = localStorage.getItem("postType") || "lost";
    setNearbyType(type);
    // if (type.includes("lost")) {
    //   setIdType("lostPostId");
    // }else{
    //   setIdType("foundPostId");
    // }
    // console.log("ID Type:", IdTyp);
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
          setLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userLocation) return;

      const endpoint = nearbyType.includes("lost")
        ? "/api/post/lost"
        : "/api/post/found";

      try {
        console.log("Fetching posts:", endpoint, userLocation);

        const res = await fetch(
          `${endpoint}?gps=${userLocation.lat},${userLocation.lng}`,
          { cache: "no-store" }
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
            };
          })
          .filter(Boolean); // remove nulls

        setPosts(mapped);
      } catch (e) {
        console.error("Failed to load posts:", e);
      }
    };

    fetchData();
  }, [userLocation, nearbyType]);

  if (loading || !userLocation) {
    return (
      <div className="pt-[23vh] lg:pt-44 px-4 text-center">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="pt-[23vh] lg:pt-44 px-4">
      <Gmap
        locations={posts.map((post) => ({
          lat: post.gps.lat,
          lng: post.gps.lng,
          name: post.title,
          url: `/${nearbyType}/${post.id}`,
        }))}
        userLocation={userLocation}
      />
    </div>
  );
};

export default Page;
