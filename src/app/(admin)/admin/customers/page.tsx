"use client";

import { useEffect, useState } from "react";
import { AdminCustomer, getAllCustomersAPI, updateCustomerStatusAPI } from "@/src/services/adminService";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomersAPI();
      setCustomers(data || []);
    } catch (err: any) {
      setError("Failed to load customers. Please verify your administrative access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer: AdminCustomer) => {
    const newStatus = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const confirmMsg =
      newStatus === "INACTIVE"
        ? `Are you sure you want to block/suspend user "${customer.name || customer.email}"?`
        : `Are you sure you want to activate/unblock user "${customer.name || customer.email}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const updated = await updateCustomerStatusAPI(customer.id, newStatus);
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, status: updated.status } : c))
      );
    } catch (err) {
      alert("Failed to update customer status. Please try again.");
    }
  };

  // Search logic
  const filteredCustomers = customers.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      c.email.toLowerCase().includes(term) ||
      String(c.id).includes(term)
    );
  });

  // Calculate stats
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.status === "ACTIVE" || !c.status).length;
  const suspendedCount = customers.filter((c) => c.status === "INACTIVE").length;
  const adminCount = customers.filter((c) => c.role === "ADMIN").length;

  const getStatusBadgeClass = (status: string) => {
    if (status === "INACTIVE") return "bg-red-50 text-red-700 border-red-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Customer Base</h1>
        <p className="text-gray-500 mt-1">Manage, audit, and audit registered store accounts</p>
      </div>

      {/* KPI Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl text-blue-500">👥</div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-xl text-emerald-500">✓</div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-xl text-red-500">🚫</div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Blocked/Suspended</p>
              <p className="text-2xl font-bold text-gray-800">{suspendedCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-xl text-purple-500">🛡️</div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Administrators</p>
              <p className="text-2xl font-bold text-gray-800">{adminCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Customers List Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by Name, Email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-gray-500">
              <div className="animate-spin text-4xl mb-4 inline-block">🐝</div>
              <p>Loading customer base...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center text-red-500">{error}</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-16 text-center text-gray-400">No accounts found matching filters.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">User ID</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email Address</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Joined Date</th>
                  <th className="p-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => {
                  const customerStatus = customer.status || "ACTIVE";
                  const isBlocked = customerStatus === "INACTIVE";
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 pl-6 text-sm font-semibold text-gray-400">#{customer.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 font-bold flex items-center justify-center text-sm">
                            {(customer.name || customer.email)[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">
                            {customer.name || "Anonymous Parent"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">{customer.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            customer.role === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : "bg-gray-50 text-gray-600 border-gray-150"
                          }`}
                        >
                          {customer.role || "USER"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                            customerStatus
                          )}`}
                        >
                          {isBlocked ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Unknown"}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {customer.role === "ADMIN" ? (
                          <span className="text-xs font-bold text-gray-300 select-none">System Protected</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(customer)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition duration-150 ${
                              isBlocked
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            }`}
                          >
                            {isBlocked ? "Unblock Account" : "Block Account"}
                          </button>
                        )}
                      </td>
                    </tr>
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
