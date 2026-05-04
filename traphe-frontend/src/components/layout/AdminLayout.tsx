import { Outlet } from "react-router";
import Navigation from "@/components/Navigation";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
