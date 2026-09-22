'use client';

import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const content = {
  EN: {
    title: 'About Us ',
    heading: 'About FLASH',
    tagline: 'Style That Speaks, Quality That Lasts.',
    paragraphs: [
      'FLASH is a modern fashion and lifestyle brand dedicated to bringing together style, quality, comfort, and timeless design. Our mission is to help you express your personality and elevate your everyday style with products that are designed to make a statement.',
      'Our collection features a wide range of premium fashion essentials, including Leather Shoes, Sandals, Sneakers, Bags, Ladies\u2019 Bags, Ladies\u2019 Shoes, Belts, and Wallets—carefully selected and designed for both men and women.',
      'At FLASH, we believe that great fashion is more than just good looks. Quality, comfort, durability, and attention to detail are at the heart of everything we do. We strive to deliver products that not only complement your style but also become a reliable part of your everyday life.',
      'Our vision goes beyond building a fashion brand. We aim to create a trusted and recognizable lifestyle brand where every customer experiences quality products, contemporary designs, and exceptional value.',
    ],
    footer: 'Walk With - FLASH . Carry Your Confidence.',
  },
  BN: {
    title: 'আমাদের সম্পর্কে',
    heading: 'FLASH সম্পর্কে',
    tagline: 'FLASH — Style That Speaks, Quality That Lasts.',
    paragraphs: [
      'FLASH একটি আধুনিক ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড, যেখানে স্টাইল, মান এবং আরাম—এই তিনটি বিষয়কে সর্বোচ্চ গুরুত্ব দেওয়া হয়। আমাদের লক্ষ্য হলো প্রতিদিনের জীবনে আপনার ব্যক্তিত্ব ও রুচিকে আরও আকর্ষণীয় করে তুলতে মানসম্মত ও ট্রেন্ডি পণ্য পৌঁছে দেওয়া।',
      'আমাদের কালেকশনে রয়েছে Premium Leather Shoes, Sandals, Sneakers, Bags, Ladies Bags, Ladies Shoes, Belts এবং Wallets—যা নারী ও পুরুষ উভয়ের জন্যই তৈরি করা হয়েছে আধুনিক ফ্যাশন ও ব্যবহারিকতার কথা মাথায় রেখে।',
      'FLASH বিশ্বাস করে, একটি ভালো পণ্য শুধু দেখতে সুন্দর হলেই যথেষ্ট নয়—এর গুণমান, আরাম, স্থায়িত্ব এবং নিখুঁত ফিনিশিংও সমান গুরুত্বপূর্ণ। তাই প্রতিটি পণ্যে আমরা সর্বোচ্চ মান নিশ্চিত করার চেষ্টা করি।',
      'আমাদের স্বপ্ন শুধু একটি ব্র্যান্ড তৈরি করা নয়; বরং এমন একটি বিশ্বস্ত ফ্যাশন ব্র্যান্ড হিসেবে নিজেদের প্রতিষ্ঠিত করা, যেখানে প্রতিটি গ্রাহক পাবেন মানসম্মত পণ্য, আধুনিক ডিজাইন এবং একটি প্রিমিয়াম অভিজ্ঞতা।',
    ],
    footer: 'Walk With - FLASH . Carry Your Confidence.',
  },
};

const languages = [
  { code: 'EN', label: 'EN' },
  { code: 'BN', label: 'BN' },
];

export default function AboutUsPolicyPage() {
  const [lang, setLang] = useState('EN');
  const [open, setOpen] = useState(false);

  const current = content[lang];

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header row: H1 + language dropdown */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
            {current.title}
          </h1>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <Globe className="w-4 h-4 text-gray-500 " />
              {lang}
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {open && (
              <ul
                role="listbox"
                className="absolute right-0 mt-2 w-24 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-10"
              >
                {languages.map((item) => (
                  <li key={item.code}>
                    <button
                      type="button"
                      onClick={() => {
                        setLang(item.code);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        lang === item.code
                          ? 'bg-gray-900 text-white cursor-pointer'
                          : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Content */}
        <section>
          <h2 className="text-xl font-semibold text-black dark:text-white mb-1">
            {current.heading}
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-6">
            {current.tagline}
          </p>

          <div className="space-y-5">
            {current.paragraphs.map((para, idx) => (
              <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          <p className="mt-8 text-sm font-semibold text-black dark:text-white">
            {current.footer}
          </p>
        </section>
      </div>
    </main>
  );
}