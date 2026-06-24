"use client";

import { useEffect, useState } from "react";
import { MediaItem, getAllMediaAPI, addMediaAPI, deleteMediaAPI } from "@/src/services/adminService";
import { uploadImage } from "@/src/services/cloudinaryService";

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload/Input State
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cloudinaryWarning, setCloudinaryWarning] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await getAllMediaAPI();
      setMediaItems(data || []);
    } catch (err) {
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    setCloudinaryWarning(false);
    try {
      const res = await uploadImage(file);
      if (res.source === "base64") {
        setCloudinaryWarning(true);
      }
      // Add to database
      const saved = await addMediaAPI(res.url);
      setMediaItems((prev) => [saved, ...prev]);
    } catch (err: any) {
      alert(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    try {
      setUploading(true);
      const saved = await addMediaAPI(newImageUrl.trim());
      setMediaItems((prev) => [saved, ...prev]);
      setNewImageUrl("");
    } catch (err: any) {
      alert(err.message || "Failed to add image url.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image from your Media Gallery?")) return;
    try {
      await deleteMediaAPI(id);
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete image.");
    }
  };

  const copyToClipboard = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredItems = mediaItems.filter((item) =>
    item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-lora">Media Gallery</h1>
          <p className="text-gray-500 mt-1">Centralized storage for all website and product images</p>
        </div>
      </div>

      {/* Upload and Paste Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        {/* File Uploader */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            Upload from local machine
          </label>
          {uploading ? (
            <div className="p-8 border-2 border-dashed border-red-200 rounded-2xl bg-red-50/20 text-center flex flex-col items-center justify-center">
              <span className="text-2xl animate-spin mb-1">🐝</span>
              <span className="text-xs font-semibold text-red-600">Uploading to Media Gallery...</span>
            </div>
          ) : (
            <div className="relative p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition text-center cursor-pointer flex flex-col items-center justify-center h-[120px]">
              <span className="text-2xl mb-1">📤</span>
              <span className="text-xs font-semibold text-gray-600">Click or drag files here</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Supports PNG, JPG, JPEG, GIF</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}
          {cloudinaryWarning && (
            <p className="text-[10px] text-amber-600 mt-1">
              ⚠️ Base64 fallback used. Configure Cloudinary values in .env.local for faster loading.
            </p>
          )}
        </div>

        {/* Paste URL */}
        <div className="space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Import from Web URL
            </label>
            <form onSubmit={handleAddUrl} className="flex gap-2">
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
              />
              <button
                type="submit"
                disabled={uploading || !newImageUrl.trim()}
                className="px-5 py-3 rounded-xl text-white text-xs font-bold bg-gray-800 hover:bg-gray-700 transition disabled:opacity-50"
              >
                Import
              </button>
            </form>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search images by URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Images */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[300px]">
        {loading ? (
          <div className="p-16 text-center text-gray-500">
            <span className="animate-spin text-4xl mb-4 inline-block">📷</span>
            <p>Loading gallery...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-gray-400 italic">
            No media items found. Import some images to display them in the gallery.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 shadow-sm hover:shadow-md transition-all flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={`media-${item.id}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Floating overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs transition cursor-pointer"
                      title="Delete Image"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => copyToClipboard(item.url, item.id)}
                      className="w-full py-1 bg-white hover:bg-gray-100 text-gray-800 text-[10px] font-bold rounded-lg transition text-center cursor-pointer shadow-sm"
                    >
                      {copiedId === item.id ? "Copied! ✓" : "Copy URL"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
