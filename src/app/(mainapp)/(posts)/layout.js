"use client";
import { usePathname } from "next/navigation";
import PostNavBar from "@/components/postnav/PostNavBar";



export default function MainAppLayout({ children }) {
  const pathname = usePathname();

  // Only show the navbar when the pathname is exactly '/lost' or '/found'
  const shouldShowNavbar = pathname === "/lost" || pathname === "/found" || pathname === "/lost/nearby" || pathname === "/found/nearby";

  return (
    <div>
      {shouldShowNavbar && (
        <div className="fixed  top-[21vh] sm:top-[12vh] left-0 right-0 z-40 bg-gray-900 px-2 py-2 flex flex-col items-center justify-center shadow-md space-y-2">
          <PostNavBar />
        </div>
      )}
      {children}
      
    </div>
  );
}
