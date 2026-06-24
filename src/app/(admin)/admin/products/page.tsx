"use client";

import { useEffect, useRef, useState } from "react";
import { BackendProduct, getAllProducts, formatPKR } from "@/src/services/productService";
import { addProductAPI, updateProductAPI, deleteProductAPI, getAllCategoriesAPI, BackendCategory, addMediaAPI } from "@/src/services/adminService";
import { uploadImage } from "@/src/services/cloudinaryService";
import MediaPickerModal from "@/src/components/admin/MediaPickerModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<BackendProduct | null>(null);

  // Media Picker Modal States
  const [isProductMediaOpen, setIsProductMediaOpen] = useState(false);
  const [isVariantMediaOpen, setIsVariantMediaOpen] = useState(false);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string;
    images: string[];
    sizes: string[];
    colors: string[];
    variants: {
      size: string;
      color: string;
      price: number;
      stock: number;
      imageUrl?: string;
      images?: string[];
    }[];
    discountPercent: number;
    imageUrl: string;
    section: string;
  }>({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
    images: [],
    sizes: [],
    colors: [],
    variants: [],
    discountPercent: 0,
    imageUrl: "",
    section: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cloudinaryWarning, setCloudinaryWarning] = useState(false);
  const [variantUploading, setVariantUploading] = useState<Record<number, boolean>>({});
  const [categoriesList, setCategoriesList] = useState<BackendCategory[]>([]);
  const variantFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Variant Manager Modal States
  const [isVariantManagerOpen, setIsVariantManagerOpen] = useState(false);
  const [variantManagerProductId, setVariantManagerProductId] = useState<number | null>(null);
  const [variantManagerMode, setVariantManagerMode] = useState<"add" | "edit">("add");
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [isVariantManagerMediaOpen, setIsVariantManagerMediaOpen] = useState(false);

  // Variant Form State
  const [variantForm, setVariantForm] = useState<{
    size: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
    imageUrl: string;
  }>({
    size: "",
    color: "",
    price: 0,
    stock: 0,
    images: [],
    imageUrl: "",
  });

  const [variantCustomSize, setVariantCustomSize] = useState("");
  const [variantCustomColorName, setVariantCustomColorName] = useState("");
  const [variantCustomColorHex, setVariantCustomColorHex] = useState("#000000");
  const [variantFormError, setVariantFormError] = useState("");
  const [variantFormLoading, setVariantFormLoading] = useState(false);
  const [variantFormUploading, setVariantFormUploading] = useState(false);

  // Options states
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [customSize, setCustomSize] = useState("");

  // File Upload Handler (uploads files to Cloudinary, falling back to Base64)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    setUploading(true);
    setFormError("");
    setCloudinaryWarning(false);

    try {
      const uploadPromises = files.map(async (file) => {
        const res = await uploadImage(file);
        if (res.source === "base64") {
          setCloudinaryWarning(true);
        }
        // Save to central media gallery too
        try {
          await addMediaAPI(res.url);
        } catch (err) {
          console.error("Failed to add uploaded image to media gallery:", err);
        }
        return res.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData((prev) => {
        const mainImg = prev.imageUrl ? prev.imageUrl : (uploadedUrls[0] || "");
        return {
          ...prev,
          images: [...prev.images, ...uploadedUrls],
          imageUrl: mainImg,
        };
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to upload one or more images.");
    } finally {
      setUploading(false);
    }
  };

  const setAsThumbnail = (imgUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: imgUrl
    }));
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => {
      const mainImg = prev.imageUrl ? prev.imageUrl : newImageUrl.trim();
      return {
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
        imageUrl: mainImg
      };
    });
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const removedImg = prev.images[index];
      const filtered = prev.images.filter((_, i) => i !== index);
      // If we deleted the thumbnail, set it to the first available image, or empty
      const isThumbnail = prev.imageUrl === removedImg;
      const mainImg = isThumbnail ? (filtered[0] || "") : prev.imageUrl;
      return {
        ...prev,
        images: filtered,
        imageUrl: mainImg
      };
    });
  };

  const toggleSize = (size: string) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(size);
      const newSizes = exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  const addCustomSize = () => {
    if (!customSize.trim()) return;
    if (!formData.sizes.includes(customSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, customSize.trim()]
      }));
    }
    setCustomSize("");
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    const colorStr = `${newColorName.trim()}:${newColorHex}`;
    if (!formData.colors.includes(colorStr)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, colorStr]
      }));
    }
    setNewColorName("");
    setNewColorHex("#000000");
  };

  const removeColor = (colorStr: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== colorStr)
    }));
  };

  const generateCombinations = () => {
    const newVariants: any[] = [];
    formData.sizes.forEach(size => {
      formData.colors.forEach(color => {
        const existing = formData.variants.find(v => v.size === size && v.color === color);
        if (existing) {
          newVariants.push(existing);
        } else {
          newVariants.push({
            size,
            color,
            price: formData.price,
            stock: formData.stock,
            imageUrl: formData.images[0] || "",
            images: formData.images[0] ? [formData.images[0]] : [],
          });
        }
      });
    });
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const addCustomVariant = () => {
    const defaultSize = formData.sizes[0] || "Newborn";
    const defaultColor = formData.colors[0] || "Default:#b5374a";
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: defaultSize,
          color: defaultColor,
          price: prev.price,
          stock: prev.stock,
          imageUrl: prev.images[0] || "",
          images: prev.images[0] ? [prev.images[0]] : [],
        }
      ]
    }));
  };

  const handleSelectProductMedia = (urls: string[]) => {
    setFormData(prev => {
      const uniqueNewUrls = urls.filter(url => !prev.images.includes(url));
      const mainImg = prev.imageUrl ? prev.imageUrl : (uniqueNewUrls[0] || "");
      return {
        ...prev,
        images: [...prev.images, ...uniqueNewUrls],
        imageUrl: mainImg
      };
    });
  };

  const handleSelectVariantMedia = (urls: string[]) => {
    if (activeVariantIndex === null) return;
    setFormData(prev => {
      const updated = [...prev.variants];
      const v = updated[activeVariantIndex];
      const currentImages = v.images || (v.imageUrl ? [v.imageUrl] : []);
      const uniqueNewUrls = urls.filter(url => !currentImages.includes(url));
      const newImages = [...currentImages, ...uniqueNewUrls];
      updated[activeVariantIndex] = {
        ...v,
        imageUrl: newImages[0] || "",
        images: newImages
      };
      return { ...prev, variants: updated };
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setVariantUploading(prev => ({ ...prev, [index]: true }));
    try {
      const res = await uploadImage(file);
      if (res.source === "base64") setCloudinaryWarning(true);

      // Save to media gallery
      try {
        await addMediaAPI(res.url);
      } catch (err) {
        console.error("Failed to add variant uploaded image to media gallery:", err);
      }

      setFormData(prev => {
        const updated = [...prev.variants];
        const v = updated[index];
        const currentImages = v.images || (v.imageUrl ? [v.imageUrl] : []);
        const newImages = [...currentImages, res.url];
        updated[index] = {
          ...v,
          imageUrl: newImages[0] || "",
          images: newImages
        };
        return { ...prev, variants: updated };
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to upload variant image.");
    } finally {
      setVariantUploading(prev => ({ ...prev, [index]: false }));
    }
  };

  // --- NEW HANDLERS FOR VARIANT MANAGER MODAL ---
  const selectedVMProduct = products.find(p => p.id === variantManagerProductId);

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantManagerProductId || !selectedVMProduct) return;
    
    // Resolve color and size
    const sizeToSave = variantForm.size === "custom" ? variantCustomSize.trim() : variantForm.size;
    const colorName = variantCustomColorName.trim();
    const colorToSave = colorName ? `${colorName}:${variantCustomColorHex}` : variantForm.color;

    if (!sizeToSave) {
      setVariantFormError("Please select or enter a size.");
      return;
    }
    if (!colorToSave) {
      setVariantFormError("Please select or enter a color.");
      return;
    }

    setVariantFormLoading(true);
    setVariantFormError("");

    try {
      // Prepare updated variants list
      let updatedVariants = [...(selectedVMProduct.variants || [])];
      
      const newVariant = {
        size: sizeToSave,
        color: colorToSave,
        price: variantForm.price,
        stock: variantForm.stock,
        imageUrl: variantForm.imageUrl || variantForm.images[0] || "",
        images: variantForm.images,
      };

      if (variantManagerMode === "add") {
        // Check for duplicates
        const exists = updatedVariants.some(v => v.size === sizeToSave && v.color === colorToSave);
        if (exists) {
          setVariantFormError("A variant with this size and color combination already exists.");
          setVariantFormLoading(false);
          return;
        }
        updatedVariants.push(newVariant);
      } else if (variantManagerMode === "edit" && editingVariantIndex !== null) {
        updatedVariants[editingVariantIndex] = newVariant;
      }

      // Prepare product sizes and colors lists (must contain the new size/color)
      const updatedSizes = [...(selectedVMProduct.sizes || [])];
      if (!updatedSizes.includes(sizeToSave)) {
        updatedSizes.push(sizeToSave);
      }
      const updatedColors = [...(selectedVMProduct.colors || [])];
      if (!updatedColors.includes(colorToSave)) {
        updatedColors.push(colorToSave);
      }

      // Prepare full product payload
      const updatedProductData = {
        name: selectedVMProduct.name,
        category: selectedVMProduct.category || "",
        price: selectedVMProduct.price,
        stock: selectedVMProduct.quantity,
        description: selectedVMProduct.description || "",
        images: selectedVMProduct.images || (selectedVMProduct.imageUrl ? [selectedVMProduct.imageUrl] : []),
        sizes: updatedSizes,
        colors: updatedColors,
        variants: updatedVariants.map(v => ({
          ...v,
          images: v.images || (v.imageUrl ? [v.imageUrl] : []),
        })),
        discountPercent: selectedVMProduct.discountPercent || 0,
        imageUrl: selectedVMProduct.imageUrl || "",
        section: selectedVMProduct.section || "",
      };

      // Send API update
      const updatedProduct = await updateProductAPI(selectedVMProduct.id, updatedProductData);
      
      // Update local state
      setProducts(prev => prev.map(p => p.id === selectedVMProduct.id ? updatedProduct : p));

      // Reset form
      setVariantForm({
        size: "",
        color: "",
        price: selectedVMProduct.price,
        stock: selectedVMProduct.quantity,
        images: [],
        imageUrl: "",
      });
      setVariantCustomSize("");
      setVariantCustomColorName("");
      setVariantCustomColorHex("#000000");
      setVariantManagerMode("add");
      setEditingVariantIndex(null);
    } catch (err: any) {
      setVariantFormError(err.response?.data?.message || "Failed to save variant.");
    } finally {
      setVariantFormLoading(false);
    }
  };

  const handleDeleteVariant = async (index: number) => {
    if (!variantManagerProductId || !selectedVMProduct) return;
    if (!confirm("Are you sure you want to delete this variant?")) return;

    try {
      setVariantFormLoading(true);
      // Remove variant from list
      const updatedVariants = (selectedVMProduct.variants || []).filter((_, i) => i !== index);

      // Prepare updated product payload
      const updatedProductData = {
        name: selectedVMProduct.name,
        category: selectedVMProduct.category || "",
        price: selectedVMProduct.price,
        stock: selectedVMProduct.quantity,
        description: selectedVMProduct.description || "",
        images: selectedVMProduct.images || (selectedVMProduct.imageUrl ? [selectedVMProduct.imageUrl] : []),
        sizes: selectedVMProduct.sizes || [],
        colors: selectedVMProduct.colors || [],
        variants: updatedVariants.map(v => ({
          ...v,
          images: v.images || (v.imageUrl ? [v.imageUrl] : []),
        })),
        discountPercent: selectedVMProduct.discountPercent || 0,
        imageUrl: selectedVMProduct.imageUrl || "",
        section: selectedVMProduct.section || "",
      };

      // Send API update
      const updatedProduct = await updateProductAPI(selectedVMProduct.id, updatedProductData);
      
      // Update local state
      setProducts(prev => prev.map(p => p.id === selectedVMProduct.id ? updatedProduct : p));
    } catch (err: any) {
      alert("Failed to delete variant: " + (err.response?.data?.message || err.message));
    } finally {
      setVariantFormLoading(false);
    }
  };

  const handleEditVariantClick = (index: number) => {
    if (!selectedVMProduct) return;
    const v = (selectedVMProduct.variants || [])[index];
    if (!v) return;

    const standardSizes = ["Newborn", "0-3 Months", "3-6 Months", "6-12 Months", "12-24 Months", "S", "M", "L", "XL"];
    const isStandardSize = standardSizes.includes(v.size);

    setVariantForm({
      size: isStandardSize ? v.size : "custom",
      color: v.color,
      price: v.price || selectedVMProduct.price,
      stock: v.stock,
      images: v.images || (v.imageUrl ? [v.imageUrl] : []),
      imageUrl: v.imageUrl || "",
    });

    if (!isStandardSize) {
      setVariantCustomSize(v.size);
    } else {
      setVariantCustomSize("");
    }

    const parts = v.color.split(":");
    setVariantCustomColorName(parts[0]);
    setVariantCustomColorHex(parts[1] || "#000000");

    setVariantManagerMode("edit");
    setEditingVariantIndex(index);
    setVariantFormError("");
  };

  const handleVariantFormFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    setVariantFormUploading(true);
    setVariantFormError("");

    try {
      const uploadPromises = files.map(async (file) => {
        const res = await uploadImage(file);
        try {
          await addMediaAPI(res.url);
        } catch (err) {
          console.error("Failed to add uploaded image to media gallery:", err);
        }
        return res.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setVariantForm((prev) => {
        const mainImg = prev.imageUrl ? prev.imageUrl : (uploadedUrls[0] || "");
        return {
          ...prev,
          images: [...prev.images, ...uploadedUrls],
          imageUrl: mainImg,
        };
      });
    } catch (err: any) {
      setVariantFormError(err.message || "Failed to upload one or more images.");
    } finally {
      setVariantFormUploading(false);
    }
  };

  const handleSelectVariantManagerMedia = (urls: string[]) => {
    setVariantForm((prev) => {
      const uniqueNewUrls = urls.filter(url => !prev.images.includes(url));
      const mainImg = prev.imageUrl ? prev.imageUrl : (uniqueNewUrls[0] || "");
      return {
        ...prev,
        images: [...prev.images, ...uniqueNewUrls],
        imageUrl: mainImg,
      };
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (err) {
      setError("Failed to load products. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    getAllCategoriesAPI()
      .then(cats => setCategoriesList(cats || []))
      .catch(() => setCategoriesList([]));
  }, []);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setFormData({
      name: "",
      category: "",
      price: 0,
      stock: 0,
      description: "",
      images: [],
      sizes: [],
      colors: [],
      variants: [],
      discountPercent: 0,
      imageUrl: "",
      section: "",
    });
    setFormError("");
    setUploading(false);
    setCloudinaryWarning(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: BackendProduct) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category || "",
      price: product.price,
      stock: product.quantity,
      description: product.description || "",
      images: product.images || (product.imageUrl ? [product.imageUrl] : []),
      sizes: product.sizes || [],
      colors: product.colors || [],
      variants: (product.variants || []).map((v) => ({
        ...v,
        images: v.images || (v.imageUrl ? [v.imageUrl] : []),
      })),
      discountPercent: product.discountPercent || 0,
      imageUrl: product.imageUrl || "",
      section: product.section || "",
    });
    setFormError("");
    setUploading(false);
    setCloudinaryWarning(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" || name === "discountPercent" ? Number(value) : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.price <= 0 || formData.stock < 0) {
      setFormError("Please fill in all required fields with valid values.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      if (modalMode === "add") {
        const newProduct = await addProductAPI(formData);
        setProducts((prev) => [...prev, newProduct]);
      } else if (modalMode === "edit" && selectedProduct) {
        const updatedProduct = await updateProductAPI(selectedProduct.id, formData);
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
        );
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save product.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProductAPI(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product. It might be associated with active orders.");
    }
  };

  // Filter and Search logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const getStockBadgeClass = (stock: number) => {
    if (stock === 0) return "bg-red-50 text-red-700 border-red-100";
    if (stock <= 10) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return `Low Stock (${stock})`;
    return `In Stock (${stock})`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage and track your products catalog</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setVariantManagerProductId(null);
              setVariantForm({
                size: "",
                color: "",
                price: 0,
                stock: 0,
                images: [],
                imageUrl: "",
              });
              setVariantCustomSize("");
              setVariantCustomColorName("");
              setVariantCustomColorHex("#000000");
              setVariantManagerMode("add");
              setEditingVariantIndex(null);
              setVariantFormError("");
              setIsVariantManagerOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white font-medium text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
          >
            <span>🎭</span> Manage/Link Variants
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm cursor-pointer"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <span>➕</span> Add New Product
          </button>
        </div>
      </div>

      {/* Main Filter & Table Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Controls */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-gray-500">
              <div className="animate-spin text-4xl mb-4 inline-block">🐝</div>
              <p>Loading inventory...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center text-red-500">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center text-gray-400">No products found matching filters.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Product ID</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock Status</th>
                  <th className="p-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 pl-6 text-sm font-medium text-gray-400">#{product.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl overflow-hidden border border-gray-100 flex-shrink-0">
                          {product.imageUrl || (product.images && product.images[0]) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl || (product.images && product.images[0])}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "🧸"
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-800">
                      {formatPKR(product.price)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStockBadgeClass(
                          product.quantity
                        )}`}
                      >
                        {getStockText(product.quantity)}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setVariantManagerProductId(product.id);
                          setVariantForm({
                            size: "",
                            color: "",
                            price: product.price,
                            stock: product.quantity,
                            images: [],
                            imageUrl: "",
                          });
                          setVariantCustomSize("");
                          setVariantCustomColorName("");
                          setVariantCustomColorHex("#000000");
                          setVariantManagerMode("add");
                          setEditingVariantIndex(null);
                          setVariantFormError("");
                          setIsVariantManagerOpen(true);
                        }}
                        className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        title="Manage Variants"
                      >
                        🎭
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Edit Product"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Product"
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
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden border border-gray-100 animate-scaleUp">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {modalMode === "add" ? "Add New Product" : "Edit Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-4 rounded-xl text-sm bg-red-50 text-red-600 font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Basic Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 border-b pb-2 uppercase tracking-wide">1. Product Details</h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Wooden Teddy Bear"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white appearance-none cursor-pointer"
                        required
                      >
                        <option value="" disabled>Select category...</option>
                        {categoriesList.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                        {categoriesList.length === 0 && (
                          <option disabled>Loading categories...</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Base Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="100"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Base Price (PKR) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="1500"
                        min="1"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Discount Percent (%)
                      </label>
                      <input
                        type="number"
                        name="discountPercent"
                        value={formData.discountPercent}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        max="100"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Storefront Section
                      </label>
                      <select
                        name="section"
                        value={formData.section}
                        onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white appearance-none cursor-pointer"
                      >
                        <option value="">None (Standard)</option>
                        <option value="trending">Trending</option>
                        <option value="bestseller">Bestseller</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the product..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Right Column: Multiple Images, Sizes, Colors */}
                <div className="space-y-6">
                  {/* Multiple Images Editor */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 border-b pb-2 uppercase tracking-wide">2. Product Images</h4>
                    
                    {/* Local File System Upload / Cloudinary Loader */}
                    {uploading ? (
                      <div className="p-4 border-2 border-dashed border-red-200 rounded-2xl bg-red-50/20 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl animate-spin mb-1">🐝</span>
                        <span className="text-xs font-semibold text-red-600">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <div className="p-3 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition relative flex flex-col items-center justify-center text-center cursor-pointer">
                        <span className="text-2xl mb-1">📤</span>
                        <span className="text-xs font-semibold text-gray-600">Click to upload from system</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Supports PNG, JPG, JPEG (multiple allowed)</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                      </div>
                    )}

                    {cloudinaryWarning && (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 leading-normal">
                        ⚠️ Using Base64 fallback. For production-grade speed, please configure Cloudinary variables in your <code>.env.local</code> file:
                        <pre className="mt-1 bg-white/60 p-1.5 rounded text-[9px] font-mono">
                          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...&#10;
                          NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
                        </pre>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Or Paste Image URL..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="px-4 py-2 rounded-xl text-white text-xs font-semibold bg-gray-800 hover:bg-gray-700 transition cursor-pointer"
                      >
                        Add URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsProductMediaOpen(true)}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                      >
                        📷 Gallery
                      </button>
                    </div>

                    {/* Image thumbnails list with main image badge */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {formData.images.map((imgUrl, i) => {
                          const isPrimary = formData.imageUrl === imgUrl;
                          return (
                            <div key={i} className="relative group w-18 h-18 rounded-xl border overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imgUrl}
                                alt={`preview-${i}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              {/* Primary Selection Indicator */}
                              <button
                                type="button"
                                onClick={() => setAsThumbnail(imgUrl)}
                                className={`absolute top-0.5 left-0.5 text-[8px] px-1 py-0.5 rounded font-bold transition-all shadow-sm ${
                                  isPrimary ? "bg-amber-500 text-white" : "bg-black/60 text-white/80 hover:bg-black/80"
                                }`}
                              >
                                {isPrimary ? "★ Primary" : "☆ Set"}
                              </button>
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-0.5 right-0.5 w-4.5 h-4.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white font-bold text-[9px] flex items-center justify-center transition"
                                title="Delete Image"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sizes Toggle */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 border-b pb-2 uppercase tracking-wide">3. Clothing Sizes</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Newborn", "0-3 Months", "3-6 Months", "6-12 Months", "12-24 Months", "S", "M", "L", "XL"].map((sz) => {
                        const active = formData.sizes.includes(sz);
                        return (
                          <button
                            type="button"
                            key={sz}
                            onClick={() => toggleSize(sz)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              active
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                    {/* Custom size input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Or custom size (e.g. 2-3 Years)..."
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addCustomSize}
                        className="px-4 py-2 rounded-xl text-white text-xs font-semibold bg-gray-800 hover:bg-gray-700 transition"
                      >
                        Add Size
                      </button>
                    </div>
                  </div>

                  {/* Colors Editor */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 border-b pb-2 uppercase tracking-wide">4. Clothing Colors</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Color Name (e.g. Peach)..."
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                      />
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-10 h-8 rounded border border-gray-200 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={addColor}
                          className="flex-1 px-4 py-2 rounded-xl text-white text-xs font-semibold bg-gray-800 hover:bg-gray-700 transition"
                        >
                          Add Color
                        </button>
                      </div>
                    </div>

                    {/* Color Badges List */}
                    {formData.colors.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.colors.map((colorStr) => {
                          const parts = colorStr.split(":");
                          const name = parts[0];
                          const hex = parts[1] || "#000000";
                          return (
                            <div
                              key={colorStr}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold bg-gray-50 border-gray-200"
                            >
                              <span
                                className="w-3 h-3 rounded-full border inline-block"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-gray-700">{name}</span>
                              <button
                                type="button"
                                onClick={() => removeColor(colorStr)}
                                className="text-gray-400 hover:text-red-500 font-bold ml-1 transition"
                                title="Remove Color"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lower Section: Variants Table Override */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">5. Clothing Variants Overrides</h4>
                    <p className="text-xs text-gray-400 mt-1">Configure price, stock, and images for specific size/color combinations</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addCustomVariant}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer"
                    >
                      ➕ Add Custom Variant
                    </button>
                    <button
                      type="button"
                      onClick={generateCombinations}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition cursor-pointer"
                    >
                      🔄 Auto-Generate Combinations
                    </button>
                  </div>
                </div>

                {formData.variants.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-xs text-gray-400">
                    No variants generated. Click &quot;Auto-Generate Combinations&quot; above to link active sizes and colors.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b">
                          <th className="p-3">Variant (Size/Color)</th>
                          <th className="p-3">Price override (PKR)</th>
                          <th className="p-3">Stock Quantity</th>
                          <th className="p-3">Variant Images</th>
                          <th className="p-3 pr-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {formData.variants.map((v, i) => {
                          const colorParts = v.color.split(":");
                          const colorName = colorParts[0];
                          const colorHex = colorParts[1] || "#000000";
                          const variantImages = v.images || (v.imageUrl ? [v.imageUrl] : []);
                          return (
                            <tr key={i} className="hover:bg-gray-50/50 transition">
                              <td className="p-3 font-semibold text-gray-700">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-gray-100 font-bold">{v.size}</span>
                                  <span className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block border" style={{ backgroundColor: colorHex }} />
                                    {colorName}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={v.price || formData.price}
                                  onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                                  className="w-24 px-2.5 py-1 rounded border border-gray-200 text-xs focus:outline-none"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                                  className="w-20 px-2.5 py-1 rounded border border-gray-200 text-xs focus:outline-none"
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col gap-2">
                                  {/* Thumbnail preview list */}
                                  {variantImages.length > 0 && (
                                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                                      {variantImages.map((imgUrl, imgIdx) => (
                                        <div key={imgIdx} className="relative w-8 h-8 rounded border overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                                          <img src={imgUrl} className="w-full h-full object-cover" />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newImages = variantImages.filter((_, idx) => idx !== imgIdx);
                                              updateVariant(i, "images", newImages);
                                              updateVariant(i, "imageUrl", newImages[0] || "");
                                            }}
                                            className="absolute top-0 right-0 w-3 h-3 bg-red-600 text-white rounded-full flex items-center justify-center text-[7px] font-bold cursor-pointer"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Buttons */}
                                  <div className="flex gap-1.5 items-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveVariantIndex(i);
                                        setIsVariantMediaOpen(true);
                                      }}
                                      className="px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-[9px] font-semibold text-gray-600 transition flex items-center gap-1 cursor-pointer"
                                    >
                                      📷 Gallery
                                    </button>

                                    {variantUploading[i] ? (
                                      <span className="text-[9px] text-red-500 animate-pulse">Uploading...</span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => variantFileRefs.current[i]?.click()}
                                        className="px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-[9px] font-semibold text-gray-600 transition flex items-center gap-1 cursor-pointer"
                                      >
                                        📤 Upload
                                      </button>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      ref={(el) => { variantFileRefs.current[i] = el; }}
                                      onChange={(e) => handleVariantImageUpload(i, e)}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 pr-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeVariant(i)}
                                  className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                                  title="Delete Variant"
                                >
                                  ✕ Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-full text-white font-medium text-sm transition-all shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {formLoading ? "Saving..." : modalMode === "add" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Gallery Pickers */}
      <MediaPickerModal
        isOpen={isProductMediaOpen}
        onClose={() => setIsProductMediaOpen(false)}
        onSelect={handleSelectProductMedia}
        multiple={true}
      />

      <MediaPickerModal
        isOpen={isVariantMediaOpen}
        onClose={() => setIsVariantMediaOpen(false)}
        onSelect={handleSelectVariantMedia}
        multiple={true}
      />

      {/* Variant Manager Modal */}
      {isVariantManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden border border-gray-100 animate-scaleUp">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Manage & Link Variants</h3>
                <p className="text-xs text-gray-400 mt-1">Add variants with multi-angle galleries and link them to products</p>
              </div>
              <button
                onClick={() => setIsVariantManagerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
              {/* Product Selection and Variant Form (Left 5 Cols) */}
              <div className="lg:col-span-5 space-y-5 border-r pr-6 border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">1. Link to Product</h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Target Product *
                  </label>
                  <select
                    value={variantManagerProductId || ""}
                    onChange={(e) => {
                      const pid = Number(e.target.value);
                      setVariantManagerProductId(pid);
                      const p = products.find(prod => prod.id === pid);
                      if (p) {
                        setVariantForm(prev => ({
                          ...prev,
                          price: p.price,
                          stock: p.quantity,
                        }));
                      }
                      setVariantManagerMode("add");
                      setEditingVariantIndex(null);
                      setVariantFormError("");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a product to link...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>#{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>

                {variantManagerProductId && selectedVMProduct && (
                  <form onSubmit={handleSaveVariant} className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-t pt-4">
                      {variantManagerMode === "add" ? "2. Add Variant Details" : "2. Edit Variant Details"}
                    </h4>

                    {variantFormError && (
                      <div className="p-3 rounded-xl text-xs bg-red-50 text-red-600 font-medium">
                        {variantFormError}
                      </div>
                    )}

                    {/* Size Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Size Selection
                      </label>
                      <select
                        value={variantForm.size}
                        onChange={(e) => {
                          setVariantForm(prev => ({ ...prev, size: e.target.value }));
                          if (e.target.value !== "custom") {
                            setVariantCustomSize("");
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white cursor-pointer"
                      >
                        <option value="">Select size...</option>
                        {["Newborn", "0-3 Months", "3-6 Months", "6-12 Months", "12-24 Months", "S", "M", "L", "XL"].map(sz => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                        <option value="custom">-- Custom Size --</option>
                      </select>

                      {variantForm.size === "custom" && (
                        <input
                          type="text"
                          placeholder="Enter custom size (e.g. 3-4 Years)..."
                          value={variantCustomSize}
                          onChange={(e) => setVariantCustomSize(e.target.value)}
                          className="w-full mt-2 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                        />
                      )}
                    </div>

                    {/* Color Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Color Definition
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Color Name (e.g. Lavender)..."
                          value={variantCustomColorName}
                          onChange={(e) => setVariantCustomColorName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                        />
                        <input
                          type="color"
                          value={variantCustomColorHex}
                          onChange={(e) => setVariantCustomColorHex(e.target.value)}
                          className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Price and Stock */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Price Override (PKR)
                        </label>
                        <input
                          type="number"
                          value={variantForm.price}
                          onChange={(e) => setVariantForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="Price..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          value={variantForm.stock}
                          onChange={(e) => setVariantForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          placeholder="Stock..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                        />
                      </div>
                    </div>

                    {/* Variant Images Gallery (Multiple angle support) */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Variant Image Gallery (Different Angles)
                      </label>
                      
                      <div className="flex gap-2">
                        {/* File upload */}
                        <div className="relative flex-1">
                          <button
                            type="button"
                            className="w-full py-2 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {variantFormUploading ? "Uploading..." : "📤 Upload Files"}
                          </button>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleVariantFormFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={variantFormUploading}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsVariantManagerMediaOpen(true)}
                          className="flex-1 py-2 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          📷 Gallery
                        </button>
                      </div>

                      {/* Display variant images */}
                      {variantForm.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 pt-2">
                          {variantForm.images.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="relative w-14 h-14 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                              <img src={imgUrl} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = variantForm.images.filter((_, idx) => idx !== imgIdx);
                                  setVariantForm(prev => ({
                                    ...prev,
                                    images: newImages,
                                    imageUrl: prev.imageUrl === imgUrl ? (newImages[0] || "") : prev.imageUrl,
                                  }));
                                }}
                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        disabled={variantFormLoading}
                        className="flex-1 py-2 rounded-xl text-white font-semibold text-xs transition-all shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        {variantFormLoading ? "Saving..." : variantManagerMode === "add" ? "Link New Variant" : "Save Changes"}
                      </button>
                      {variantManagerMode === "edit" && (
                        <button
                          type="button"
                          onClick={() => {
                            setVariantForm({
                              size: "",
                              color: "",
                              price: selectedVMProduct.price,
                              stock: selectedVMProduct.quantity,
                              images: [],
                              imageUrl: "",
                            });
                            setVariantCustomSize("");
                            setVariantCustomColorName("");
                            setVariantCustomColorHex("#000000");
                            setVariantManagerMode("add");
                            setEditingVariantIndex(null);
                            setVariantFormError("");
                          }}
                          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Right Side: List of Variants for selected product (Right 7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {selectedVMProduct ? `Linked Variants for "${selectedVMProduct.name}"` : "Product Variants List"}
                </h4>

                {!variantManagerProductId ? (
                  <div className="p-16 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm">
                    Select a product on the left to view and manage its linked variants.
                  </div>
                ) : !selectedVMProduct || !selectedVMProduct.variants || selectedVMProduct.variants.length === 0 ? (
                  <div className="p-16 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm">
                    No variants currently linked to this product. Use the form on the left to add one!
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b">
                          <th className="p-3 pl-4">Variant (Size/Color)</th>
                          <th className="p-3">Price (PKR)</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">Images</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedVMProduct.variants.map((v, i) => {
                          const colorParts = v.color.split(":");
                          const colorName = colorParts[0];
                          const colorHex = colorParts[1] || "#000000";
                          const variantImages = v.images || (v.imageUrl ? [v.imageUrl] : []);
                          return (
                            <tr key={i} className="hover:bg-gray-50/50 transition">
                              <td className="p-3 pl-4">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-gray-100 font-bold">{v.size}</span>
                                  <span className="flex items-center gap-1">
                                    <span
                                      className="w-3 h-3 rounded-full inline-block border border-gray-200"
                                      style={{ backgroundColor: colorHex }}
                                    />
                                    {colorName}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 font-semibold text-gray-800">
                                {formatPKR(v.price || selectedVMProduct.price)}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded font-semibold ${v.stock === 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                                  {v.stock}
                                </span>
                              </td>
                              <td className="p-3">
                                {variantImages.length > 0 ? (
                                  <div className="flex gap-0.5">
                                    {variantImages.map((img, imgIdx) => (
                                      <div key={imgIdx} className="w-6 h-6 rounded border overflow-hidden bg-gray-50 flex-shrink-0">
                                        <img src={img} className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">None</span>
                                )}
                              </td>
                              <td className="p-3 pr-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditVariantClick(i)}
                                  className="text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVariant(i)}
                                  className="text-red-600 hover:text-red-800 font-medium transition cursor-pointer"
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsVariantManagerOpen(false)}
                className="px-6 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variant Manager Media Picker */}
      <MediaPickerModal
        isOpen={isVariantManagerMediaOpen}
        onClose={() => setIsVariantManagerMediaOpen(false)}
        onSelect={handleSelectVariantManagerMedia}
        multiple={true}
      />
    </div>
  );
}
