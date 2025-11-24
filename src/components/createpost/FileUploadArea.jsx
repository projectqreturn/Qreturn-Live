"use client";
import React, { useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "@/app/lib/utils/cloudinaryUpload";

function FileUploadArea({ files, setFiles }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const MAX_FILES = 5;

  // ✅ Allowed MIME types
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/heic",
    "image/heif",
  ];

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
          allowedTypes.includes(file.type)
        );

        const totalFiles = files.length + newFiles.length;
        if (totalFiles > MAX_FILES) {
          alert(`You can only upload up to ${MAX_FILES} photos`);
          return;
        }
        // Upload sequentially to control rate; could parallelize if needed
        setUploading(true);
        try {
          const uploaded = [];
          for (const f of newFiles) {
            const res = await uploadToCloudinary(f, { folder: "qreturn/posts" });
            uploaded.push(res);
          }
          setFiles((prev) => [...prev, ...uploaded].slice(0, MAX_FILES));
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload one or more images.");
        } finally {
          setUploading(false);
        }
        e.dataTransfer.clearData();
      }
    },
    [files, setFiles]
  );

  const handleFileChange = useCallback(
    async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files).filter((file) =>
          allowedTypes.includes(file.type)
        );

        const totalFiles = files.length + newFiles.length;
        if (totalFiles > MAX_FILES) {
          alert(`You can only upload up to ${MAX_FILES} photos`);
          return;
        }
        setUploading(true);
        try {
          const uploaded = [];
          for (const f of newFiles) {
            const res = await uploadToCloudinary(f, { folder: "qreturn/posts" });
            uploaded.push(res);
          }
          setFiles((prev) => [...prev, ...uploaded].slice(0, MAX_FILES));
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload one or more images.");
        } finally {
          setUploading(false);
        }
      }
    },
    [files, setFiles]
  );

  const removeFile = useCallback(
    (index) => {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    },
    [setFiles]
  );

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-500 bg-gray-800/50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          <p className="mb-2 text-sm text-gray-300">
            <span className="font-semibold">Upload file</span>
          </p>
          <p className="text-xs text-gray-400">
            Drag or drop your files here or click to upload (max 5 photos)
          </p>
          {uploading && (
            <p className="text-xs text-blue-300 mt-2">Uploading...</p>
          )}
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.heic"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className="mt-4 px-4 py-2 rounded-md text-sm bg-gray-700 text-white cursor-pointer hover:bg-gray-600 transition-colors"
          >
            Select files
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={file.url || (typeof file === "string" ? file : "")}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUploadArea;
