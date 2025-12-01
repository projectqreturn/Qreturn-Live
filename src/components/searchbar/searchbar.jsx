"use client";
import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { FaFilter, FaTimes } from "react-icons/fa";
import { IoBagRemove } from "react-icons/io5";
import { MdOutlinePhoneIphone, MdFace, MdOutlinePets } from "react-icons/md";
import { RiShapesFill } from "react-icons/ri";
import { FaCar } from "react-icons/fa6";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const SEARCH_EVENT = "qreturn:searchChange";

  const filterCategories = [
    { name: "Reset", icon: <FaTimes /> },
    { name: "Personal", icon: <IoBagRemove /> },
    { name: "Vehicle", icon: <FaCar /> },
    { name: "Electronics", icon: <MdOutlinePhoneIphone /> },
    { name: "People", icon: <MdFace /> },
    { name: "Pets & Animals", icon: <MdOutlinePets /> },
    { name: "Other Items", icon: <RiShapesFill /> },
  ];

  // Load saved search state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQuery = localStorage.getItem("searchQuery");
      const savedCategory = localStorage.getItem("searchCategory");
      if (savedQuery) setSearchQuery(savedQuery);
      if (savedCategory) {
        const category = filterCategories.find(c => c.name === savedCategory);
        setSelectedCategory(category || null);
      }
    }
  }, []);

  const handleSearch = () => {
    // Save to localStorage
    localStorage.setItem("searchQuery", searchQuery);
    if (selectedCategory) {
      localStorage.setItem("searchCategory", selectedCategory.name);
    } else {
      localStorage.removeItem("searchCategory");
    }

    // Dispatch event to notify post pages
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SEARCH_EVENT, {
          detail: { 
            query: searchQuery, 
            category: selectedCategory?.name || null 
          },
        })
      );
    }
  };

  const handleCategorySelect = (category) => {
    const newCategory = category.name === "Reset" ? null : category;
    setSelectedCategory(newCategory);
    setIsFilterOpen(false);

    // Save and trigger search
    if (newCategory) {
      localStorage.setItem("searchCategory", newCategory.name);
    } else {
      localStorage.removeItem("searchCategory");
    }

    // Dispatch event immediately when category changes
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SEARCH_EVENT, {
          detail: { 
            query: searchQuery, 
            category: newCategory?.name || null 
          },
        })
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex space-x-4 relative">
      <div className="relative">
        <input
          placeholder="Search..."
          className="input shadow-lg focus:border-2 text-black px-5 py-3 rounded-3xl sm:w-96 w-64 transition-all outline-2 focus:outline-green-400"
          name="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="bg-transparent focus:outline-none"
          onClick={handleSearch}
        >
          <IoSearch className="size-6 absolute top-3 right-3 text-gray-500 cursor-pointer" />
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="text-white bg-gray-600 p-4 rounded-full"
        >
          {selectedCategory ? selectedCategory.icon : <FaFilter size={14} />}
        </button>

        {isFilterOpen && (
          <div className="absolute right-0 mt-2 w-48 z-50">
            {/* Separate blurred background layer */}
            <div className="relative rounded-lg overflow-hidden">
              {/* Blurred backdrop layer */}
              <div className="absolute inset-0 bg-gray-700/70 backdrop-blur-md"></div>

              {/* Content layer with clear text */}
              <div className="relative p-2 z-10">
                {filterCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full flex items-center text-left px-4 py-2 text-white hover:bg-gray-500/50 rounded transition-colors font-medium
                      ${
                        category.name === "Reset"
                          ? "text-red-400 hover:text-red-300"
                          : ""
                      }`}
                  >
                    <span className="mr-3">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
