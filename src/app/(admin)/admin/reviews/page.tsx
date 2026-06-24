"use client";

import { useEffect, useState } from "react";
import { getAllProducts, BackendProduct } from "@/src/services/productService";
import API from "@/src/services/api";

interface Review {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    reviewerName: "BabyBee Official",
    rating: 5,
    comment: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch reviews
      const resReviews = await API.get("/admin/reviews");
      if (resReviews.data?.success) {
        setReviews(resReviews.data.data || []);
      }

      // 2. Fetch products for options select dropdown
      const prodList = await getAllProducts();
      setProducts(prodList || []);

    } catch (err) {
      setError("Failed to fetch reviews data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      productId: products[0]?.id?.toString() || "",
      reviewerName: "BabyBee Official",
      rating: 5,
      comment: ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.reviewerName || !formData.comment) {
      setFormError("All required fields must be completed.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const payload = {
        reviewerName: formData.reviewerName,
        rating: formData.rating,
        comment: formData.comment
      };
      
      const res = await API.post(`/products/${formData.productId}/reviews`, payload);
      if (res.data?.success) {
        // Reload all reviews to show the new one
        const resReviews = await API.get("/admin/reviews");
        if (resReviews.data?.success) {
          setReviews(resReviews.data.data || []);
        }
        setIsModalOpen(false);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await API.delete(`/admin/reviews/${id}`);
      if (res.data?.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert("Failed to delete review.");
    }
  };

  const getProductName = (productId: number) => {
    const p = products.find((prod) => prod.id === productId);
    return p ? p.name : `Product #${productId}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-lora">Product Reviews</h1>
          <p className="text-gray-500 mt-1">Review feedback lists and write direct posts on products</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          disabled={products.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-95 bg-red-600 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          ➕ Post Direct Review
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500">
            <span className="animate-spin text-4xl mb-4 inline-block">⭐</span>
            <p>Loading reviews catalog...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="p-16 text-center text-gray-400">No reviews posted yet on the products.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Review ID</th>
                  <th className="p-4 font-medium">Product Name</th>
                  <th className="p-4 font-medium">Reviewer</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium">Comment</th>
                  <th className="p-4 font-medium">Posted Date</th>
                  <th className="p-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...reviews].reverse().map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 pl-6 text-sm font-semibold text-gray-400">#{review.id}</td>
                    <td className="p-4 text-xs font-bold text-gray-800">{getProductName(review.productId)}</td>
                    <td className="p-4 text-xs font-semibold text-gray-700">{review.reviewerName}</td>
                    <td className="p-4 text-xs text-amber-500 font-bold">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </td>
                    <td className="p-4 text-xs text-gray-500 italic max-w-xs truncate" title={review.comment}>
                      &ldquo;{review.comment}&rdquo;
                    </td>
                    <td className="p-4 text-xs text-gray-400">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Just now"}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Review"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog for posting reviews directly */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 font-lora">Post Direct Review</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl text-xs bg-red-50 text-red-600 font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Target Product *
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Rs. {p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  name="reviewerName"
                  value={formData.reviewerName}
                  onChange={handleInputChange}
                  placeholder="e.g. BabyBee Official"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Star Rating *
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white cursor-pointer"
                  required
                >
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★☆ (4 Stars)</option>
                  <option value="3">★★★☆☆ (3 Stars)</option>
                  <option value="2">★★☆☆☆ (2 Stars)</option>
                  <option value="1">★☆☆☆☆ (1 Star)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Review Comment *
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Write official testimonial or direct review comment..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 mt-2 rounded-full text-white font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md bg-red-600 hover:bg-red-700"
              >
                {formLoading ? "Publishing Review..." : "Publish Directly to Website"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
