// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Upload, X, Save, Loader2, Plus } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { getProductById, updateProduct, uploadImage, getCategories, getBrands } from "@/lib/api";
import { Suspense } from "react";

function EditProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [brand, setBrand] = useState("");
  const [gender, setGender] = useState("");
  const [images, setImages] = useState([]); // existing URLs
  const [newImages, setNewImages] = useState([]); // { file, preview }
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [justLanded, setJustLanded] = useState(false);
  const [accessories, setAccessories] = useState(false);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");

  // Load product and categories
  useEffect(() => {
    if (!productId) {
      return;
    }

    Promise.all([getProductById(productId), getCategories(), getBrands()])
      .then(([product, cats, brandData]) => {
        if (!product) {
          setError("Product not found");
          return;
        }
        setCategories(cats || []);
        setBrands(brandData || []);
        setName(product.name || product.title || "");
        setCategory(product.category || "");
        setDescription(product.description || "");
        setPrice(String(product.price || ""));
        setOriginalPrice(String(product.originalPrice || ""));
        setStock(product.stock || 0);
        setBrand(product.brand || "");
        setGender(product.gender || "");
        setImages(product.images || []);
        setFeatured(Boolean(product.featured));
        setBestSeller(Boolean(product.bestSeller));
        setJustLanded(Boolean(product.justLanded));
        setAccessories(Boolean(product.accessories));
        setColors(product.colors || []);
        setSizes(product.sizes || []);
      })
      .catch((err) => setError(err.message || "Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].preview);
      updated.splice(idx, 1);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("Product name is required");
    if (!price) return setError("Price is required");

    setSaving(true);
    setError(null);

    try {
      // Upload new images
      let uploadedUrls = [];
      for (const img of newImages) {
        const formData = new FormData();
        formData.append("image", img.file);
        const res = await uploadImage(formData);
        uploadedUrls.push(res.url || res.secure_url || res.imageUrl);
      }

      const allImages = [...images, ...uploadedUrls];

      const payload = {
        name: name.trim(),
        category,
        description: description.trim(),
        price: Number(price),
        originalPrice: Number(originalPrice) || 0,
        stock: Number(stock),
        brand: brand.trim(),
        gender,
        images: allImages,
        featured,
        bestSeller,
        justLanded,
        accessories,
        colors,
        sizes,
      };

      await updateProduct(productId, payload);
      router.push("/products");
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const addColor = () => {
    const value = colorInput.trim();
    if (!value || colors.some((color) => color.toLowerCase() === value.toLowerCase())) return;
    setColors((current) => [...current, value]);
    setColorInput("");
  };

  const addSize = () => {
    const value = sizeInput.trim();
    if (!value || sizes.includes(value)) return;
    setSizes((current) => [...current, value]);
    setSizeInput("");
  };

  if (!productId) {
    return (
      <AdminLayout activeSection="Products">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">No product ID provided.</div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout activeSection="Products">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#6b7280]" />
          <span className="ml-3 text-[#6b7280]">Loading product...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeSection="Products">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/products")}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-black/10 hover:bg-[#f5f4f2] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#1b1d24]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1b1d24]">Edit Product</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Update product details</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4">
            <h2 className="font-semibold text-[#1b1d24]">Basic Information</h2>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Product Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none resize-none focus:border-[#d62828] transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828] transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Brand</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828] transition-colors">
                  <option value="">Select Brand</option>
                  {brands.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Collection</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828] transition-colors">
                  <option value="">Select collection</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4">
            <h2 className="font-semibold text-[#1b1d24]">Pricing & Stock</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Price (৳)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Original Price (৳)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4">
            <h2 className="font-semibold text-[#1b1d24]">Images</h2>

            {/* Existing images */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((url, i) => (
                  <div key={`existing-${i}`} className="relative group rounded-lg border border-black/10 overflow-hidden aspect-square bg-[#f5f4f2]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New image uploads */}
            {newImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {newImages.map((img, i) => (
                  <div key={`new-${i}`} className="relative group rounded-lg border border-dashed border-emerald-300 overflow-hidden aspect-square bg-emerald-50">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">New</span>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-black/10 rounded-lg py-6 cursor-pointer hover:border-[#d62828]/40 transition-colors">
              <Upload className="w-5 h-5 text-[#6b7280]" />
              <span className="text-sm text-[#6b7280]">Click to upload images</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Right column — side panel */}
        <div className="space-y-6">
          {/* Placement flags */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-3">
            <h2 className="font-semibold text-[#1b1d24] mb-1">Placement</h2>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[#d62828]" />
              <span className="text-sm text-[#1b1d24]">Featured (homepage)</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} className="accent-[#d62828]" />
              <span className="text-sm text-[#1b1d24]">Best Seller</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={justLanded} onChange={(e) => setJustLanded(e.target.checked)} className="accent-[#d62828]" />
              <span className="text-sm text-[#1b1d24]">Just Landed</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={accessories} onChange={(e) => setAccessories(e.target.checked)} className="accent-[#d62828]" />
              <span className="text-sm text-[#1b1d24]">Accessories</span>
            </label>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-3">
            <h2 className="font-semibold text-[#1b1d24] mb-1">Colors</h2>
            <div className="flex flex-wrap gap-2">
              {colors.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f4f2] text-xs text-[#1b1d24]">
                  <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c }} />
                  {c}
                  <button onClick={() => setColors((prev) => prev.filter((_, idx) => idx !== i))} className="ml-0.5">
                    <X className="w-3 h-3 text-[#6b7280]" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                placeholder="Add color..."
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                className="flex-1 border border-black/10 rounded-lg px-3 py-2 text-sm outline-none"
              />
              <button type="button" onClick={addColor} className="inline-flex items-center gap-1 rounded-lg bg-[#12141c] px-3 py-2 text-sm font-medium text-white"><Plus className="h-3.5 w-3.5" /> Add</button>
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-3">
            <h2 className="font-semibold text-[#1b1d24] mb-1">Sizes</h2>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5f4f2] text-xs text-[#1b1d24]">
                  {s}
                  <button onClick={() => setSizes((prev) => prev.filter((_, idx) => idx !== i))}>
                    <X className="w-3 h-3 text-[#6b7280]" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                placeholder="Add size..."
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                className="flex-1 border border-black/10 rounded-lg px-3 py-2 text-sm outline-none"
              />
              <button type="button" onClick={addSize} className="inline-flex items-center gap-1 rounded-lg bg-[#12141c] px-3 py-2 text-sm font-medium text-white"><Plus className="h-3.5 w-3.5" /> Add</button>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#d62828] text-white font-semibold py-3 rounded-xl hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={
      <AdminLayout activeSection="Products">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#6b7280]" />
        </div>
      </AdminLayout>
    }>
      <EditProductForm />
    </Suspense>
  );
}
