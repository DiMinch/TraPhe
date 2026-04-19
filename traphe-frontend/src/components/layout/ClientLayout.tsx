import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col font-geist">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
