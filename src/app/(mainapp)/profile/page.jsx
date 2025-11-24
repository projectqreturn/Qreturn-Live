"use client";
import { UserProfile } from "@clerk/nextjs";
import ContactInfo from "@/components/profile/ContactInfo";
import MyPosts from "@/components/profile/MyPosts";
import AccountVerification from "@/components/profile/AccountVerification";

const UserProfilePage = () => (
  <div className="container mx-auto px-4">
    <div className="mt-56">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
        Profile
      </h2>

      <div className="flex justify-center w-full">
        <UserProfile />
      </div>
    </div>

    <div className="mt-10">
      <div className="flex justify-center w-full mb-4">
        <ContactInfo />
      </div>
    </div>
    <div className="flex justify-center w-full mb-4">
      {/* Adding a width constraint to match other components */}
      <div className="w-full flex justify-center ">
        <MyPosts />
      </div>
    </div>
    <div className="flex justify-center w-full mb-4">
      {/* Adding a width constraint to match other components */}
      <div className="w-full flex justify-center ">
        <AccountVerification />
      </div>
    </div>
  </div>
);

export default UserProfilePage;
