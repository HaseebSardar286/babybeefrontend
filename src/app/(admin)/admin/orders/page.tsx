"use client";

import React, { useEffect, useState } from "react";
import { AdminOrder, getAllOrdersAPI, updateOrderStatusAPI } from "@/src/services/adminService";
import { formatPKR } from "@/src/services/productService";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrdersAPI();
      setOrders(data || []);
    } catch (err: any) {
      setError("Failed to load orders. Please make sure you are logged in as an ADMIN.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const updatedOrder = await updateOrderStatusAPI(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updatedOrder.status } : o))
      );
    } catch (err) {
      alert("Failed to update order status. Please try again.");
    }
  };

  const toggleExpandOrder = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Filter & Search logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(order.id).includes(searchQuery);

    const orderStatus = order.status || "PENDING";
    const matchesStatus =
      statusFilter === "All" ||
      orderStatus.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "CONFIRMED":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-100";
      default: // PENDING
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const statuses = ["All", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
        <p className="text-gray-500 mt-1">Review and process your customer transactions</p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by Email or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Status:</span>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                  statusFilter === s
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-gray-500">
              <div className="animate-spin text-4xl mb-4 inline-block">🐝</div>
              <p>Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center text-red-500">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center text-gray-400">No orders found matching filters.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer Email</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Update Status</th>
                  <th className="p-4 pr-6 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const orderStatus = order.status || "PENDING";
                  return (
                    <React.Fragment key={order.id}>
                      <tr className={`hover:bg-gray-50/50 transition ${isExpanded ? "bg-gray-50/20" : ""}`}>
                        <td className="p-4 pl-6 text-sm font-semibold text-gray-800">#{order.id}</td>
                        <td className="p-4 text-sm text-gray-600 font-medium">{order.userEmail}</td>
                        <td className="p-4 text-sm text-gray-500">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleString()
                            : "Just now"}
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-800">
                          {formatPKR(order.totalAmount)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                              orderStatus
                            )}`}
                          >
                            {orderStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-xs border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-100 bg-white"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => toggleExpandOrder(order.id)}
                            className="text-sm font-semibold text-red-600 hover:text-red-700 transition"
                          >
                            {isExpanded ? "Hide ▲" : "View Items ▼"}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Items Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-gray-50/50 p-6 border-t border-b border-gray-100">
                            <div className="max-w-3xl bg-white rounded-2xl p-5 border border-gray-150 shadow-sm space-y-4">
                              <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
                                Order Items & Items Details
                              </h4>
                              <div className="divide-y divide-gray-100">
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item) => (
                                    <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xl">🐝</span>
                                        <div>
                                          <p className="font-semibold text-gray-800">{item.productName}</p>
                                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-gray-800">
                                          {formatPKR(item.price * item.quantity)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {formatPKR(item.price)} each
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 py-2">No items listed in this order record.</p>
                                )}
                              </div>

                              <div className="pt-4 border-t flex justify-between items-center text-sm font-bold text-gray-800">
                                <span>Grand Total</span>
                                <span className="text-base text-red-600">
                                  {formatPKR(order.totalAmount)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
