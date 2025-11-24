import NavBar from "@/components/nav/NavBar";
import Footer from "@/components/footer/Footer";
export default function SubContentLayout({ children }) {
  return (
    <div>
      <div>
        <NavBar />
      </div>
      {children}
      <div>
        <Footer className="fixed bottom-0 w-full" />
      </div>
    </div>
  );
}
