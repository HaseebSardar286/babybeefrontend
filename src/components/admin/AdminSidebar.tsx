"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Orders", path: "/admin/orders", icon: "📦" },
    { name: "Products", path: "/admin/products", icon: "🧸" },
    { name: "Categories", path: "/admin/categories", icon: "🗂️" },
    { name: "Sliders", path: "/admin/sliders", icon: "🖼️" },
    { name: "Media Gallery", path: "/admin/media", icon: "📷" },
    { name: "Reviews", path: "/admin/reviews", icon: "⭐" },
    { name: "Messages", path: "/admin/messages", icon: "✉️" },
    { name: "Customers", path: "/admin/customers", icon: "👥" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <aside
      className="w-64 flex flex-col"
      style={{ backgroundColor: "white", borderRight: "1px solid #eee" }}
    >
      <div className="p-6">
        <Link
          href="/admin"
          className="text-2xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          BabyBee{" "}
          <span className="text-sm text-gray-500 font-medium">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 font-semibold"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
              style={isActive ? { color: "var(--color-primary)" } : {}}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          ← Back to Store
        </Link>
      </div>
    </aside>
  );
}
