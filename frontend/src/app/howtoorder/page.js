'use client';

import Link from 'next/link';
import { useState } from 'react';

const content = {
  en: {
    intro:
      'Ordering from Flash Comfort is simple and flexible. Choose the method that’s most convenient for you:',
    termsLabel: 'Terms And Conditions',
    methods: [
      {
        title: 'Order Through Website',
        desc: 'Browse products, add items to your cart, and complete checkout in just a few steps.',
      },
      {
        title: 'Order via WhatsApp',
        desc: 'Send us your product list or screenshots on WhatsApp—our team will confirm your order instantly.',
        contactLabel: 'WhatsApp',
        contactValue: '+8801321208940',
        href: 'https://wa.me/8801321208940',
      },
      {
        title: 'Order on Facebook',
        desc: 'Message us directly on our Facebook page to place an order or ask for product details.',
      },
      {
        title: 'Order by Phone Call',
        desc: 'Prefer talking to a person? Call our customer support team and place your order verbally.',
        contactLabel: 'Hotline',
        contactValue: '09642 922 922',
        href: 'tel:09642922922',
      },
    ],
  },
  bn: {
    intro:
      'Flash Comfort থেকে অর্ডার করা খুবই সহজ এবং সুবিধাজনক। আপনার জন্য সবচেয়ে সুবিধাজনক পদ্ধতিটি বেছে নিন:',
    termsLabel: 'শর্তাবলী',
    methods: [
      {
        title: 'ওয়েবসাইটের মাধ্যমে অর্ডার করুন',
        desc: 'প্রোডাক্টগুলো ব্রাউজ করুন, কার্টে আপনার পছন্দের আইটেম যোগ করুন এবং মাত্র কয়েকটি ধাপে চেকআউট সম্পন্ন করুন।',
      },
      {
        title: 'হোয়াটসঅ্যাপের মাধ্যমে অর্ডার করুন',
        desc: 'হোয়াটসঅ্যাপে আপনার প্রোডাক্টের তালিকা বা স্ক্রিনশট আমাদের পাঠিয়ে দিন—আমাদের টিম সাথে সাথেই আপনার অর্ডার কনফার্ম করবে।',
        contactLabel: 'হোয়াটসঅ্যাপ',
        contactValue: '+৮৮০১৩২১২০৮৯৪০',
        href: 'https://wa.me/8801321208940',
      },
      {
        title: 'ফেসবুকে অর্ডার করুন',
        desc: 'অর্ডার করতে বা প্রোডাক্টের বিস্তারিত জানতে আমাদের ফেসবুক পেজে সরাসরি মেসেজ করুন।',
      },
      {
        title: 'ফোন কলের মাধ্যমে অর্ডার করুন',
        desc: 'সরাসরি কথা বলে অর্ডার করতে চান? আমাদের কাস্টমার সাপোর্ট টিমে কল করুন এবং কথা বলে আপনার অর্ডার দিন।',
        contactLabel: 'হটলাইন',
        contactValue: '০৯৬৪২ ৯২২ ৯২২',
        href: 'tel:09642922922',
      },
    ],
  },
};

const icons = [
  // Website
  <svg key="web" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9z" />
  </svg>,
  // WhatsApp
  <svg key="wa" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.1a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.4 3.8 3.4.5.2.9.4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1 0-.2-.2-.2-.4-.3z" />
  </svg>,
  // Facebook
  <svg key="fb" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M13.5 21v-7.9h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.5-1.5h1.6V4.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8v3h2.7V21h2.8z" />
  </svg>,
  // Phone
  <svg key="ph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2.1z" />
  </svg>,
];

export default function HowToOrderPage() {
  const [lang, setLang] = useState('en');
  const t = content[lang];
  const isBn = lang === 'bn';

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center">
        How To Order
      </h1>

      <p className="mt-4 text-gray-600 dark:text-gray-300 text-center leading-relaxed">
        {t.intro}
      </p>

      {/* Terms & language dropdown row */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Link
          href="/terms"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          {t.termsLabel}
        </Link>

        <div className="relative inline-flex rounded-full border border-gray-300 bg-white p-0.5 cursor-pointer">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors cursor-pointer ${
              !isBn ? 'bg-emerald-600 text-white' : 'text-gray-500'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('bn')}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors cursor-pointer ${
              isBn ? 'bg-emerald-600 text-white' : 'text-gray-500'
            }`}
          >
            BN
          </button>
        </div>
      </div>

      {/* Order methods */}
      <div className="mt-8 space-y-4">
        {t.methods.map((method, i) => (
          <div
            key={method.title}
            className="flex gap-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 p-5 shadow-sm"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {icons[i]}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white ">{method.title}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {method.desc}
              </p>
              {method.contactLabel && (
                <Link
                  href={method.href}
                  className="mt-2 inline-block text-sm font-medium text-emerald-700 dark:text-green-600 hover:underline"
                >
                  {method.contactLabel}: {method.contactValue}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}