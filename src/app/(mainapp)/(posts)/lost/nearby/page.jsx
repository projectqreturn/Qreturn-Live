import React from "react";
import Link from "next/link";

import Index from "@/app/data/Index";

export default function Page() {
  return (
    <div className="bg-gray-50 text-black pt-[10vh] lg:pt-10 px-4 min-h-screen">
      <Index />
    </div>
  );
}
