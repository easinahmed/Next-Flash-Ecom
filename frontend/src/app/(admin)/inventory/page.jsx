// @ts-nocheck
"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import {
  Boxes,
  PackageCheck,
  PackageX,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Pencil,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { getProducts, updateProduct, getProduct, getCategories } from "@/lib/api";
import { withUids } from "@/lib/uid";

/* ------------------------------------------------------------------ */
/* Placeholder data — replace with real API/DB-backed inventory data. */
/* Each product may have simple stock (no variants) or a `variants`   */
/* array of { color, size, sku, stock }.                              */
/* ------------------------------------------------------------------ */

const LOW_STOCK_THRESHOLD = 15;

// products are loaded from the backend

function totalStock(product) {
  return product.hasVariants
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;
}

function stockStatus(qty) {
  if (qty === 0) return "Out of Stock";
  if (qty <= LOW_STOCK_THRESHOLD) return "Low Stock";
  return "In Stock";
}

const statusStyles = {
  "In Stock": "bg-emerald-50 text-emerald-700",
  "Low Stock": "bg-amber-50 text-amber-700",
  "Out of Stock": "bg-red-50 text-red-700",
};

const PAGE_SIZE = 6;

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null); // { productId, variantIndex|null }
  const [placementTarget, setPlacementTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [categories, setCategories] = useState([]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const qty = totalStock(p);
      const status = stockStatus(qty);
      const matchesSearch = (p.name || '').toLowerCase().includes((search || '').toLowerCase());
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const overallStats = useMemo(() => {
    const qtys = products.map(totalStock);
    return {
      totalUnits: qtys.reduce((a, b) => a + b, 0),
      inStock: qtys.filter((q) => stockStatus(q) === "In Stock").length,
      lowStock: qtys.filter((q) => stockStatus(q) === "Low Stock").length,
      outOfStock: qtys.filter((q) => stockStatus(q) === "Out of Stock").length,
    };
  }, [products]);

  const applyStockChange = async (productId, variantIndex, delta) => {
    // Find the product and compute new stock
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, (product.stock || 0) + delta);

    // Optimistically update local state
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (p.hasVariants && variantIndex !== null) {
          const variants = p.variants.map((v, i) =>
            i === variantIndex ? { ...v, stock: Math.max(0, v.stock + delta) } : v
          );
          return { ...p, variants };
        }
        return { ...p, stock: newStock };
      })
    );

    // Persist to backend
    try {
      await updateProduct(productId, { stock: newStock });
    } catch (err) {
      console.error('Failed to update stock:', err);
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return { ...p, stock: Math.max(0, newStock - delta) };
        })
      );
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProducts()
      .then((res) => {
        if (!mounted) return;
        setProducts(withUids(res.map((r) => ({
          id: r._id || r.id,
          name: r.title || r.name,
          category: r.category,
          image: r.thumbnail || (r.images && r.images[0]) || '/shoe1.avif',
          price: r.price,
          hasVariants: false,
          stock: r.stock ?? 0,
          featured: r.featured || false,
          bestSeller: r.bestSeller || false,
          justLanded: r.justLanded || false,
          accessories: r.accessories || false,
          raw: r,
        }))));
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    getCategories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => setCategories([]));
  }, []);

  return (
    <AdminLayout activeSection="Inventory" searchPlaceholder="Search products in inventory…">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1d24]">Inventory</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Track stock levels and manage variants for every product.
          </p>
        </div>
        <a
          href="/products/new"
          className="flex items-center gap-2 bg-[#d62828] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#b91c1c] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </a>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Units" value={overallStats.totalUnits} accent="#2563eb" icon={Boxes} />
        <StatCard label="In Stock" value={overallStats.inStock} accent="#16a34a" icon={PackageCheck} />
        <StatCard label="Low Stock" value={overallStats.lowStock} accent="#b45309" icon={AlertTriangle} />
        <StatCard label="Out of Stock" value={overallStats.outOfStock} accent="#d62828" icon={PackageX} />
      </div>

      {/* Inventory table card */}
      <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2 bg-[#f5f4f2] rounded-lg px-3 py-2 w-full max-w-sm">
            <Search className="w-4 h-4 text-[#6b7280] shrink-0" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products"
              className="bg-transparent text-sm text-[#1b1d24] placeholder-[#9ca3af] outline-none flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6b7280]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-black/10 text-sm text-[#1b1d24] rounded-lg px-3 py-2 outline-none"
            >
              <option>All</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#6b7280] border-b border-black/[0.06]">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="px-5 py-3 font-medium">Variants</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p, index) => {
                const qty = totalStock(p);
                const status = stockStatus(qty);
                const isExpanded = expandedId === p.id;
                return (
                  <Fragment key={p._uid}>
                    <tr className="border-b border-black/[0.04] last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#f5f4f2] overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#1b1d24] truncate">{p.name}</p>
                            <p className="text-xs text-[#6b7280]">TK.${p.price}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#1b1d24] hidden md:table-cell">{p.category}</td>
                      <td className="px-5 py-3">
                        {p.hasVariants ? (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                            className="flex items-center gap-1 text-[#1b1d24] hover:text-[#d62828]"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                            {p.variants.length} variants
                          </button>
                        ) : (
                          <span className="text-[#6b7280]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#1b1d24] tabular-nums">{qty} pcs</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setAdjustTarget({ productId: p.id, variantIndex: p.hasVariants ? 0 : null })}
                            className="text-xs font-medium text-[#2563eb] hover:underline"
                          >
                            Adjust Stock
                          </button>
                          <button onClick={() => setPlacementTarget(p)} className="text-xs font-medium text-[#16a34a] hover:underline">Placements</button>
                          <button onClick={() => setEditTarget(p.id)} className="text-[#6b7280] hover:text-[#1b1d24]" aria-label="Edit product">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && p.hasVariants && (
                      <tr>
                        <td colSpan={6} className="bg-[#f5f4f2] px-5 py-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-[#6b7280]">
                                <th className="py-1.5 font-medium">Color</th>
                                <th className="py-1.5 font-medium">Size</th>
                                <th className="py-1.5 font-medium">SKU</th>
                                <th className="py-1.5 font-medium">Stock</th>
                                <th className="py-1.5 font-medium">Status</th>
                                <th className="py-1.5 font-medium text-right">Adjust</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.variants.map((v, i) => (
                                <tr key={v.sku} className="border-t border-black/[0.06]">
                                  <td className="py-2 text-[#1b1d24]">{v.color}</td>
                                  <td className="py-2 text-[#1b1d24]">{v.size}</td>
                                  <td className="py-2 text-[#6b7280]">{v.sku}</td>
                                  <td className="py-2 text-[#1b1d24] tabular-nums">{v.stock} pcs</td>
                                  <td className="py-2">
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${statusStyles[stockStatus(v.stock)]}`}>
                                      {stockStatus(v.stock)}
                                    </span>
                                  </td>
                                  <td className="py-2 text-right">
                                    <button
                                      onClick={() => setAdjustTarget({ productId: p.id, variantIndex: i })}
                                      className="text-[#2563eb] font-medium hover:underline"
                                    >
                                      Adjust
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#6b7280]">
                    No products match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-black/[0.06]">
          <p className="text-sm text-[#6b7280]">
            Showing {pageItems.length} of {filtered.length} products
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-black/10 rounded-lg text-[#1b1d24] disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#1b1d24] tabular-nums">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-black/10 rounded-lg text-[#1b1d24] disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Adjust stock modal */}
      {adjustTarget && (
        <AdjustStockModal
          product={products.find((p) => p.id === adjustTarget.productId)}
          variantIndex={adjustTarget.variantIndex}
          onClose={() => setAdjustTarget(null)}
          onApply={(delta) => {
            applyStockChange(adjustTarget.productId, adjustTarget.variantIndex, delta);
            setAdjustTarget(null);
          }}
        />
      )}

      {placementTarget && (
        <PlacementModal
          product={placementTarget}
          categories={categories}
          onClose={() => setPlacementTarget(null)}
          onSave={async (changes) => {
            try {
              const res = await updateProduct(placementTarget.id, changes);
              // update local product flags
              setProducts((prev) => prev.map((pp) => pp.id === placementTarget.id ? { ...pp, ...changes, raw: res } : pp));
              setPlacementTarget(null);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

          {editTarget && (
            <EditProductModal
              productId={editTarget}
              onClose={() => setEditTarget(null)}
              onSaved={(updated) => {
                setProducts((prev) => prev.map((p) => (p.id === updated._id || p.id === updated.id ? { ...p, name: updated.name || updated.title, category: updated.category, price: updated.price, featured: updated.featured, bestSeller: updated.bestSeller, justLanded: updated.justLanded, accessories: updated.accessories, raw: updated } : p)));
                setEditTarget(null);
              }}
            />
          )}
    </AdminLayout>
  );
}

function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <div
      className="bg-white rounded-xl border border-black/[0.06] p-5"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#6b7280]">{label}</span>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <p className="text-2xl font-bold text-[#1b1d24] tabular-nums">{value}</p>
    </div>
  );
}

function AdjustStockModal({ product, variantIndex, onClose, onApply }) {
  const [mode, setMode] = useState("add"); // "add" | "remove"
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("Restock");

  if (!product) return null;

  const variant = product.hasVariants && variantIndex !== null ? product.variants[variantIndex] : null;
  const currentStock = variant ? variant.stock : product.stock;

  const handleApply = () => {
    const delta = mode === "add" ? Number(amount) : -Number(amount);
    onApply(delta);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-sm p-6 text-[#1b1d24]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1b1d24]">Adjust Stock</h3>
          <button onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        <p className="text-sm text-[#6b7280] mb-1">{product.name}</p>
        {variant && (
          <p className="text-xs text-[#6b7280] mb-3">
            {variant.color} · Size {variant.size} · {variant.sku}
          </p>
        )}
        <p className="text-sm text-[#1b1d24] mb-4">
          Current stock: <span className="font-semibold tabular-nums">{currentStock} pcs</span>
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("add")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
              mode === "add" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-black/10 text-[#6b7280]"
            }`}
          >
            Add Stock
          </button>
          <button
            onClick={() => setMode("remove")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
              mode === "remove" ? "bg-red-50 border-red-300 text-red-700" : "border-black/10 text-[#6b7280]"
            }`}
          >
            Remove Stock
          </button>
        </div>

        <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Quantity</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24] outline-none mb-4"
        />

        <label className="block text-xs font-medium text-[#6b7280] mb-1.5">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24] outline-none mb-6"
        >
          <option>Restock</option>
          <option>Damaged / Lost</option>
          <option>Return</option>
          <option>Correction</option>
        </select>

        <button
          onClick={handleApply}
          className="w-full bg-[#d62828] text-white font-semibold py-2.5 rounded-lg hover:bg-[#b91c1c] transition-colors"
        >
          Apply Change
        </button>
      </div>
    </div>
  );
}

function PlacementModal({ product, categories, onClose, onSave }) {
  const [featured, setFeatured] = useState(product?.featured || false);
  const [bestSeller, setBestSeller] = useState(product?.bestSeller || false);
  const [justLanded, setJustLanded] = useState(product?.justLanded || false);
  const [accessories, setAccessories] = useState(product?.accessories || false);
  const [category, setCategory] = useState(product?.category || "");

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1b1d24]">Manage Placements</h3>
          <button onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        <p className="text-sm text-[#6b7280] mb-3">{product.name}</p>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <span className="text-sm text-[#1b1d24]">Featured (homepage)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} />
            <span className="text-sm text-[#1b1d24]">Best Seller</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={justLanded} onChange={(e) => setJustLanded(e.target.checked)} />
            <span className="text-sm text-[#1b1d24]">Just Landed</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={accessories} onChange={(e) => setAccessories(e.target.checked)} />
            <span className="text-sm text-[#1b1d24]">Accessories</span>
          </label>

          <label className="block text-xs font-medium text-[#6b7280]">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24]">
            <option value="">Select category</option>
            {categories.map((item) => <option key={item._id || item.slug || item.name} value={item.name}>{item.name}</option>)}
          </select>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave({ featured, bestSeller, justLanded, accessories, category })}
            className="flex-1 bg-[#d62828] text-white font-semibold py-2.5 rounded-lg"
          >
            Save
          </button>
          <button onClick={onClose} className="flex-1 border rounded-lg py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EditProductModal({ productId, onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [justLanded, setJustLanded] = useState(false);
  const [accessories, setAccessories] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProduct(productId)
      .then((res) => {
        if (!mounted) return;
        setProduct(res);
        setName(res.name || res.title || "");
        setCategory(res.category || "");
        setPrice(res.price || 0);
        setOriginalPrice(res.originalPrice || 0);
        setFeatured(Boolean(res.featured));
        setBestSeller(Boolean(res.bestSeller));
        setJustLanded(Boolean(res.justLanded));
        setAccessories(Boolean(res.accessories));
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleSave = async () => {
    try {
      const payload = { name, category, price, originalPrice, featured, bestSeller, justLanded, accessories };
      const updated = await updateProduct(productId, payload);
      onSaved(updated);
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg p-6 text-[#1b1d24]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1b1d24]">Edit Product</h3>
          <button onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-4">
            {error && <div className="text-red-600">{error}</div>}
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-[#1b1d24]" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-[#1b1d24]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#6b7280] mb-1">Price</label>
                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-[#1b1d24]" />
              </div>
              <div>
                <label className="block text-xs text-[#6b7280] mb-1">Original Price</label>
                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} className="w-full border border-black/10 rounded-lg px-3 py-2 text-[#1b1d24]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> <span className="text-sm text-[#1b1d24]">Featured</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} /> <span className="text-sm text-[#1b1d24]">Best Seller</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={justLanded} onChange={(e) => setJustLanded(e.target.checked)} /> <span className="text-sm text-[#1b1d24]">Just Landed</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={accessories} onChange={(e) => setAccessories(e.target.checked)} /> <span className="text-sm text-[#1b1d24]">Accessories</span></label>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} className="flex-1 bg-[#d62828] text-white py-2.5 rounded-lg">Save</button>
              <button onClick={onClose} className="flex-1 border rounded-lg py-2.5">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}