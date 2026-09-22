'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import Saggation from '@/components/Saggation';
import { useCart } from '@/components/CartContext';
import { fetchProductById } from '@/services/dummyjson';

export default function DynamicProductPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToStoppingCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!productId) return;
      setLoading(true);
      const data = await fetchProductById(productId);
      if (isMounted) {
        setProduct(data);
        if (data?.colors?.length > 0) setSelectedColor(data.colors[0]);
        if (data?.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [productId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white dark:bg-black py-16 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
      </main>
    );
  }

  const handleAddToCart = () => {
    addToStoppingCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: quantity,
      color: selectedColor,
      size: selectedSize,
    });
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addToStoppingCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: quantity,
      color: selectedColor,
      size: selectedSize,
    });
    window.location.href = '/cart';
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div className="flex flex-col-reverse gap-4 sm:flex-row">
              {images.length > 1 && (
                <div className="flex gap-3 sm:flex-col sm:w-24 shrink-0 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-full sm:h-24 rounded-lg border-2 overflow-hidden shrink-0 ${
                        activeImageIndex === idx ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-contain p-1" sizes="96px" />
                    </button>
                  ))}
                </div>
              )}
              <div className="relative flex-1 aspect-square sm:aspect-[4/3] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <Image src={images[activeImageIndex] || product.image} alt={product.name} fill className="object-contain p-6" priority />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-amber-200">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#f48721]">TK. {product.price}</span>
                {product.oldPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">TK. {product.oldPrice}</span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="text-xs bg-red-600 text-white font-bold px-2.5 py-1 rounded-full">
                    -{product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>

              {/* Color variants */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 mt-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available Colors: {selectedColor && <span className="font-semibold text-orange-600 dark:text-orange-400">{selectedColor}</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                          selectedColor === color
                            ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 shadow-xs'
                            : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size variants */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2 mt-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available Sizes: {selectedSize && <span className="font-semibold text-orange-600 dark:text-orange-400">{selectedSize}</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[42px] px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                          selectedSize === size
                            ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 shadow-xs'
                            : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-700 dark:text-white font-medium">Quantity:</span>
                <div className="flex items-center rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 transition"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="rounded-lg bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 transition"
                >
                  Buy Now
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-500">
                Category: <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{product.category}</span> | Brand: <span className="font-semibold text-red-600">{product.brand}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Saggation category={product.category} />
    </main>
  );
}
