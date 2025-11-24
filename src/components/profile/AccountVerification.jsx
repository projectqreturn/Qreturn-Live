import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import styles from "./accverify.module.css";
import { cn } from "../../app/lib/utils.js";
import { IoShieldCheckmarkSharp, IoCloudUploadOutline } from "react-icons/io5";
import { MdVerified, MdClose } from "react-icons/md";
import imageCompression from 'browser-image-compression';

export default function AccountVerification() {
  const { user, isLoaded } = useUser();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch user verification status from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user) return;

      setIsLoadingUser(true);
      try {
        const response = await fetch(`/api/user?clerkId=${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setIsVerified(data.user.isVerified || false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [isLoaded, user]);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // Maximum file size in MB
      maxWidthOrHeight: 1920, // Maximum width or height
      useWebWorker: true,
      fileType: file.type
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      throw new Error('Failed to compress image');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG or JPEG image');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsCompressing(true);
    setError(null);

    try {
      // Compress the image
      const compressedFile = await compressImage(file);
      
      // Create preview URL
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);
      setImageFile(compressedFile);
      
      console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    } catch (err) {
      setError(err.message || 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScan = async () => {
    if (!imageFile) return;

    setIsScanning(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      console.log('Sending file:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size
      });

      const response = await fetch("/api/id-verification", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify ID");
      }

      if (data.isVerified) {
        setSuccess(`Verification successful! NIC: ${data.nic}`);
        setIsVerified(true); // Update local state to show verified badge
        // Clear the uploaded image after successful verification
        handleRemoveImage();
      } else {
        setError("ID verification failed. Please upload a clear photo of a valid Sri Lankan NIC.");
      }
    } catch (err) {
      console.error("Image Analysis Error:", err);
      setError(err.message || "Failed to analyze image");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Create a synthetic event for handleFileSelect
    const syntheticEvent = {
      target: {
        files: [file]
      }
    };
    await handleFileSelect(syntheticEvent);
  };

  if (!isLoaded || isLoadingUser) {
    return (
      <div className="sm:w-[870px] w-full mx-auto bg-slate-900 p-6 rounded-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-2xl font-bold mb-4">
            Account Verification
          </h1>
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:w-[870px] w-full mx-auto bg-slate-900 p-6 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-4">
          Account Verification
        </h1>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-white text-lg">
                  Your Account Status:{" "}
                </span>
                {isVerified ? (
                  <span className="text-green-500 font-bold">Verified</span>
                ) : (
                  <span className="text-amber-500 font-bold">Not Verified</span>
                )}
              </div>

              {!isVerified && (
                <>
                  <p className="text-white mb-6">
                    To receive a verified user badge and build trust within the
                    Qretun community, please verify your identity by uploading a
                    clear photo of your National Identity Card (NIC):
                  </p>

                  <div className="mb-2 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-slate-600 mr-2 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                    <span className="text-white">Front side (or)</span>
                  </div>

                  <div className="mb-6 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-slate-600 mr-2 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                    <span className="text-white">Back side</span>
                  </div>

                  <p className="text-slate-300 text-sm">
                    Our AI system will instantly verify your NIC. Images are
                    automatically compressed for faster upload.
                  </p>
                </>
              )}

              {isVerified && (
                <div className="flex items-center space-x-2">
                  <IoShieldCheckmarkSharp
                    size={30}
                    className="text-green-500"
                  />
                  <p className="text-white">
                    Your account has been successfully verified.
                  </p>
                </div>
              )}
            </div>

            {!isVerified && (
              <div className="w-full md:w-80 lg:w-96">
                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-slate-500 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!previewUrl ? (
                    <>
                      <IoCloudUploadOutline className="mx-auto text-slate-400 mb-4" size={48} />
                      <p className="text-white mb-2">
                        {isCompressing ? "Compressing image..." : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-slate-400 text-sm">PNG or JPEG (max 10MB)</p>
                    </>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="NIC Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        <MdClose size={20} />
                      </button>
                      <div className="mt-2 text-slate-300 text-sm">
                        {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-300 text-sm">
                    {success}
                  </div>
                )}

                <button
                  className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-2 px-4 rounded-md mt-4 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  onClick={handleScan}
                  disabled={!imageFile || isScanning || isCompressing}
                >
                  {isScanning ? "Verifying..." : isCompressing ? "Processing..." : "Submit Verification"}
                </button>
              </div>
            )}

            {isVerified && (
              <div className="w-full md:w-80 lg:w-96 flex items-center justify-center">
                <div className="bg-slate-900 rounded-lg p-4 w-full flex items-center justify-center">
                  <div
                    className={cn(
                      "text-white text-xs px-1.5 py-0.5 rounded-full flex items-center",
                      styles.badgeVerified
                    )}
                  >
                    <MdVerified className="h-3 w-3 mr-0.5" />
                    <span className="text-[10px]">Verified User</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}