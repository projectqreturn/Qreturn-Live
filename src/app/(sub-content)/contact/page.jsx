"use client";

export default function ContactForm() {
  return (
    <section className="text-white flex flex-col items-center justify-center pt-20 mb-20">
      {/* Header */}
      <div className="bg-green-400 rounded-b-[80%] h-28 w-full flex items-center justify-center">
        <h2 className="text-2xl font-semibold">Contact Us</h2>
      </div>

      {/* Subtitle */}
      <p className="text-center mt-10 max-w-2xl">
        Have a problem with your account, found a bug, or need assistance?  
        Our team is here to help. Reach out to us anytime.
      </p>

      {/* Email Contact Box */}
      <div className="bg-gray-500 rounded-2xl p-8 mt-6 w-full max-w-3xl text-center space-y-4 mx-auto">
        <h3 className="text-lg font-semibold">Support Email</h3>
        <p className="text-zinc-200">
          For all inquiries, issues, or feedback, please contact:
        </p>

        <p className="text-xl font-semibold text-green-300">
          support@qreturn.app
        </p>

        <p className="text-sm text-gray-300">
          We typically respond within 24 hours.
        </p>
      </div>
    </section>
  );
}
