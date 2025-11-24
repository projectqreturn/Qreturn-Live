"use client";

import { useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaFacebookMessenger,
} from "react-icons/fa";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form handling logic or API call here
  };

  return (
    <section className="text-white flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="bg-green-400 rounded-b-[80%] h-28 w-full flex items-center justify-center">
        <h2 className="text-2xl font-semibold">Contact Us</h2>
      </div>

      {/* Subtitle */}
      <p className="text-center mt-4 max-w-2xl">
        Got any question about the product or on our platform? We are here to
        help. Chat to our team 24/7 and get onboard less than 5 minutes
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-500 rounded-2xl p-8 mt-6 w-full max-w-4xl space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            className="p-3 rounded-md w-full bg-white text-black border border-transparent focus:border-green-400 focus:ring-2 focus:ring-green-400 outline-none transition"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            className="p-3 rounded-md w-full bg-white text-black border border-transparent focus:border-green-400 focus:ring-2 focus:ring-green-400 outline-none transition"
            required
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 rounded-md w-full bg-white text-black border border-transparent focus:border-green-400 focus:ring-2 focus:ring-green-400 outline-none transition"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            className="p-3 rounded-md w-full bg-white text-black border border-transparent focus:border-green-400 focus:ring-2 focus:ring-green-400 outline-none transition"
          />
        </div>
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="p-3 rounded-md w-full bg-white text-black border border-transparent focus:border-green-400 focus:ring-2 focus:ring-green-400 outline-none transition"
          required
        />
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Send a message
          </button>
        </div>
      </form>

      <div className="w-full max-w-6xl flex items-center space-x-4 mt-12 px-4">
        <h3 className="text-xl font-semibold">Reach us on</h3>
        <div className="flex-grow h-px bg-gray-500"></div>
      </div>

      <div className="flex space-x-25 text-green-400 text-4xl mt-6 mb-8">
        <a href="#" className="hover:scale-110 transition">
          <FaFacebookF />
        </a>
        <a href="#" className="hover:scale-110 transition">
          <FaInstagram />
        </a>
        <a href="#" className="hover:scale-110 transition">
          <FaLinkedinIn />
        </a>
        <a href="#" className="hover:scale-110 transition">
          <FaWhatsapp />
        </a>
        <a href="#" className="hover:scale-110 transition">
          <FaFacebookMessenger />
        </a>
      </div>
    </section>
  );
}
