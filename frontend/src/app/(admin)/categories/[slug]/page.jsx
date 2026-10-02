"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Package, Pencil } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { getCategories, getProducts } from "@/lib/api";
import { TableSkeleton } from "@/components/Skeletons";

const slugify = (value = "") => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function AdminCategoryProductsPage({ params }) {
  const { slug } = use(params);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryProducts() {
      setLoading(true);
      setError("");
      try {
        const [categories, productData] = await Promise.all([
          getCategories(),
          getProducts({ category: decodeURIComponent(slug) }),
        ]);
        const matchedCategory = categories.find((item) =>
          item.slug === decodeURIComponent(slug) || slugify(item.name) === decodeURIComponent(slug)
        );
        if (!isMounted) return;
        setCategory(matchedCategory || null);
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (loadError) {
        if (isMounted) setError(loadError.message || "Failed to load category products");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCategoryProducts();
    return () => { isMounted = false; };
  }, [slug]);

  return (
    <AdminLayout activeSection="Categories" searchPlaceholder="Search products...">
      <div className="mb-6">
        <Link href="/categories" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Categories
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {category ? `${category.name} Products` : "Category Products"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Products assigned to this category.
            </p>
          </div>
          {category && <span className="text-sm text-gray-500">{products.length} product{products.length === 1 ? "" : "s"}</span>}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>
      ) : !category ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-[#161623]">
          <p className="font-semibold text-gray-700 dark:text-gray-200">Category not found</p>
          <Link href="/categories" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
            Return to Categories
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-[#161623]">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-semibold text-gray-700 dark:text-gray-200">No products in {category.name}</p>
          <p className="mt-1 text-sm text-gray-500">Products assigned to this category will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white dark:border-gray-800 dark:bg-[#161623]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/70 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-white/5">
                <tr>
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Subcategory</th>
                  <th className="px-5 py-4 font-semibold">Brand</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Stock</th>
                  <th className="px-5 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((product) => {
                  const id = product._id || product.id;
                  const name = product.name || product.title || "Untitled";
                  const image = product.images?.[0] || product.thumbnail || "/shoe1.avif";
                  return (
                    <tr key={id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                      <td className="px-5 py-4">
                        <div className="flex min-w-48 items-center gap-3">
                          <img src={image} alt={name} className="h-12 w-12 rounded-lg border border-gray-100 object-cover dark:border-gray-800" />
                          <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{product.subcategory || "—"}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{product.brand || "—"}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">৳{Number(product.price || 0).toLocaleString("en-BD")}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{product.stock ?? 0}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/products/edit?id=${encodeURIComponent(id)}`}
                          aria-label={`Edit ${name}`}
                          className="inline-flex rounded-lg p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
