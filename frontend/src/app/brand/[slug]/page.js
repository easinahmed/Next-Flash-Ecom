'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import ProductLink from '@/components/ProductLink';
import { fetchProducts } from '@/services/dummyjson';
import { getBrands } from '@/lib/api';

export default function BrandProductsPage({ params }) {
  const { slug } = use(params);
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrand() {
      const brands = await getBrands();
      const selected = brands.find((item) => item.slug === slug);
      if (!selected) {
        setLoading(false);
        return;
      }
      setBrand(selected);
      const result = await fetchProducts({ brand: selected.name, limit: 100 });
      setProducts(result.products || []);
      setLoading(false);
    }
    loadBrand();
  }, [slug]);

  if (loading) return <main className="p-10 text-center">Loading brand...</main>;
  if (!brand) return <main className="p-10 text-center"><h1 className="text-2xl font-bold">Brand not found</h1></main>;

  const subcategories = [...new Set(products.map((product) => product.subcategory).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const visibleProducts = selectedSubcategory
    ? products.filter((product) => product.subcategory === selectedSubcategory)
    : products;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row dark:bg-gray-800">
        {brand.image && <img src={brand.image} alt={brand.name} className="h-20 w-32 object-contain" />}
        <div><p className="text-sm text-gray-500">Brand collection</p><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{brand.name}</h1></div>
      </div>
      {subcategories.length > 0 && (
        <div className="mb-6 max-w-xs">
          <label htmlFor="brand-subcategory" className="mb-1 block text-sm font-medium">Filter by subcategory</label>
          <select
            id="brand-subcategory"
            value={selectedSubcategory}
            onChange={(event) => setSelectedSubcategory(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800"
          >
            <option value="">All subcategories</option>
            {subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
          </select>
        </div>
      )}
      {visibleProducts.length === 0 ? <p className="py-12 text-center text-gray-500">{selectedSubcategory ? `No products found in ${selectedSubcategory}.` : 'No products have been added to this brand yet.'}</p> : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{visibleProducts.map((product) => <ProductLink key={product.id} item={product} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"><img src={product.image} alt={product.name} className="h-48 w-full object-cover" /><div className="p-4"><h2 className="truncate font-semibold">{product.name}</h2><p className="mt-1 font-bold text-red-500">৳{product.price}</p></div></ProductLink>)}</div>}
      <Link href="/brands" className="mt-8 inline-block text-sm font-semibold text-indigo-600 hover:underline">Back to all brands</Link>
    </main>
  );
}
