"use client";
import React, { useState, useCallback, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import imageCompression from "browser-image-compression";

function FileUploadArea({ files, setFiles }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const MAX_FILES = 1;
  const allowedTypes = ["image/jpeg", "image/png"];

  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
  };

  const handlePaste = useCallback(
    async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      let pastedFile = null;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file && allowedTypes.includes(file.type)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const extension = file.type === "image/png" ? "png" : "jpg";
            const renamedFile = new File(
              [file],
              `pasted-image-${timestamp}.${extension}`,
              { type: file.type }
            );
            pastedFile = renamedFile;
            break;
          }
        }
      }
      if (!pastedFile) return;
      setIsCompressing(true);
      try {
        const compressedFile = await compressFile(pastedFile);
        setFiles([compressedFile]);
      } catch {
        setFiles([pastedFile]);
      } finally {
        setIsCompressing(false);
      }
    },
    [setFiles]
  );

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      if (
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA" &&
        !e.target.isContentEditable
      ) {
        handlePaste(e);
      }
    };
    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  }, [handlePaste]);

  const compressFile = async (file) => {
    try {
      return await imageCompression(file, compressionOptions);
    } catch {
      return file;
    }
  };

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      let droppedFile = e.dataTransfer.files?.[0];
      if (!droppedFile || !allowedTypes.includes(droppedFile.type)) {
        alert("Please upload only JPG or PNG files");
        return;
      }
      setIsCompressing(true);
      try {
        const compressedFile = await compressFile(droppedFile);
        setFiles([compressedFile]);
      } catch {
        setFiles([droppedFile]);
      } finally {
        setIsCompressing(false);
        e.dataTransfer.clearData();
      }
    },
    [setFiles]
  );

  const handleFileChange = useCallback(
    async (e) => {
      const newFile = e.target.files?.[0];
      if (!newFile) return;
      if (!allowedTypes.includes(newFile.type)) {
        alert("Please upload only JPG or PNG files");
        return;
      }
      setIsCompressing(true);
      try {
        const compressedFile = await compressFile(newFile);
        setFiles([compressedFile]);
      } catch {
        setFiles([newFile]);
      } finally {
        setIsCompressing(false);
      }
    },
    [setFiles]
  );

  const removeFile = useCallback(() => setFiles([]), [setFiles]);

  return (
    <div className="w-full max-w-md mx-auto mt-5 p-2">
      {" "}
      {/* smaller width */}
      {files.length === 0 ? (
        <div
          className={`border-2 border-zinc-500/30 rounded-lg p-6 text-center transition-all duration-300 ${
            isDragging
              ? "bg-zinc-800/50 shadow-lg border-zinc-400/50"
              : "bg-zinc-900/40 hover:bg-zinc-800/50"
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            setIsDragging(true);
          }}
          onDrop={handleDrop}
          style={{ height: "220px" }} // Reduced height
        >
          <div className="flex flex-col items-center justify-center h-full">
            {isCompressing ? (
              <>
                <div className="animate-pulse rounded-full p-3 mb-4 bg-zinc-700/50">
                  <UploadCloud className="w-8 h-8 text-zinc-300" />
                </div>
                <p className="text-sm text-zinc-200">Compressing image...</p>
              </>
            ) : (
              <>
                <div
                  className={`rounded-full p-3 mb-4 transition-all ${
                    isDragging ? "bg-zinc-700/50" : "bg-zinc-700"
                  }`}
                >
                  <UploadCloud
                    className={`w-8 h-8 ${
                      isDragging ? "text-zinc-200" : "text-zinc-400"
                    }`}
                  />
                </div>
                <p className="text-sm text-zinc-200">
                  {isDragging ? "Drop to upload" : "Upload your image"}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  JPG/PNG only · Max 1MB
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isCompressing}
                />
                <label
                  htmlFor="file-upload"
                  className={`mt-4 px-4 py-1.5 rounded-full text-sm bg-zinc-700 text-zinc-100 cursor-pointer hover:bg-zinc-600 transition ${
                    isCompressing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Select image
                </label>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 relative overflow-hidden rounded-lg shadow-lg border border-zinc-700/30">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent z-10"></div>
          <img
            src={URL.createObjectURL(files[0])}
            alt="Uploaded image"
            className="w-full h-56 object-cover" // Reduced preview height
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center z-20">
            <div className="text-sm text-zinc-200 font-medium truncate max-w-[80%]">
              <span className="block truncate">{files[0].name}</span>
              <span className="text-xs text-zinc-400">
                {(files[0].size / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="replace-image"
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
                disabled={isCompressing}
              />
              <label
                htmlFor="replace-image"
                className={`px-3 py-1 text-xs rounded-full bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700 transition ${
                  isCompressing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isCompressing ? "Compressing..." : "Replace"}
              </label>
              <button
                type="button"
                onClick={removeFile}
                className="rounded-full w-6 h-6 flex items-center justify-center bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700 transition"
                disabled={isCompressing}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploadArea;
