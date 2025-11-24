// components/Footer.js
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className=" rounded-lg shadow m-4 bg-neutral-950 ">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-base text-gray-500 sm:text-center">
          © {currentYear}{" "}
          <a href="" className="hover:underline">
            Qreturn
          </a>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-base font-medium text-gray-400 sm:mt-0">
          <li>
            <Link href="/about" className="hover:underline me-4 md:me-6">
              About Us
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="hover:underline me-4 md:me-6">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              href="/terms-and-conditions"
              className="hover:underline me-4 md:me-6"
            >
              Terms and Conditions
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline me-4 md:me-6">
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
