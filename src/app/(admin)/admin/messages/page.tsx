"use client";

import { useEffect, useState } from "react";
import API from "@/src/services/api";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/contact-submissions");
      if (res.data?.success) {
        setSubmissions(res.data.data || []);
      } else {
        setError("Failed to fetch messages.");
      }
    } catch (err) {
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDeleteSubmission = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message submission?")) return;

    try {
      const res = await API.delete(`/admin/contact-submissions/${id}`);
      if (res.data?.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      alert("Failed to delete message.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 font-lora">Customer Support Inquiries</h1>
        <p className="text-gray-500 mt-1">Review contact form submissions and resolve customer questions</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500">
            <span className="animate-spin text-4xl mb-4 inline-block">✉️</span>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="p-16 text-center text-gray-400">No support messages submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Inquiry ID</th>
                  <th className="p-4 font-medium">Customer Details</th>
                  <th className="p-4 font-medium">Message Body</th>
                  <th className="p-4 font-medium">Date Received</th>
                  <th className="p-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 pl-6 text-sm font-bold text-gray-400">#{sub.id}</td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm">{sub.name}</p>
                      <p className="text-xs text-blue-600 hover:underline">
                        <a href={`mailto:${sub.email}`}>{sub.email}</a>
                      </p>
                      {sub.phone && <p className="text-[10px] text-gray-400 mt-0.5">📞 {sub.phone}</p>}
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap max-w-md">
                        {sub.message}
                      </p>
                    </td>
                    <td className="p-4 text-xs text-gray-400">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "Just now"}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Message"
                      >
                        🗑️ Resolve / Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
