"use client";

import { useEffect, useState } from "react";
import { AdminOrder, getAllOrdersAPI } from "@/src/services/adminService";
import { formatPKR } from "@/src/services/productService";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrdersAPI();
        setOrders(data);
      } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 400) {
          setError("Access Denied. You must be an ADMIN to view this page. Please log in with an admin account.");
        } else {
          setError("Failed to fetch orders.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const recentOrders = [...orders].reverse().slice(0, 5); // Last 5 orders

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
          <p className="font-semibold text-lg">⚠️ Error</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-2xl text-blue-500">📦</div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-2xl text-green-500">💰</div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">{formatPKR(totalRevenue)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-2xl text-purple-500">⏳</div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-800">{orders.filter(o => o.status === "PENDING" || !o.status).length}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
              <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">View All</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Order ID</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No orders found.</td>
                    </tr>
                  ) : (
                    recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-sm font-medium text-gray-800">#{order.id}</td>
                        <td className="p-4 text-sm text-gray-600">{order.userEmail}</td>
                        <td className="p-4 text-sm text-gray-500">
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "Just now"}
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-800">{formatPKR(order.totalAmount)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                            order.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {order.status || "PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
