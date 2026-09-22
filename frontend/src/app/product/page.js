'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import Saggation from '@/components/Saggation';
import { useCart } from '@/components/CartContext';
import { getProductReviews, submitProductReview } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Sample data — replace with data fetched from your API / CMS        */
/* ------------------------------------------------------------------ */

const defaultProduct = {
  name: 'Orginal Lether Shoe',
  price: null,
  brand: 'Flesh',
  brandLogo: null, // e.g. '/images/brands/honeyraj-logo.png'
  images: [
    '/shoe1.avif',
    '/shoe2.avif',
    '/shoe3.avif',
  ],
};

const description = {
  bn: {
    paragraphs: [
      'কালোজিরা ফুলের মধু থেকে মৌমাছিরা সংগ্রহ করা একটি অনন্য ও উন্নতমানের মধু হলো ব্ল্যাক সিড হানি। এর স্বতন্ত্র স্বাদ, ঘ্রাণ, রং এবং অসাধারণ স্বাস্থ্য উপকারিতার জন্য এটি পরিচিত।',
      'ছোট ব্যাচে উৎপাদিত হওয়ায় এর প্রাকৃতিক সমৃদ্ধি ও বিশুদ্ধতা বজায় থাকে।',
    ],
    benefits: [
      'রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে',
      'হজমে সহায়তা করে এবং অম্লতা ও কোষ্ঠকাঠিন্য কমাতে সাহায্য করে',
      'শক্তি যোগায় এবং ঘুমের মান উন্নত করে',
      'সর্দি, কাশি ও গলা ব্যথায় কার্যকর',
      'ত্বক ও সৌন্দর্যচর্চায় উপকারী',
    ],
    storage: 'ঠান্ডা ও শুষ্ক স্থানে রাখুন। সরাসরি সূর্যালোক থেকে দূরে রাখুন এবং ফ্রিজে রাখবেন না।',
  },
  paragraphs: [
    'Black Seed Honey is a unique and premium-quality honey collected by bees from the nectar of Nigella sativa flowers. Known for its strong taste, aroma, color, and remarkable health benefits, it is also called "Black Seed Honey."',
    'Produced in small batches, it preserves its natural richness and purity.',
  ],
  benefits: [
    'Boosts immunity',
    'Supports digestion, relieves acidity & constipation',
    'Provides energy and improves sleep quality',
    'Effective for cold, cough & sore throat',
    'Beneficial for skin and beauty care',
  ],
  storage: 'Store in a cool, dry place. Keep away from direct sunlight and do not refrigerate.',
};

const initialReviewStats = {
  totalReviews: 10000,
  growthPercent: 21,
  averageRating: 4.0,
  breakdown: {
    5: 2000,
    4: 1000,
    3: 500,
    2: 200,
    1: 0,
  },
};

const initialReviews = [
  {
    id: 1,
    name: 'Towhidur Rahman',
    rating: 4,
    date: '24-10-2022',
    comment:
      'This is my go-to honey now. The taste is strong and distinct, and I can genuinely feel the difference in my digestion and energy levels after a few weeks of daily use.',
    images: [],
    avatar: null,
  },
  {
    id: 2,
    name: 'Towhidur Rahman',
    rating: 4,
    date: '24-10-2022',
    comment:
      'Packaging arrived in great condition and the honey itself is thick and rich in color. Would recommend to anyone looking for an authentic black seed honey.',
    images: [],
    avatar: null,
  },
  {
    id: 3,
    name: 'Towhidur Rahman',
    rating: 4,
    date: '24-10-2022',
    comment:
      'Good quality overall. Delivery took a couple of extra days but the product quality made up for it. Will be ordering again for the family.',
    images: [],
    avatar: null,
  },
];

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'reviews', label: 'Customer Reviews' },
  { id: 'submit', label: 'Submit Your Review' },
];

const BAR_COLORS = {
  5: 'bg-teal-500',
  4: 'bg-purple-500',
  3: 'bg-amber-400',
  2: 'bg-cyan-400',
  1: 'bg-orange-500',
};

const MAX_IMAGES = 3;

/* ------------------------------------------------------------------ */
/*  Small shared bits                                                  */
/* ------------------------------------------------------------------ */

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

function Stars({ rating, size = 'w-5 h-5' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`${size} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
            clipRule="evenodd"
          />
        </svg>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gallery                                                            */
/* ------------------------------------------------------------------ */

function ProductGallery({ images = [], productName = 'Product' }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = () => setActiveIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  const goNext = () => setActiveIndex((p) => (p === images.length - 1 ? 0 : p + 1));

  if (!images.length) return null;

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {/* Thumbnails */}
      <div className="flex gap-3 sm:flex-col sm:w-24 shrink-0 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto sm:max-h-[520px] pb-1 sm:pb-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            aria-label={`View image ${idx + 1}`}
            className={` relative shrink-0 w-16 h-16 sm:w-full sm:h-24 rounded-lg border-2 overflow-hidden transition-colors cursor-pointer ${
              activeIndex === idx ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              fill
              sizes="96px"
              className="object-contain bg-white p-1"
            />
            {activeIndex === idx && (
              <span className="absolute top-0.5 right-0.5 bg-orange-500 rounded-full p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative flex-1 aspect-square sm:aspect-[4/3] rounded-xl border border-gray-200 bg-white overflow-hidden">
        <Image
          src={images[activeIndex]}
          alt={`${productName} image ${activeIndex + 1}`}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-contain p-6"
          priority={activeIndex === 0}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm text-gray-800 cursor-pointer "
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm text-gray-800 cursor-pointer "
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product info / purchase panel                                     */
/* ------------------------------------------------------------------ */

function ProductInfo({ product }) {
  const { addToStoppingCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  const handleAddToCart = () => {
    addToStoppingCart({
      id: product.name,
      name: product.name,
      image: product.images[0],
      price: product.price,
      color: selectedColor,
      size: selectedSize,
    });
    toast.success(
      `${product.name}${selectedSize || selectedColor ? ` (${selectedSize || 'Size not selected'}, ${selectedColor || 'Color not selected'})` : ''} x${quantity} added to cart`
    );
  };

  const handleBuyNow = () => {
    toast('Redirecting to checkout...');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I'd like to order ${quantity} x ${product.name} (${selectedSize || 'Size not selected'}, ${selectedColor || 'Color not selected'}, Price: ${product.price})`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+8800000000000';
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-amber-200">{product.name}</h1>

                  <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#f48721] ">৳{Number(product.price || 0).toLocaleString()}</span>
              {product.oldPrice > product.price && (
                <span className="text-lg text-gray-400 linethroug ">৳{Number(product.oldPrice).toLocaleString()}</span>
              )}
            </div>

      {product.description && <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-amber-50 ">{product.description}</p>}

 {/* Size selector */}
            {sizes.length > 0 && <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-amber-200 ">
                Size: <span className="font-semibold text-gray-900 dark:text-white ">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size, index) => (
                  <button
                    key={`size-${size}-${index}`}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition cursor-pointer ${
                      selectedSize === size
                        ? 'border-orange-500 bg-orange-50 dark:bg-gray-600 text-orange-600'
                        : 'border-gray-200 text-gray-700 dark:text-white hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>}

            {/* Color selector */}
            {colors.length > 0 && <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-amber-200">
                Color: <span className="font-semibold text-gray-900 dark:text-white ">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 ">
                {colors.map((color, index) => (
                  <button
                    key={`color-${color}-${index}`}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                    aria-pressed={selectedColor === color}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition cursor-pointer ${
                      selectedColor === color ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-700 dark:text-white hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>}

      <hr className="border-gray-200" />

      <div className="flex items-center gap-4">
        <span className="text-gray-700 dark:text-white font-medium">Quantity:</span>
        <div className="flex items-center rounded-full bg-gray-100 dark:bg-gray-400 overflow-hidden">
          <button
            type="button"
            onClick={decrement}
            aria-label="Decrease quantity"
            className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer transition-colors"
          >
            &minus;
          </button>
          <span className="w-10 text-center font-medium text-gray-900 dark:text-white">{quantity}</span>
          <button
            type="button"
            onClick={increment}
            aria-label="Increase quantity"
            className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer transition-colors"
          >
            +
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex items-center justify-center gap-2 rounded-lg cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421l3.243-6.75a.75.75 0 00-.674-1.079H5.68l-.243-.913A1.875 1.875 0 003.636 2.25H2.25zM6.75 20.25a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM18.75 20.25a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          Add to Cart
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="flex items-center justify-center gap-2 rounded-lg cursor-pointer bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 transition-colors"
        >
          Buy Now
        </button>

        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex items-center justify-center text-sm cursor-pointer lg:text-lg text-nowrap gap-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a9.96 9.96 0 004.9 1.28h.01c5.52 0 10-4.48 10-10s-4.49-9.93-10.01-9.93zm5.85 14.19c-.25.7-1.45 1.34-2 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.9-4.28-5.05-4.48-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.61.17.3.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.35 1.45.3.15.47.12.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.08.13.08.72-.17 1.42z" />
          </svg>
          Order On WhatsApp
        </button>

        <button
          type="button"
          onClick={handleCall}
          className="flex items-center justify-center gap-2 rounded-lg cursor-pointer bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 px-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.523 1.822l-1.49 1.49a11.25 11.25 0 006.478 6.478l1.49-1.49a1.875 1.875 0 011.822-.523l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
              clipRule="evenodd"
            />
          </svg>
          Call For Order
        </button>
      </div>

      {product.brand && (
        <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 w-fit">
          <span className="text-gray-500 dark:text-white text-sm">Brand:</span>
          {product.brandLogo ? (
            <Image src={product.brandLogo} alt={product.brand} width={20} height={20} />
          ) : null}
          <span className="font-semibold text-red-600 text-sm">{product.brand}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Description tab                                                    */
/* ------------------------------------------------------------------ */

function DescriptionTab({ description }) {
  const [language, setLanguage] = useState('english');
  if (!description) return null;

  const isBengali = language === 'bengali' && Boolean(description.bn);
  const content = isBengali ? description.bn : description;

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 p-6">
      <div className=" text-lg font-semibold text-gray-900 dark:text-amber-200 relative inline-block pb-2 mb-4">
        <div className=' flex items-center justify-between gap-10' >
          <div>
        Product Details
        <span className="absolute left-0 bottom-0 h-0.5 w-10 bg-orange-500" />
        </div>
        <div  >
           <select
             value={language}
             onChange={(event) => setLanguage(event.target.value)}
             aria-label="Select description language"
             className="self-end bg-gray-500 dark:bg-gray-500 text-amber-50 text-xs shrink-0 rounded-md cursor-pointer outline-none mb-1 "
           >
              <option className="bg-white dark:bg-black text-black dark:text-amber-50 cursor-pointer" value="english">
                EN
              </option>
              {description.bn && <option className="bg-white dark:bg-black text-black dark:text-amber-50 cursor-pointer" value="bengali">BN</option>}
            </select>
        </div>
        </div>
        
      </div>

      {content.paragraphs?.map((p, idx) => (
        <p key={idx} className="text-gray-600 dark:text-amber-50 leading-relaxed mb-3">
          {p}
        </p>
      ))}

      {description.benefits?.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 dark:text-amber-200 mb-2">
            {isBengali ? 'পুষ্টি ও স্বাস্থ্য উপকারিতা:' : 'Nutritional & Health Benefits:'}
          </h4>
          <ul className="space-y-1 text-gray-600 dark:text-amber-50 ">
            {content.benefits.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {content.storage && (
        <p className="mt-5  ">
          <span className="font-semibold text-gray-900 dark:text-amber-200">{isBengali ? 'সংরক্ষণ:' : 'Storage:'}</span>{' '}
          <span className='text-gray-900 dark:text-amber-50'>{content.storage}</span> 
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews tab                                                        */
/* ------------------------------------------------------------------ */

function ReviewsTab({ stats, reviews }) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 p-6">
      <h3 className="text-2xl text-center lg:text-start font-bold text-gray-900 dark:text-amber-200 mb-6">Reviews</h3>

      {/* Stats row */}
      <div className="flex gap-6 md:gap-10 items-center justify-between md:divide-x md:divide-gray-200 pb-6 border-b border-gray-200">
        <div className="md:pr-10 ml-0 lg:ml-12">
          <p className="text-gray-500 dark:text-white text-sm mb-1">Total Reviews</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-red-700">{formatCount(totalReviews)}</span>
            {stats.growthPercent != null && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-gray-900 rounded-full px-2 py-0.5">
                {stats.growthPercent}%
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 011 1v4.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L11 12.586V8a1 1 0 011-1z"
                    clipRule="evenodd"
                    transform="rotate(180 10 10)"
                  />
                </svg>
              </span>
            )}
          </div>
          <p className="text-gray-400 dark:text-amber-50 text-xs mt-1">Growth in reviews this year</p>
        </div>

        <div className="md:px-10 mr-0 lg:mr-12 ">
          <p className="text-gray-500 dark:text-white text-sm mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-yellow-500">{averageRating.toFixed(1)}</span>
            <Stars rating={averageRating} />
          </div>
          <p className="text-gray-400 dark:text-white text-xs mt-1">Average rating this year</p>
        </div>
      </div>

      {/* Scrollable review list */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-white py-8 text-center">No reviews yet. Be the first to share your opinion.</p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto pr-1 mt-2 divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review.id} className="py-5 flex gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-100">
                {review.avatar ? (
                  <Image src={review.avatar} alt={review.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
                    {review.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-amber-200">{review.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars rating={review.rating} size="w-4 h-4" />
                  <span className="text-gray-400 dark:text-amber-100 text-sm">{review.date}</span>
                </div>
                <p className="text-gray-600 dark:text-white mt-2 leading-relaxed whitespace-pre-line">{review.comment}</p>
                {review.images?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <Image src={img} alt={`Review image ${idx + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Submit review tab                                                  */
/* ------------------------------------------------------------------ */

function SubmitReviewTab({ onSubmit }) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toast(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const nextFiles = files.slice(0, remainingSlots).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...nextFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleBrowse = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write your opinion about the product');
      return;
    }

    try {
      await onSubmit?.({
        reviewerName: name.trim(),
        rating,
        comment: comment.trim(),
        images: [],
      });
    } catch (error) {
      toast.error(error.message || 'Failed to submit your review');
      return;
    }

    toast.success('Your review has been submitted');
    setName('');
    setComment('');
    setRating(5);
    setImages([]);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-amber-200 relative inline-block pb-2 mb-2">
        Submit Your Review
        <span className="absolute left-0 bottom-0 h-0.5 w-10 bg-orange-500" />
      </h3>
      <p className="text-gray-500 dark:text-white text-sm mb-6">
        Your email address will not be published. Required fields are marked *
      </p>

      <label className="block text-gray-700 font-medium mb-2" htmlFor="review-name">
        Your Name *
      </label>
      <input
        type="text"
        id="review-name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Write Your Name..."
        className="w-full h-8 px-2 rounded-lg border border-gray-300 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      />

      <label className="block text-gray-700 font-medium mt-4 mb-2" htmlFor="review-comment">
        Write your opinion about the product *
      </label>
      <textarea
        id="review-comment"
        required
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write Your Review Here..."
        rows={6}
        className="w-full rounded-lg border border-gray-300 p-4 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-y"
      />

      <p className="text-gray-700 font-medium mt-6 mb-2">Upload Images (Optional)</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 px-4 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-orange-400 bg-orange-50 dark:bg-gray-700' : 'border-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-500">
          <path d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5z" />
          <path d="M3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" />
        </svg>
        <p className="text-gray-700 dark:text-white font-medium">Drag &amp; Drop Images Here</p>
        <p className="text-gray-400 text-sm">or click to browse files ( {MAX_IMAGES} max )</p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBrowse} />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <Image src={img.url} alt={`Upload preview ${idx + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                aria-label="Remove image"
                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
        <div>
          <p className="text-gray-700 dark:text-amber-200 font-medium mb-2">Your Rating:</p>
          <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                className="p-0.5 cursor-pointer "
              >
                <Star strokeWidth={0.75} fill={displayRating ? "#FFD700" : "none" } className={`w-7 h-7 transition-colors ${i <= displayRating ? 'text-amber-600' : 'text-transparent'}`} >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
                    clipRule="evenodd"
                  />
                </Star>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-gray-900 hover:bg-black text-white font-semibold py-3 px-8 transition-colors self-start sm:self-auto cursor-pointer "
        >
          SUBMIT REVIEW
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tabs container                                                     */
/* ------------------------------------------------------------------ */

function ProductTabs({ description, reviewStats, initialReviews, productId }) {
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState(initialReviews);
  const [stats, setStats] = useState(reviewStats);

  const handleNewReview = async (reviewData) => {
    const response = await submitProductReview(productId, reviewData);
    const review = {
      id: response.review?._id || Date.now(),
      name: response.review?.reviewerName || reviewData.reviewerName,
      rating: response.review?.rating || reviewData.rating,
      date: 'Pending approval',
      comment: response.review?.comment || reviewData.comment,
      images: [],
      avatar: null,
    };
    setReviews((prev) => [review, ...prev]);
    setStats((prev) => {
      const breakdown = { ...prev.breakdown };
      breakdown[review.rating] = (breakdown[review.rating] ?? 0) + 1;
      const totalReviews = prev.totalReviews + 1;
      const priorSum = prev.averageRating * prev.totalReviews;
      const averageRating = (priorSum + review.rating) / totalReviews;
      return { ...prev, breakdown, totalReviews, averageRating };
    });
    setActiveTab('reviews');
  };

  return (
    <div className="mt-10">
      <div role="tablist" aria-label="Product information tabs" className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1.5 w-fit max-w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-white dark:bg-gray-500 text-gray-900 dark:text-red-600 shadow-sm' : 'text-gray-500 dark:text-amber-100 hover:text-gray-700 dark:hover:text-amber-50'
            }`}
          >
            {tab.label}
            {tab.id === 'reviews' ? ` (${reviews.length})` : ''}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'description' && <DescriptionTab description={description} />}
        {activeTab === 'reviews' && <ReviewsTab stats={stats} reviews={reviews} />}
        {activeTab === 'submit' && <SubmitReviewTab onSubmit={handleNewReview} />}
      </div>
    </div>
  );
}

import { fetchProductById } from '@/services/dummyjson';

function ProductPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      setLoading(true);
      if (productId) {
        const fetched = await fetchProductById(productId);
        if (fetched && isMounted) {
          setProduct(fetched);
          const fetchedReviews = await getProductReviews(productId).catch(() => []);
          if (isMounted) setProductReviews(Array.isArray(fetchedReviews) ? fetchedReviews : []);
          setLoading(false);
          return;
        }
      }

      const image = searchParams.get('image');
      const fallback = {
        ...defaultProduct,
        id: productId || '1',
        name: searchParams.get('name') || defaultProduct.name,
        price: Number.parseFloat(searchParams.get('price')) || 1800,
        oldPrice: Number.parseFloat(searchParams.get('oldPrice')) || 2500,
        images: image ? [image, ...defaultProduct.images] : defaultProduct.images,
        description: 'High quality product carefully selected for your needs.',
        reviews: [],
      };
      if (isMounted) {
        setProduct(fallback);
        setLoading(false);
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [productId, searchParams]);

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

  const customDescription = typeof product.description === 'string'
    ? {
        paragraphs: [product.description],
        benefits: [],
        storage: '',
      }
    : description;

  const formattedReviews = productReviews.map((review) => ({
    id: review._id,
    name: review.reviewerName || review.user?.fullName || 'Customer',
    rating: review.rating || 5,
    date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently',
    comment: review.comment || '',
    images: review.images || [],
    avatar: null,
  }));

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ProductGallery images={product.images || [product.image]} productName={product.name} />
            <ProductInfo key={product.id} product={product} />
          </div>
        </div>

        <ProductTabs
          description={customDescription}
          reviewStats={{ ...initialReviewStats, totalReviews: formattedReviews.length, averageRating: product.rating || 4.5 }}
          initialReviews={formattedReviews}
          productId={product.id}
        />
      </div>

      <div>
        <Saggation category={product.category} />
      </div>
    </main>
  );
}

export default function page() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white dark:bg-black" />}>
      <ProductPageContent />
    </Suspense>
  );
}