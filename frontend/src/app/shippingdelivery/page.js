'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Truck, Clock, Zap, MapPin } from 'lucide-react';

const content = {
  EN: {
    title: 'Shipping & Delivery',
    intro:
      'At Flash, we ensure safe and timely delivery to customers across Bangladesh. Below is our delivery process and shipping charges:',
    sections: [
      {
        icon: Truck,
        heading: 'Regular Delivery',
        note: 'Available inside Dhaka, and outside Dhaka.',
        rows: [
          {
            label: 'Inside Dhaka ',
            duration: '72 Hours',
            charge: '70 TK (for any amount of products)',
          },
          {
            label: 'Outside Dhaka',
            duration: '4 working days',
            charge: '130 TK (for any amount of products)',
          },
        ],
        footnote: 'Delivery timelines may vary based on location and product type.',
      },
      {
        icon: Zap,
        heading: 'Express Delivery (Dhaka City Only)',
        note: 'Need your order faster? Choose express delivery within Dhaka city.',
        rows: [
          {
            label: 'Express Delivery',
            duration: null,
            charge: '100 TK',
          },
        ],
      },
    ],
    howHeading: 'How You Receive Your Order',
    howText:
      'Your order will be delivered directly to your home or office address provided during checkout. Our delivery partners will contact you if needed during delivery.',
    closing:
      'We aim to provide a smooth and reliable delivery experience for every customer.',
    terms: 'Terms & Conditions',
    duration: 'Duration',
    charge: 'Charge',
  },
  BN: {
    title: 'শিপিং ও ডেলিভারি',
    intro:
      'ফ্ল্যাশে (Flash), আমরা সারা বাংলাদেশের গ্রাহকদের জন্য নিরাপদ এবং সময়মতো ডেলিভারি নিশ্চিত করি। নিচে আমাদের ডেলিভারি প্রক্রিয়া এবং শিপিং চার্জ দেওয়া হলো:',
    sections: [
      {
        icon: Truck,
        heading: 'রেগুলার ডেলিভারি',
        note: 'ঢাকা এবং ঢাকার বাইরে উপলব্ধ।',
        rows: [
          {
            label: 'ঢাকার ভেতরে',
            duration: '৭২ ঘণ্টা',
            charge: '৭০ টাকা (যেকোনো পরিমাণ পণ্যের জন্য)',
          },
          {
            label: 'ঢাকার বাইরে',
            duration: '৪ কার্যদিবস',
            charge: '১৩০ টাকা (যেকোনো পরিমাণ পণ্যের জন্য)',
          },
        ],
        footnote: 'স্থান এবং পণ্যের ধরনের ওপর ভিত্তি করে ডেলিভারির সময় পরিবর্তিত হতে পারে।',
      },
      {
        icon: Zap,
        heading: 'এক্সপ্রেস ডেলিভারি (শুধুমাত্র ঢাকা শহরে)',
        note: 'আপনার অর্ডার আরও দ্রুত প্রয়োজন? ঢাকা শহরের ভেতরে এক্সপ্রেস ডেলিভারি বেছে নিন।',
        rows: [
          {
            label: 'এক্সপ্রেস ডেলিভারি',
            duration: null,
            charge: '১০০ টাকা',
          },
        ],
      },
    ],
    howHeading: 'আপনি কীভাবে আপনার অর্ডার গ্রহণ করবেন',
    howText:
      'চেকআউটের সময় আপনার দেওয়া বাড়ি বা অফিসের ঠিকানায় আপনার অর্ডার সরাসরি পৌঁছে দেওয়া হবে। ডেলিভারির সময় প্রয়োজন হলে আমাদের ডেলিভারি পার্টনাররা আপনার সাথে যোগাযোগ করবেন।',
    closing:
      'আমরা প্রতিটি গ্রাহকের জন্য একটি ঝামেলাবিহীন এবং নির্ভরযোগ্য ডেলিভারি অভিজ্ঞতা প্রদান করার লক্ষ্য রাখি।',
    terms: 'শর্তাবলী',
    duration: 'সময়কাল',
    charge: 'চার্জ',
  },
};

export default function ShippingDeliveryPage() {
  const [lang, setLang] = useState('EN');
  const [open, setOpen] = useState(false);
  const t = content[lang];

  return (
    <main className="min-h-screen ">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        {/* Top bar: Terms & Conditions link + language dropdown */}
        <div className="mb-8 flex items-center justify-between border-b border-neutral-200 pb-4">
          <Link
            href="/terms-and-conditions"
            className="text-sm font-medium text-neutral-500 dark:text-white hover:text-emerald-700 transition-colors"
          >
            {t.terms}
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm hover:border-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {lang}
              <ChevronDown
                size={15}
                className={`transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute right-0 z-10 mt-1.5 w-24 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
                {['EN', 'BN'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLang(code);
                      setOpen(false);
                    }}
                    className={`block w-full px-3.5 py-2 text-left text-sm font-medium transition-colors ${
                      lang === code
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white ">
          {t.title}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600 dark:text-gray-300">
          {t.intro}
        </p>

        {/* Sections */}
        <div className="mt-8 space-y-6">
          {t.sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Icon size={18} />
                  </span>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {section.heading}
                  </h2>
                </div>

                {section.note && (
                  <p className="mt-3 text-[15px] text-neutral-600 dark:text-gray-200 ">{section.note}</p>
                )}

                <div className="mt-4 space-y-3">
                  {section.rows.map((row, j) => (
                    <div
                      key={j}
                      className="rounded-xl bg-neutral-50 dark:bg-gray-600 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-white">
                        <MapPin size={15} className="shrink-0 text-emerald-700 dark:text-green-500" />
                        {row.label}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 sm:mt-0">
                        {row.duration && (
                          <div className="flex items-center justify-between gap-1.5 text-sm text-neutral-600">
                            <Clock size={14} />
                            <span className="font-medium text-neutral-500 dark:text-gray-300">
                              {t.duration}:
                            </span>{' '}
                            {row.duration}
                          </div>
                        )}
                        <div className="text-sm font-semibold text-emerald-700 dark:text-green-600">
                          {t.charge}: {row.charge}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {section.footnote && (
                  <p className="mt-3 text-xs italic text-neutral-400">
                    {section.footnote}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* How you receive your order */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t.howHeading}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-gray-300">
            {t.howText}
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-gray-300">{t.closing}</p>
      </div>
    </main>
  );
}