'use client';

import { useEffect, useState } from 'react';
import ProductLink from '@/components/ProductLink';
import Addtocardbutton from '@/components/addtocardbutton';
import Wishlistheart from '@/components/Wishlistheart';
import { fetchHomepageCollections } from '@/services/dummyjson';

export default function HomepageCollections() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    let isCurrent = true;
    fetchHomepageCollections()
      .then((data) => {
        if (isCurrent) setSections(data);
      })
      .catch((error) => console.error('Failed to load homepage collections:', error));
    return () => {
      isCurrent = false;
    };
  }, []);

  return sections.filter((section) => section.products.length > 0).map((section) => (
    <section key={section.key} className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center">
        <div className="mb-4 h-[27px] w-[13px] rounded-3xl bg-red-700" />
        <h2 className="mb-4 ml-2 text-2xl font-bold">{section.title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {section.products.map((product) => (
          <article key={product.id} className="flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-400/30 bg-white shadow-sm dark:bg-gray-800">
            <div className="relative">
              <ProductLink item={product}>
                <img className="h-48 w-full object-cover sm:h-56" src={product.image} alt={product.name} />
              </ProductLink>
              <Wishlistheart item={product} />
            </div>
            <ProductLink item={product}>
              <div className="border-t border-gray-400/30 px-4 py-3">
                <h3 className="truncate text-base font-bold sm:text-lg">{product.name}</h3>
                <p className="mt-1 font-semibold text-red-500">৳{Number(product.price || 0).toLocaleString()}</p>
              </div>
            </ProductLink>
            <Addtocardbutton item={product} />
          </article>
        ))}
      </div>
    </section>
  ));
}
