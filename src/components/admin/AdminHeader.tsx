"use client";

import { logout } from "@/src/services/authService";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-100">
      <h2 className="font-semibold text-gray-800">Admin Dashboard</h2>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
          🔔
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-bold text-gray-500">
          A
        </div>
      </div>
    </header>
  );
}
