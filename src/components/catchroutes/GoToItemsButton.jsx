"use client";
import { TbArrowBack } from "react-icons/tb";

export default function GoToItemsButton() {
  const handleClick = () => {
    window.location.href = "/lost";
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 bg-green-400 hover:bg-green-500 text-black font-bold rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
    >
      <TbArrowBack className="text-lg" />
      Go to Items
    </button>
  );
}
