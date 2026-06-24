"use client";

import { useEffect, useState } from "react";
import API from "@/src/services/api";
import { uploadImage } from "@/src/services/cloudinaryService";

interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  displayOrder: number;
}

export default function AdminSlidersPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
    linkUrl: "",
    displayOrder: 1
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cloudinaryWarning, setCloudinaryWarning] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    setFormError("");
    setCloudinaryWarning(false);
    try {
      const res = await uploadImage(file);
      if (res.source === "base64") {
        setCloudinaryWarning(true);
      }
      setFormData((prev) => ({ ...prev, imageUrl: res.url }));
    } catch (err: any) {
      setFormError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await API.get("/slides");
      if (res.data?.success) {
        setSlides(res.data.data || []);
      } else {
        setError("Failed to fetch slides.");
      }

      const imgRes = await API.get("/admin/images");
      if (imgRes.data?.success) {
        setExistingImages(imgRes.data.data || []);
      }
    } catch (err) {
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedSlide(null);
    setFormData({
      imageUrl: "",
      title: "",
      subtitle: "",
      linkUrl: "",
      displayOrder: slides.length + 1
    });
    setFormError("");
    setCloudinaryWarning(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlide) => {
    setModalMode("edit");
    setSelectedSlide(slide);
    setFormData({
      imageUrl: slide.imageUrl,
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      linkUrl: slide.linkUrl || "",
      displayOrder: slide.displayOrder
    });
    setFormError("");
    setCloudinaryWarning(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? Number(value) : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setFormError("Image URL is required.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      if (modalMode === "add") {
        const res = await API.post("/admin/slides", formData);
        if (res.data?.success) {
          setSlides((prev) => [...prev, res.data.data]);
          setIsModalOpen(false);
        }
      } else if (modalMode === "edit" && selectedSlide) {
        const res = await API.put(`/admin/slides/${selectedSlide.id}`, formData);
        if (res.data?.success) {
          setSlides((prev) =>
            prev.map((s) => (s.id === selectedSlide.id ? res.data.data : s))
          );
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save slide.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSlide = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      const res = await API.delete(`/admin/slides/${id}`);
      if (res.data?.success) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      alert("Failed to delete slide.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-lora">Hero Slider Management</h1>
          <p className="text-gray-500 mt-1">Configure and manage home page sliding banners</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-95 bg-red-600 cursor-pointer shadow-sm"
        >
          ➕ Add New Slide
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500">
            <span className="animate-spin text-4xl mb-4 inline-block">🖼️</span>
            <p>Loading sliders...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">{error}</div>
        ) : slides.length === 0 ? (
          <div className="p-16 text-center text-gray-400">No slides configured. Add some slides to populate the homepage banner.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Order</th>
                  <th className="p-4 font-medium">Image Preview</th>
                  <th className="p-4 font-medium">Title & Subtitle</th>
                  <th className="p-4 font-medium">Link Target</th>
                  <th className="p-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slides.sort((a, b) => a.displayOrder - b.displayOrder).map((slide) => (
                  <tr key={slide.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 pl-6 text-sm font-bold text-gray-800">#{slide.displayOrder}</td>
                    <td className="p-4">
                      <div className="w-24 h-14 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm">{slide.title || "(Untitled)"}</p>
                      <p className="text-xs text-gray-400 truncate max-w-xs">{slide.subtitle}</p>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-600">{slide.linkUrl || "/products"}</td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(slide)}
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Edit Slide"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Slide"
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

      {/* Modal dialog overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 font-lora">
                {modalMode === "add" ? "Add Hero Slide" : "Edit Hero Slide"}
              </h3>
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
                  Image URL *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                  >
                    🖼️ Gallery
                  </button>
                </div>

                {showImagePicker && (
                  <div className="p-3 border border-gray-100 bg-gray-50 rounded-2xl max-h-40 overflow-y-auto mb-3 animate-fadeIn">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Choose from Catalog Images:</p>
                    {existingImages.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No existing catalog images found.</p>
                    ) : (
                      <div className="grid grid-cols-5 gap-2">
                        {existingImages.map((url, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, imageUrl: url }));
                              setShowImagePicker(false);
                            }}
                            className="aspect-square border border-gray-200 bg-white rounded-lg overflow-hidden cursor-pointer hover:border-red-500 transition relative"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="catalog-img"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* File Uploader */}
                {uploading ? (
                  <div className="p-3 border-2 border-dashed border-red-200 rounded-xl bg-red-50/20 text-center text-xs text-red-600 font-semibold mt-2">
                    Uploading image to Cloudinary...
                  </div>
                ) : (
                  <div className="relative p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition text-center cursor-pointer mt-2">
                    <span className="text-xs font-semibold text-gray-600">Upload banner image from system</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}

                {cloudinaryWarning && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 leading-normal text-left">
                    ⚠️ Using Base64 fallback. For production-grade speed, please configure Cloudinary variables in your <code>.env.local</code> file:
                    <pre className="mt-1 bg-white/60 p-1.5 rounded text-[9px] font-mono">
                      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...&#10;
                      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
                    </pre>
                  </div>
                )}

                {formData.imageUrl && (
                  <div className="mt-3 w-32 h-18 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Slide Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Comfort Collection"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Slide Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Describe your banner collection..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Link Target URL
                  </label>
                  <input
                    type="text"
                    name="linkUrl"
                    value={formData.linkUrl}
                    onChange={handleInputChange}
                    placeholder="e.g. /products"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 mt-2 rounded-full text-white font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md bg-red-600 hover:bg-red-700"
              >
                {formLoading ? "Saving Slide..." : "Save Banner Slide"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
