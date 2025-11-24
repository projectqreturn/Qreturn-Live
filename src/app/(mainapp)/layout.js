import Appnav from "../../components/appnav/Appnav";
import Footer from "@/components/footer/Footer";
import LocationTracker from "@/components/LocationTracker";
import InstallPWA from "@/components/pwa/InstallPWA";

export default function MainAppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Location Tracker - runs in background */}
      <LocationTracker />
      
      {/* PWA Install Prompt */}
      <InstallPWA />
      
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-gray-950 to-gray-900 p-4 w-full z-50">
        <Appnav />
      </div>

      
      <div className="h-20" /> 

      
      <main className="flex-grow">
        {children}
      </main>

      
      <Footer />
    </div>
  );
}
