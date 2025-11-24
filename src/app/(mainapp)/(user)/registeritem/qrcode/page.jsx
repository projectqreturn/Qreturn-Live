"use client";
import React, { useRef, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import { MdOutlineFileDownload } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Page() {
  const qrRef = useRef();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemId, setItemId] = useState(null);
  const [qrValue, setQrValue] = useState("https://qreturn.vercel.app");

  // Read query param on client-side only to avoid useSearchParams CSR bailout
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URL(window.location.href).searchParams;
    const id = params.get("itemId");
    setItemId(id);
    
    // Set QR value with the origin and itemId
    if (id) {
      setQrValue(`${window.location.origin}/protectedqr/${id}`);
    }
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) {
        setError("No item ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/myitems?id=${itemId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch item details");
        }

        const itemData = await response.json();
        setItem(itemData);
      } catch (error) {
        console.error("Error fetching item:", error);
        setError("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleDownloadPNG = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "qreturn-qr.png";
    link.click();
  };

  const handleDownloadPDF = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const bgImage = new Image();
    bgImage.src = "/QR/qreturn-pdf-bg.jpeg"; // bg path

    bgImage.onload = () => {
      pdf.addImage(bgImage, "JPEG", 0, 0, 210, 297);
      pdf.addImage(imgData, "PNG", 55, 160, 100, 100); // Position the QR on the page
      pdf.save("qreturn-qr.pdf");
    };
  };

  return (
    <div className="pt-24 px-4 mb-8">
      <div className="flex flex-col justify-center items-center mt-20">
        {loading && (
          <div className="text-center">
            <p>Loading item details...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
            <button 
              onClick={() => router.push('/myitems')}
              className="block mt-2 underline"
            >
              Go back to My Items
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <span className="text-center font-semibold mt-8 text-lg">
              Item Registered <br />
              and QR Code generated successfully
            </span>
            <span className="text-sm text-blue-600">
              {item ? item.title : 'Unknown Item'} • ID: {itemId}
            </span>

            <div ref={qrRef} className="bg-white p-4 rounded-xl shadow mt-6">
              <QRCodeCanvas value={qrValue} size={200} />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                className="h-10 flex items-center text-black bg-green-400 active:bg-green-300 rounded-xl text-sm px-5 py-2.5 font-semibold"
                onClick={handleDownloadPNG}
              >
                <span>Download PNG</span>
                <MdOutlineFileDownload size={22} className="ml-2" />
              </button>
              <button
                className="h-10 flex items-center text-white bg-purple-600 hover:bg-purple-700 rounded-xl text-sm px-5 py-2.5 font-semibold"
                onClick={handleDownloadPDF}
              >
                <span>Download PDF</span>
                <MdOutlineFileDownload size={22} className="ml-2" />
              </button>
            </div>

            <div className="m-6">
              <h4 className="font-semibold">1. Download your QR Code</h4>
              <p className="text-gray-500">Tap the Download button to save your QR code.</p>
              <h4 className="font-semibold">2. Print the QR Code</h4>
              <p className="text-gray-500">
                Use a regular home printer or a print shop. <br />
                For extra durability, print on sticker paper, laminate it, or use <br /> waterproof material.
              </p>
              <h4 className="font-semibold">3. Attach it to Your Item</h4>
              <p className="text-gray-500">
                Stick or hang the QR code on a visible spot on your item (e.g., bag, <br /> laptop, bottle, wallet). <br />
                Make sure it&apos;s easy to scan and won&apos;t get damaged.
              </p>
              <h4 className="font-semibold">4. Optional: Make a Keytag</h4>
              <p className="text-gray-500">
                You can cut and laminate the QR code to make a small keytag. <br />
                Attach it to your keychain, backpack zip, or lanyard for convenience.
              </p>
              <h4 className="font-semibold">5. You&apos;re All Set!</h4>
              <p className="text-gray-500">
                If someone finds your lost item, they can scan the QR and contact <br /> you safely through QRetun.
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push('/myitems')}
                className="text-blue-500 underline"
              >
                View All My Items
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
