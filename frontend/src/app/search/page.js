'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Addtocardbutton from '@/components/addtocardbutton';
import Wishlistheart from '@/components/Wishlistheart';
import ProductLink from '@/components/ProductLink';
import { searchProducts } from '@/services/dummyjson';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function executeSearch() {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchProducts(query, { limit: 30 });
        if (isMounted) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    executeSearch();
    return () => { isMounted = false; };
  }, [query]);

  return (
    <main className="container mx-auto min-h-[60vh] px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">Search results</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          {query ? `Results for “${query}”` : 'Search products'}
        </h1>
        {query && !loading && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm dark:border-gray-700 flex flex-col justify-between bg-white dark:bg-gray-800">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                <ProductLink item={product}>
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />
                </ProductLink>
                {product.discountPercentage > 0 && (
                  <span className="absolute top-3 left-3 text-white text-[10px] font-poppins px-3 py-1 font-bold border-1 bg-red-700 rounded-3xl">
                    -{product.discountPercentage}%
                  </span>
                )}
                <Wishlistheart item={product} />
              </div>
              <div className="p-3 sm:p-4">
                <ProductLink item={product}>
                  <h2 className="truncate text-base font-bold sm:text-lg hover:underline">{product.name}</h2>
                </ProductLink>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-red-500 font-semibold">TK. {product.price}</p>
                  {product.oldPrice > product.price && (
                    <p className="text-xs text-gray-500 line-through">TK. {product.oldPrice}</p>
                  )}
                </div>
                <div className="mt-3">
                  <Addtocardbutton item={product} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-gray-700">
          <h2 className="text-xl font-semibold">No products found</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try searching for shoes, bags, watch, shirt, or phone.</p>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="container mx-auto min-h-[60vh] px-4 py-8">Loading products...</main>}>
      <SearchResults />
    </Suspense>
  );
}
