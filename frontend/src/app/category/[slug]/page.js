'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Addtocardbutton from '@/components/addtocardbutton';
import Wishlistheart from '@/components/Wishlistheart';
import ProductLink from '@/components/ProductLink';
import { getProducts, getCategories } from '@/lib/api';

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [products, setProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryData() {
      if (!slug) return;
      setLoading(true);
      try {
        const categoryQuery = decodeURIComponent(slug);

        const [data, categoriesList] = await Promise.all([
          getProducts({ category: categoryQuery }),
          getCategories(),
        ]);

        const allProducts = Array.isArray(data) ? data : (data.products || []);
        const rawNoTime = categoryQuery.replace(/-\d+$/, '');
        const matchedCategory = (categoriesList || []).find((c) =>
          c.slug === slug ||
          c.slug === rawNoTime ||
          c.name.toLowerCase() === categoryQuery.toLowerCase() ||
          c.name.toLowerCase() === rawNoTime.replace(/-/g, ' ').toLowerCase()
        );

        if (isMounted) {
          if (matchedCategory) setCategoryInfo(matchedCategory);
          const mapped = allProducts.map((p) => ({
            id: p._id || p.id,
            name: p.name || p.title || 'Untitled',
            image: (p.images && p.images[0]) || p.thumbnail || '/shoe1.avif',
            price: p.price || 0,
            oldPrice: p.originalPrice || 0,
            discountPercentage: p.originalPrice && p.originalPrice > p.price
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : 0,
            slug: p.slug || p._id || p.id,
            category: p.category,
            brand: p.brand,
            stock: p.stock,
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load category data:', err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCategoryData();
    return () => { isMounted = false; };
  }, [slug]);

  const readableTitle = categoryInfo?.name || (slug
    ? decodeURIComponent(slug).replace(/-\d+$/, '').replace(/-/g, ' ').toUpperCase()
    : 'CATEGORY');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-start gap-2 mb-4">
        <Link href="/">
          <p className="text-sm cursor-pointer hover:underline">Home</p>
        </Link>
        <p className="text-sm">/</p>
        <p className="text-sm cursor-pointer text-green-700 capitalize font-medium">{readableTitle}</p>
      </div>

      <div className="pt-4">
        <div className="flex items-center gap-4 mb-6">
          {categoryInfo?.image ? (
            <img
              src={categoryInfo.image}
              alt={readableTitle}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-gray-200 shadow-sm shrink-0"
            />
          ) : (
            <div className="h-[24px] w-[12px] bg-red-700 rounded-3xl shrink-0" />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{readableTitle}</h1>
            {categoryInfo?.description && (
              <p className="text-sm text-gray-500 mt-1">{categoryInfo.description}</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center my-8">
            <h2 className="text-xl font-semibold">No products found in this category</h2>
            <p className="text-gray-500 mt-2">Please check back later or explore other categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 overflow-hidden">
            {products.map((item) => (
              <div className="cursor-pointer border-1 rounded-3xl border-gray-400/20 min-h-fit shadow-2xs overflow-hidden flex flex-col justify-between bg-white dark:bg-gray-800" key={item.id}>
                <div className="relative items-center justify-center rounded-3xl overflow-hidden">
                  <ProductLink item={item}>
                    <img className="w-full h-48 sm:h-56 object-cover rounded-t-3xl" src={item.image} alt={item.name} />
                  </ProductLink>
                  {item.discountPercentage > 0 && (
                    <span className="absolute top-3 left-3 text-white text-[10px] font-poppins px-3 py-1 font-bold border-1 bg-red-700 rounded-3xl">
                      -{item.discountPercentage}%
                    </span>
                  )}
                  <Wishlistheart item={item} />
                  <Addtocardbutton item={item} />
                  <ProductLink item={item}>
                    <div className="text-start pl-5 border-t-[1px] border-gray-400/30 py-3">
                      <h3 className="text-base sm:text-lg font-bold truncate pr-3">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-red-500 font-semibold">TK.{item.price}</p>
                        {item.oldPrice > item.price && (
                          <p className="text-gray-500 text-[13px] lg:text-sm line-through">TK.{item.oldPrice}</p>
                        )}
                      </div>
                    </div>
                  </ProductLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
