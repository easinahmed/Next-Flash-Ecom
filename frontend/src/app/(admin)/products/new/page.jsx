// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2, Upload, ChevronLeft } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useProducts } from "@/components/ProductsContex";
import { createProduct, uploadImage, getCategories, getBrands } from "@/lib/api";
import toast from "react-hot-toast";

// A handful of common preset colors — the swatch input still lets you pick any hex.
const presetColors = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "Brown", hex: "#5b3a26" },
  { name: "Navy", hex: "#1e2a4a" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Red", hex: "#b91c1c" },
];

export default function ProductFormPage() {
  const router = useRouter();
  const { addProduct } = useProducts();
  
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [images, setImages] = useState([]); // { file: File, preview: string }

  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([categoryData, brandData]) => {
      setCategories(categoryData);
      setBrands(brandData);
      if (categoryData.length > 0) setCategory(categoryData[0].name);
    }).catch(console.error);
  }, []);

  const [hasVariants, setHasVariants] = useState(true);
  const [simpleStock, setSimpleStock] = useState(0);

  const [colors, setColors] = useState([{ name: "Black", hex: "#1a1a1a" }]);
  const [sizes, setSizes] = useState(["40", "41", "42"]);
  const [colorInput, setColorInput] = useState("");
  const [colorHexInput, setColorHexInput] = useState("#1a1a1a");
  const [sizeInput, setSizeInput] = useState("");

  // stock per color+size combo, keyed as "Color__Size"
  const [variantStock, setVariantStock] = useState({});

  const combos = useMemo(() => {
    const list = [];
    colors.forEach((c) => {
      sizes.forEach((s) => {
        list.push({ color: c.name, hex: c.hex, size: s, key: `${c.name}__${s}` });
      });
    });
    return list;
  }, [colors, sizes]);

  const addColor = () => {
    if (!colorInput.trim()) return;
    if (colors.some((c) => c.name.toLowerCase() === colorInput.trim().toLowerCase())) return;
    setColors((prev) => [...prev, { name: colorInput.trim(), hex: colorHexInput }]);
    setColorInput("");
  };

  const addPresetColor = (preset) => {
    if (colors.some((c) => c.name === preset.name)) return;
    setColors((prev) => [...prev, preset]);
  };

  const removeColor = (name) => setColors((prev) => prev.filter((c) => c.name !== name));

  const addSize = () => {
    if (!sizeInput.trim()) return;
    if (sizes.includes(sizeInput.trim())) return;
    setSizes((prev) => [...prev, sizeInput.trim()]);
    setSizeInput("");
  };

  const removeSize = (size) => setSizes((prev) => prev.filter((s) => s !== size));

  const updateVariantStock = (key, value) =>
    setVariantStock((prev) => ({ ...prev, [key]: Math.max(0, Number(value) || 0) }));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (idx) => {
    const img = images[idx];
    if (img?.preview) URL.revokeObjectURL(img.preview);
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalVariantStock = combos.reduce((sum, c) => sum + (variantStock[c.key] || 0), 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        title: name,
        category,
        brand,
        gender,
        description,
        price: Number(price),
        originalPrice: Number(originalPrice) || 0,
      };

      if (!hasVariants) payload.stock = Number(simpleStock) || 0;
      else {
        payload.colors = colors.map((c) => c.name);
        payload.sizes = sizes;
        payload.stock = totalVariantStock;
      }

      // Upload all selected images
      if (images.length > 0) {
        const uploadPromises = images.map((imgObj) => {
          if (imgObj.file) return uploadImage(imgObj.file);
          return Promise.resolve(null);
        });
        const uploadResults = await Promise.all(uploadPromises);
        const uploadedUrls = uploadResults
          .filter(Boolean)
          .map((res) => res.imageUrl || res.url || res.secure_url);

        if (uploadedUrls.length > 0) {
          payload.image = uploadedUrls[0];
          payload.thumbnail = uploadedUrls[0];
          payload.images = uploadedUrls;
        }
      }

      await addProduct(payload);
      router.push("/inventory");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout activeSection="Inventory" searchPlaceholder="Search…">
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Header */}
        <div className="flex items-center gap-3">
          <a href="/inventory" className="text-[#6b7280] hover:text-[#1b1d24]" aria-label="Back to inventory">
            <ChevronLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-[#1b1d24]">Add Product</h1>
            <p className="text-sm text-[#6b7280] mt-1">
              Fill in the details, then set colors, sizes, and stock per variant.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column: basic info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic info card */}
            <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-4">
              <h2 className="font-semibold text-[#1b1d24]">Basic Information</h2>

              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Product Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shaker Loafer"
                  required
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Brand</label>
                  <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none">
                    <option value="">Select Brand</option>
                    {brands.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Collection</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none">
                    <option value="">Select collection</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Selling Price (TK.$)</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Original Price (TK.$)</label>
                  <input
                    type="number"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the material, fit, and care instructions…"
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828] resize-none"
                />
              </div>
            </div>

            {/* Variants card */}
            <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#1b1d24]">Colors, Sizes &amp; Stock</h2>
                <label className="flex items-center gap-2 text-sm text-[#1b1d24] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="w-4 h-4 accent-[#d62828]"
                  />
                  This product has variants
                </label>
              </div>

              {!hasVariants ? (
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={simpleStock}
                    onChange={(e) => setSimpleStock(e.target.value)}
                    className="w-full max-w-xs border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828]"
                  />
                </div>
              ) : (
                <>
                  {/* Colors */}
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] mb-2">Colors</label>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {colors.map((c) => (
                        <span
                          key={c.name}
                          className="flex items-center gap-1.5 bg-[#f5f4f2] rounded-full pl-1.5 pr-2 py-1 text-sm text-[#1b1d24]"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.name}
                          <button type="button" onClick={() => removeColor(c.name)} aria-label={`Remove ${c.name}`}>
                            <X className="w-3.5 h-3.5 text-[#6b7280] hover:text-[#1b1d24]" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {presetColors
                        .filter((p) => !colors.some((c) => c.name === p.name))
                        .map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => addPresetColor(p)}
                            className="flex items-center gap-1.5 border border-black/10 rounded-full pl-1.5 pr-2.5 py-1 text-xs text-[#6b7280] hover:border-[#d62828] hover:text-[#1b1d24]"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: p.hex }}
                            />
                            {p.name}
                          </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorHexInput}
                        onChange={(e) => setColorHexInput(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-black/10 shrink-0 cursor-pointer"
                        aria-label="Custom color swatch"
                      />
                      <input
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                        placeholder="Custom color name"
                        className="flex-1 border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24] outline-none"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="flex items-center gap-1 bg-[#12141c] text-white text-sm font-medium px-3 py-2 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] mb-2">Sizes</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {sizes.map((s) => (
                        <span
                          key={s}
                          className="flex items-center gap-1.5 bg-[#f5f4f2] rounded-full pl-3 pr-2 py-1 text-sm text-[#1b1d24]"
                        >
                          {s}
                          <button type="button" onClick={() => removeSize(s)} aria-label={`Remove size ${s}`}>
                            <X className="w-3.5 h-3.5 text-[#6b7280] hover:text-[#1b1d24]" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={sizeInput}
                        onChange={(e) => setSizeInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                        placeholder="e.g. 42 or M / L / XL"
                        className="flex-1 max-w-xs border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24] outline-none"
                      />
                      <button
                        type="button"
                        onClick={addSize}
                        className="flex items-center gap-1 bg-[#12141c] text-white text-sm font-medium px-3 py-2 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Variant stock matrix */}
                  {combos.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-[#6b7280]">
                          Stock per Color &amp; Size
                        </label>
                        <span className="text-xs text-[#6b7280]">
                          Total: <span className="font-semibold text-[#1b1d24] tabular-nums">{totalVariantStock} pcs</span>
                        </span>
                      </div>
                      <div className="overflow-x-auto border border-black/10 rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-[#6b7280] bg-[#f5f4f2]">
                              <th className="px-3 py-2 font-medium">Color</th>
                              <th className="px-3 py-2 font-medium">Size</th>
                              <th className="px-3 py-2 font-medium">SKU (auto)</th>
                              <th className="px-3 py-2 font-medium">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {combos.map((c) => (
                              <tr key={c.key} className="border-t border-black/[0.06]">
                                <td className="px-3 py-2">
                                  <span className="flex items-center gap-1.5 text-[#1b1d24]">
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                                      style={{ backgroundColor: c.hex }}
                                    />
                                    {c.color}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-[#1b1d24]">{c.size}</td>
                                <td className="px-3 py-2 text-[#6b7280]">
                                  {(name.slice(0, 3).toUpperCase() || "SKU")}-{c.color.slice(0, 3).toUpperCase()}-{c.size}
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={variantStock[c.key] || ""}
                                    onChange={(e) => updateVariantStock(c.key, e.target.value)}
                                    placeholder="0"
                                    className="w-20 border border-black/10 rounded-lg px-2 py-1.5 text-sm text-[#1b1d24] outline-none focus:border-[#d62828]"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right column: images + save */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-black/[0.06] p-5">
              <h2 className="font-semibold text-[#1b1d24] mb-4">Product Images</h2>

              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-black/15 rounded-xl py-8 cursor-pointer hover:border-[#d62828] transition-colors">
                <Upload className="w-6 h-6 text-[#6b7280]" />
                <span className="text-sm text-[#6b7280]">Click to upload images</span>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {images.map((imgObj, i) => {
                    const previewUrl = typeof imgObj === "object" ? imgObj.preview || imgObj.url : imgObj;
                    return (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#f5f4f2] border border-black/10">
                        <img src={previewUrl} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 hover:bg-black rounded-full transition-colors"
                          aria-label="Remove image"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-3">
              <h2 className="font-semibold text-[#1b1d24] mb-1">Summary</h2>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">Total stock</span>
                <span className="font-semibold text-[#1b1d24] tabular-nums">
                  {hasVariants ? totalVariantStock : simpleStock || 0} pcs
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">Variants</span>
                <span className="font-semibold text-[#1b1d24]">{hasVariants ? combos.length : "—"}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#d62828] text-white font-semibold py-2.5 rounded-lg hover:bg-[#b91c1c] disabled:opacity-50 transition-colors mt-2"
              >
                {isSubmitting ? "Saving Product..." : "Save Product"}
              </button>
              <button
                type="button"
                className="w-full border border-black/10 text-[#1b1d24] font-medium py-2.5 rounded-lg hover:bg-[#f5f4f2] transition-colors"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}