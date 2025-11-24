import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import toast, { Toaster } from "react-hot-toast";
import { FaUser, FaSquarePhone } from "react-icons/fa6";
import { MdTipsAndUpdates } from "react-icons/md";
import { FaFacebookSquare } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { PiNotepadBold } from "react-icons/pi";
import Link from "next/link";

export default function ContactDetailsForm() {
  const { user, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    facebookUrl: "",
    instagramUrl: "",
    note: "",
  });
  const [originalData, setOriginalData] = useState({
    name: "",
    phone: "",
    facebookUrl: "",
    instagramUrl: "",
    note: "",
  });
  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch contact data from MongoDB when component mounts
  useEffect(() => {
    const fetchContactData = async () => {
      if (!isLoaded || !user) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/contact?userId=${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.contacts && data.contacts.length > 0) {
            const contact = data.contacts[0];
            const contactData = {
              name: contact.name || "",
              phone: contact.phone || "",
              facebookUrl: contact.facebookUrl || "",
              instagramUrl: contact.instagramUrl || "",
              note: contact.note || "",
            };
            setFormData(contactData);
            setOriginalData(contactData);
          }
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, [isLoaded, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    
    // Check if any field has changed from original
    const hasChanges = Object.keys(newFormData).some(
      (key) => newFormData[key] !== originalData[key]
    );
    setIsChanged(hasChanges);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("User not authenticated!", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    setIsSaving(true);

    try {
      const contactData = {
        userId: user.id,
        name: formData.name,
        phone: formData.phone,
        facebookUrl: formData.facebookUrl,
        instagramUrl: formData.instagramUrl,
        note: formData.note,
      };

      // Check if contact already exists
      const checkResponse = await fetch(`/api/contact?userId=${user.id}`);
      const existingData = await checkResponse.json();

      let response;
      if (existingData.contacts && existingData.contacts.length > 0) {
        // Update existing contact
        response = await fetch("/api/contact", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        });
      } else {
        // Create new contact
        response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        });
      }

      if (response.ok) {
        const result = await response.json();
        toast.success("Contact details saved successfully!", {
          duration: 3000,
          position: "top-center",
        });
        setOriginalData(formData);
        setIsChanged(false);
      } else {
        const error = await response.json();
        toast.error(`Failed to save: ${error.message}`, {
          duration: 4000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error saving contact data:", error);
      toast.error("An error occurred while saving your contact details.", {
        duration: 4000,
        position: "top-center",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="sm:w-[870px] w-full mx-auto">
        <h1 className="text-xl font-bold text-white mb-4">
          My Private Contact Details
        </h1>
        <div className="bg-gray-900 rounded-lg p-6 text-white text-center">
          <p>Loading contact details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:w-[870px] w-full mx-auto">
      <Toaster />
      <h1 className="text-xl font-bold text-white mb-4">
        My Private Contact Details
      </h1>

      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MdTipsAndUpdates className="w-7 h-7 text-white" />
            <h2 className="text-xl font-bold mb-1">
              Keep Your Contact Info Updated
            </h2>
          </div>

          <p className="text-gray-300 sm:w-2/3 text-sm">
            This information will be visible to others who scan the QR code on
            your lost item. (Items you marked as lost on{" "}
            <Link href="/myitems">
              <span className="text-blue-400 font-bold hover:underline">
                my items
              </span>
            </Link>{" "}
            page)
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 ">
                <FaUser className="w-4 h-4 text-white mb-2 " />
                <label className="block mb-2 font-bold">Name</label>
              </div>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                className="w-full bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black p-3 rounded-md"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaSquarePhone className="w-5 h-5 text-white mb-1 " />
                <label className="block font-bold">Phone</label>
              </div>
              <input
                type="text"
                name="phone"
                placeholder="077xxxxxxxx"
                value={formData.phone}
                maxLength={10}
                onChange={handleChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, ""); // Allow digits + dot
                }}
                className="w-full bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black p-3 rounded-md"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaFacebookSquare className="w-5 h-5 text-white mb-1 " />
                <label className="block font-bold">Facebook Profile URL</label>
              </div>

              <input
                type="text"
                name="facebookUrl"
                placeholder="Profile Link"
                value={formData.facebookUrl}
                maxLength={100}
                onChange={handleChange}
                className="w-full bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black p-3 rounded-md"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 ">
                <RiInstagramFill className="w-5 h-5 text-white mb-2 " />
                <label className="block mb-2 font-bold">
                  Instagram Profile URL
                </label>
              </div>

              <input
                type="text"
                name="instagramUrl"
                placeholder="Profile Link"
                value={formData.instagramUrl}
                onChange={handleChange}
                maxLength={100}
                className="w-full bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black p-3 rounded-md"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 ">
              <PiNotepadBold className="w-5 h-5 text-white mb-2 " />
              <label className="block mb-2 font-bold">Note</label>
            </div>
            <textarea
              name="note"
              placeholder="Include any important information you'd like the finder to know."
              value={formData.note}
              onChange={handleChange}
              className="w-full bg-gradient-to-b from-white to-[#959595] placeholder-[#6B7280] text-black p-3 rounded-md h-32"
            />
          </div>

          <button
            type="submit"
            disabled={!isChanged || isSaving}
            className={`font-bold py-2 px-8 rounded-md transition-all ${
              isChanged && !isSaving
                ? "bg-green-400 hover:bg-green-500 text-black cursor-pointer"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
