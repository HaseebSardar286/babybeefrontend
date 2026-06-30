"use client";

import { useEffect, useState } from "react";
import {
  getAllBlogsAPI,
  createBlogAPI,
  updateBlogAPI,
  deleteBlogAPI,
  getExistingImagesAPI,
  BlogEntry
} from "@/src/services/adminService";
import { uploadImage } from "@/src/services/cloudinaryService";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Existing Images Gallery Picker State
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedBlog, setSelectedBlog] = useState<BlogEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "Admin",
    imageUrl: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cloudinaryWarning, setCloudinaryWarning] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogsAPI();
      setBlogs(data || []);
    } catch (err) {
      setError("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingImages = async () => {
    try {
      const urls = await getExistingImagesAPI();
      setExistingImages(urls || []);
    } catch (err) {
      console.error("Failed to load existing images", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchExistingImages();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedBlog(null);
    setFormData({
      title: "",
      content: "",
      author: "Admin",
      imageUrl: ""
    });
    setFormError("");
    setCloudinaryWarning(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (blog: BlogEntry) => {
    setModalMode("edit");
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      author: blog.author || "Admin",
      imageUrl: blog.imageUrl || ""
    });
    setFormError("");
    setCloudinaryWarning(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const selectExistingImage = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setShowImagePicker(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setFormError("Title and Content are required.");
      return;
    }

    setFormLoading(true);
    setFormError("");
    try {
      if (modalMode === "add") {
        await createBlogAPI(formData);
      } else {
        if (selectedBlog?.id) {
          await updateBlogAPI(selectedBlog.id, formData);
        }
      }
      setIsModalOpen(false);
      fetchBlogs();
      fetchExistingImages();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save blog post.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await deleteBlogAPI(id);
      fetchBlogs();
    } catch (err) {
      alert("Failed to delete blog post.");
    }
  };

  const filtered = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.author && blog.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-lora text-gray-800">Blogs Management</h1>
          <p className="text-xs text-gray-500 mt-1">Add, update, or remove articles showing on the user store.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-[#b5374a] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#8c2536] transition shadow-xs cursor-pointer"
        >
          Add Blog Post
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-xs font-bold text-red-700 bg-red-50 border border-red-100">{error}</div>
      )}

      {/* Search Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150/15 shadow-3xs">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field max-w-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs font-bold text-gray-400 animate-pulse">Loading blog posts...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border p-12 text-center text-gray-400">
          <div className="text-5xl mb-3">✍️</div>
          <p className="text-sm font-semibold">No blog posts found</p>
          <p className="text-xs mt-1">Get started by creating your first store article!</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-150/15 overflow-hidden shadow-3xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                <th className="p-4 w-20">Image</th>
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Date Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((blog) => (
                <tr key={blog.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border overflow-hidden flex items-center justify-center text-lg">
                      {blog.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        "📝"
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-800 leading-snug">{blog.title}</td>
                  <td className="p-4 font-medium text-gray-500">{blog.author || "Admin"}</td>
                  <td className="p-4 text-gray-400">
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : "—"}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(blog)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold cursor-pointer transition active:scale-95"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => blog.id && handleDeleteBlog(blog.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold cursor-pointer transition active:scale-95"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto z-10 p-6 md:p-8 shadow-2xl border border-gray-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold font-lora mb-6 text-gray-800 border-b pb-3">
              {modalMode === "add" ? "Create New Blog Post" : "Edit Blog Post"}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-xl text-xs font-bold text-red-700 bg-red-50 border border-red-100">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Title *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Why GOTS organic threads are better for newborn eczema"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Author</label>
                <input
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Admin"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Article Body Content *</label>
                <textarea
                  name="content"
                  rows={6}
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Type the full blog details here..."
                  className="input-field"
                  required
                />
              </div>

              {/* Cover Image Picker */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cover Image Banner</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
                    {formData.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      "📷"
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold cursor-pointer transition active:scale-95 border">
                        {uploading ? "Uploading..." : "Upload Local Image"}
                        <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" disabled={uploading} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(true)}
                        className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold transition active:scale-95 border cursor-pointer"
                      >
                        Choose Existing Image
                      </button>
                    </div>
                    {cloudinaryWarning && (
                      <p className="text-[9px] text-amber-500 font-bold leading-normal">
                        ⚠️ Note: Uploaded as Local Base64 due to missing Cloudinary configs. Correct configs recommended for production.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-[#b5374a] hover:bg-[#8c2536] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : "Save Blog Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Gallery Picker Dialog */}
      {showImagePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/45" onClick={() => setShowImagePicker(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border max-h-[80vh] flex flex-col">
            <h3 className="text-base font-bold mb-4 font-lora border-b pb-2">Select Existing Image</h3>
            <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
              {existingImages.map((url, i) => (
                <div
                  key={i}
                  onClick={() => selectExistingImage(url)}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-50 border hover:border-[#b5374a] transition-all cursor-pointer relative group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowImagePicker(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
