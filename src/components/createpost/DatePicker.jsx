"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";

function DatePicker({
  onDateChange,
  initialDate = null,
  placeholder = "Pick Date",
}) {
  const [date, setDate] = useState(initialDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get month name
  const getMonthName = (date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  // Check if a date is today
  const isToday = (day, month, year) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Check if a date is selected
  const isSelected = (day, month, year) => {
    if (!date) return false;
    return (
      day === date.getDate() &&
      month === date.getMonth() &&
      year === date.getFullYear()
    );
  };

  // Handle date selection
  const handleDateSelect = (day, month, year) => {
    const selectedDate = new Date(year, month, day);
    setDate(selectedDate);
    if (onDateChange) {
      onDateChange(selectedDate);
    }
    setIsCalendarOpen(false);
  };

  // Render calendar days
  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Render weekday headers
    const weekdayHeaders = weekdays.map((day) => (
      <div
        key={`header-${day}`}
        className="w-8 h-8 flex items-center justify-center text-gray-500 text-xs"
      >
        {day}
      </div>
    ));

    // Render empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Render days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day, month, year);
      const isSelectedDay = isSelected(day, month, year);

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDateSelect(day, month, year)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer
            ${isSelectedDay ? "bg-blue-600 text-white" : ""}
            ${isCurrentDay && !isSelectedDay ? "bg-gray-800 text-white" : ""}
            ${!isCurrentDay && !isSelectedDay ? "hover:bg-gray-800" : ""}
          `}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="py-2">
        <div className="grid grid-cols-7 gap-1 mb-1">{weekdayHeaders}</div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        className="flex items-center justify-between w-full p-3 bg-gradient-to-b from-white to-[#959595] text-black border border-gray-700 rounded-md text-left"
      >
        {date ? (
          formatDate(date)
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <FaCalendarAlt className="h-4 w-4 opacity-50" />
      </button>

      {isCalendarOpen && (
        <div
          ref={calendarRef}
          className="absolute top-full mt-2 z-50 bg-gray-700 border border-gray-500 rounded-md shadow-lg p-3 w-64"
        >
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-gray-800 rounded-full"
            >
              <IoIosArrowDropleftCircle className="h-5 w-5 text-gray-300" />
            </button>
            <div className="text-sm font-medium">
              {getMonthName(currentMonth)}
            </div>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-800 rounded-full"
            >
              <IoIosArrowDroprightCircle className="h-5 w-5 text-gray-300" />
            </button>
          </div>
          {renderDays()}
        </div>
      )}
    </div>
  );
}

export default DatePicker;
