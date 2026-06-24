"use client";

import { useEffect, useState } from "react";
import {
  getAllCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  getExistingImagesAPI,
  BackendCategory
} from "@/src/services/adminService";
import { uploadImage } from "@/src/services/cloudinaryService";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Existing Images Gallery Picker State
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<BackendCategory | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    imageUrl: "",
    parentId: "" as string | number,
    displayOrder: 1
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cloudinaryWarning, setCloudinaryWarning] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategoriesAPI();
      setCategories(data || []);
    } catch (err) {
      setError("Failed to load categories.");
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
    fetchCategories();
    fetchExistingImages();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedCategory(null);
    setFormData({
      name: "",
      slug: "",
      imageUrl: "",
      parentId: "",
      displayOrder: categories.length + 1
    });
    setFormError("");
    setCloudinaryWarning(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: BackendCategory) => {
    setModalMode("edit");
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || "",
      imageUrl: cat.imageUrl || "",
      parentId: cat.parent ? cat.parent.id : "",
      displayOrder: cat.displayOrder || 0
    });
    setFormError("");
    setCloudinaryWarning(false);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || modalMode === "add" ? autoSlug : prev.slug
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
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
    if (!formData.name || !formData.slug) {
      setFormError("Name and Slug are required.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    const payload = {
      name: formData.name,
      slug: formData.slug,
      imageUrl: formData.imageUrl,
      parentId: formData.parentId ? Number(formData.parentId) : null,
      displayOrder: Number(formData.displayOrder || 0)
    };

    try {
      if (modalMode === "add") {
        const newCat = await createCategoryAPI(payload);
        setCategories((prev) => [...prev, newCat]);
      } else if (modalMode === "edit" && selectedCategory) {
        const updatedCat = await updateCategoryAPI(selectedCategory.id, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === selectedCategory.id ? updatedCat : c))
        );
      }
      setIsModalOpen(false);
      fetchExistingImages(); // refresh existing list
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? Any associated subcategories or products will be affected.")) return;

    try {
      await deleteCategoryAPI(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete category. Ensure no products are linked to this category.");
    }
  };

  const filteredCategories = categories
    .filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-lora">Categories Management</h1>
          <p className="text-gray-500 mt-1">Manage parent and sub-categories catalog</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm bg-red-600 cursor-pointer"
        >
          ➕ Add New Category
        </button>
      </div>

      {/* Main Filter & Table Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Controls */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-gray-500">
              <span className="animate-spin text-4xl mb-4 inline-block">🗂️</span>
              <p>Loading categories...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center text-red-500">{error}</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-16 text-center text-gray-400">No categories found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Order</th>
                  <th className="p-4 font-medium">Image</th>
                  <th className="p-4 font-medium">Category Name</th>
                  <th className="p-4 font-medium">Slug</th>
                  <th className="p-4 font-medium">Parent Category</th>
                  <th className="p-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 pl-6 text-sm font-bold text-gray-800">
                      #{cat.displayOrder || 0}
                    </td>
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden flex items-center justify-center bg-gray-50 flex-shrink-0">
                        {cat.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">🗂️</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-800 text-sm">
                      {cat.name}
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500">
                      {cat.slug}
                    </td>
                    <td className="p-4 text-xs">
                      {cat.parent ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-semibold border border-red-100">
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">None (Root)</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Edit Category"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Category"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Dialog Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-gray-100 animate-scaleUp">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 font-lora">
                {modalMode === "add" ? "Add Category" : "Edit Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl text-xs bg-red-50 text-red-600 font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Newborn Accessories"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Slug (Auto-generated) *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. newborn-accessories"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Parent Category
                  </label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white appearance-none cursor-pointer"
                  >
                    <option value="">None (Root Category)</option>
                    {categories
                      .filter((c) => selectedCategory ? c.id !== selectedCategory.id : true) // avoid nesting in itself
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
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

              {/* Image Input Selection */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Category Image
                </label>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                  >
                    🖼️ Gallery
                  </button>
                </div>

                {/* Existing Images Gallery Picker */}
                {showImagePicker && (
                  <div className="p-3 border border-gray-100 bg-gray-50 rounded-2xl max-h-40 overflow-y-auto mb-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Choose from Catalog Images:</p>
                    {existingImages.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No existing catalog images found.</p>
                    ) : (
                      <div className="grid grid-cols-5 gap-2">
                        {existingImages.map((url, index) => (
                          <div
                            key={index}
                            onClick={() => selectExistingImage(url)}
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
                  <div className="p-3 border-2 border-dashed border-red-200 rounded-xl bg-red-50/20 text-center text-xs text-red-600 font-semibold">
                    Uploading image...
                  </div>
                ) : (
                  <div className="relative p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition text-center cursor-pointer">
                    <span className="text-xs font-semibold text-gray-600">Upload new image file</span>
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
                  <div className="mt-3 w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imageUrl}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 mt-4 rounded-full text-white font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md bg-red-600 hover:bg-red-700"
              >
                {formLoading ? "Saving Category..." : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
