"use client";

import { useEffect, useRef, useState } from "react";
import { Gift, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { createProduct, fetchApi, updateProduct, uploadImage } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeletons";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  descriptionEnglish: "",
  descriptionBengali: "",
  fullDescriptionEnglish: "",
  fullDescriptionBengali: "",
  price: "",
  originalPrice: "",
  stock: "",
};

export default function AdminComboDealsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingIds, setUpdatingIds] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const refreshComboDeals = async () => {
    try {
      const data = await fetchApi("/products?comboDeal=true&category=Exclusive%20Combo%20Deals");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load combo deals:", error);
      toast.error(error.message || "Failed to load combo deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchApi("/products?comboDeal=true&category=Exclusive%20Combo%20Deals")
      .then((data) => {
        if (isMounted) setProducts(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to load combo deals:", error);
        if (isMounted) toast.error(error.message || "Failed to load combo deals");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setEditingProduct(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const startEditing = (product) => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setEditingProduct(product);
    setForm({
      name: product.name || product.title || "",
      descriptionEnglish: product.descriptionEnglish || product.description || "",
      descriptionBengali: product.descriptionBengali || "",
      fullDescriptionEnglish: product.fullDescriptionEnglish || product.descriptionEnglish || product.description || "",
      fullDescriptionBengali: product.fullDescriptionBengali || "",
      price: String(product.price ?? ""),
      originalPrice: String(product.originalPrice ?? ""),
      stock: String(product.stock ?? ""),
    });
    setImageFile(null);
    setImagePreview(product.images?.[0] || product.thumbnail || "");
    if (imageInputRef.current) imageInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        imageUrl = uploaded.imageUrl || uploaded.url || uploaded.secure_url || "";
        if (!imageUrl) throw new Error("Image upload did not return an image URL");
      }

      const price = Number(form.price);
      const originalPrice = Number(form.originalPrice) || 0;
      const payload = {
        name: form.name.trim(),
        title: form.name.trim(),
        description: form.descriptionEnglish.trim(),
        descriptionEnglish: form.descriptionEnglish.trim(),
        descriptionBengali: form.descriptionBengali.trim(),
        fullDescriptionEnglish: form.fullDescriptionEnglish.trim(),
        fullDescriptionBengali: form.fullDescriptionBengali.trim(),
        category: "Exclusive Combo Deals",
        brand: "Flash Shoe",
        price,
        originalPrice,
        stock: Number(form.stock) || 0,
        images: imageUrl
          ? [imageUrl]
          : editingProduct?.images?.length
            ? editingProduct.images
            : [imagePreview || "/shoe1.avif"],
        comboDeal: true,
      };
      if (editingProduct) {
        await updateProduct(editingProduct._id || editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      const wasEditing = Boolean(editingProduct);
      resetForm();
      toast.success(wasEditing ? "Combo product updated" : "Combo product created");
      await refreshComboDeals();
    } catch (error) {
      toast.error(error.message || "Failed to create combo product");
    } finally {
      setSaving(false);
    }
  };

  const removeFromDeals = async (product) => {
    const id = product._id || product.id;
    if (!id || updatingIds.includes(id)) return;
    setUpdatingIds((current) => [...current, id]);
    try {
      await updateProduct(id, { comboDeal: false });
      setProducts((current) => current.filter((item) => (item._id || item.id) !== id));
      toast.success("Removed from Combo Deals");
    } catch (error) {
      toast.error(error.message || "Failed to remove combo product");
    } finally {
      setUpdatingIds((current) => current.filter((itemId) => itemId !== id));
    }
  };

  return (
    <AdminLayout activeSection="Combo Deals" searchPlaceholder="Manage combo products...">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Gift className="h-6 w-6 text-indigo-600" />
          {editingProduct ? "Edit Exclusive Combo Product" : "Create Exclusive Combo Product"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a standalone combo product. It will appear on the storefront and can be added to the cart like other products.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#161623]">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Combo product name
            <input
              required
              maxLength={120}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Premium Shoe & Belt Combo"
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>

          <div>
            <label htmlFor="combo-image" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Combo image</label>
            <div className="mt-1.5 flex items-center gap-3">
              {imagePreview ? (
                <img src={imagePreview} alt="Combo preview" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-900">
                  <ImagePlus className="h-5 w-5" />
                </span>
              )}
              <input
                id="combo-image"
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="min-w-0 text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700"
              />
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Combo price (৳)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Original price (৳)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.originalPrice}
              onChange={(event) => setForm((current) => ({ ...current, originalPrice: event.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Stock quantity
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>

          <div className="space-y-4 md:col-span-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Product descriptions</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["descriptionEnglish", "Short Description (English)", 3],
                ["descriptionBengali", "Short Description (বাংলা)", 3],
                ["fullDescriptionEnglish", "Full Description (English)", 6],
                ["fullDescriptionBengali", "Full Description (বাংলা)", 6],
              ].map(([field, label, rows]) => (
                <label key={field} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  {label}
                  <textarea
                    rows={rows}
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <div className="flex gap-3">
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="ml-3 inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Saving..." : editingProduct ? "Save Combo Product" : "Create Combo Product"}
            </button>
          </div>
        </div>
      </form>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Created Combo Products</h2>
            <p className="mt-1 text-sm text-gray-500">{products.length} product{products.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#161623]">
          {loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : products.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">No combo products created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-white/5">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Combo product</th>
                    <th className="px-5 py-4 font-semibold">Combo price</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {products.map((product) => {
                    const id = product._id || product.id;
                    const name = product.name || product.title || "Untitled combo";
                    const image = product.images?.[0] || product.thumbnail || "/shoe1.avif";
                    const isUpdating = updatingIds.includes(id);
                    return (
                      <tr key={id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                        <td className="px-5 py-4">
                          <div className="flex min-w-52 items-center gap-3">
                            <img src={image} alt={name} className="h-12 w-12 rounded-lg border border-gray-100 object-cover dark:border-gray-800" />
                            <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">৳{Number(product.price || 0).toLocaleString("en-BD")}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{product.stock ?? 0}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(product)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromDeals(product)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isUpdating ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
