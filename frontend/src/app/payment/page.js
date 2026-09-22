"use client";

import { useState, useRef, useEffect } from "react";
import { CreditCard, Truck, Wallet, PackageCheck, ChevronDown } from "lucide-react";
import Link from "next/link";

const content = {
  en: {
    intro:
      "We offer flexible and secure payment options to make your shopping smooth and convenient:",
    terms: "Terms And Conditions",
    sections: [
      {
        icon: CreditCard,
        title: "Pre-Payment Options",
        body: null,
        list: ["Visa/MasterCard", "bKash", "Nagad"],
      },
      {
        icon: Truck,
        title: "Cash on Delivery (COD)",
        body: "Pay in cash when your order arrives at your doorstep.",
        note: "COD may not apply to certain pre-order items.",
        list: null,
      },
      {
        icon: Wallet,
        title: "Partial Payment",
        body: "Pay a portion of the amount in advance and the rest upon delivery — perfect for high-value items.",
        list: null,
      },
      {
        icon: PackageCheck,
        title: "Pre-Order Policy",
        body: "For pre-order items, pre-payment is required to confirm your booking.",
        list: null,
      },
    ],
    footer: "Choose the payment method that works best for you — your convenience is our priority.",
  },
  bn: {
    intro:
      "আপনার কেনাকাটা আরও সহজ ও সুবিধাজনক করতে আমরা নমনীয় এবং নিরাপদ পেমেন্ট অপশন দিয়ে থাকি:",
    terms: "শর্তাবলী",
    sections: [
      {
        icon: CreditCard,
        title: "অগ্রিম পেমেন্ট অপশন",
        body: null,
        list: ["ভিসা/মাস্টারকার্ড (Visa/MasterCard)", "বিকাশ (bKash)", "নগদ (Nagad)"],
      },
      {
        icon: Truck,
        title: "ক্যাশ অন ডেলিভারি (COD)",
        body: "অর্ডার আপনার দোরগোড়ায় পৌঁছানোর পর নগদে পেমেন্ট করুন।",
        note: "প্রি-অর্ডার আইটেমের ক্ষেত্রে COD প্রযোজ্য নাও হতে পারে।",
        list: null,
      },
      {
        icon: Wallet,
        title: "আংশিক পেমেন্ট",
        body: "মোট মূল্যের একটি অংশ অগ্রিম পেমেন্ট করুন এবং বাকিটা ডেলিভারি পাওয়ার পর দিন — উচ্চ-মূল্যের আইটেমগুলোর জন্য এটি অত্যন্ত উপযোগী।",
        list: null,
      },
      {
        icon: PackageCheck,
        title: "প্রি-অর্ডার পলিসি",
        body: "প্রি-অর্ডার আইটেমগুলোর ক্ষেত্রে বুকিং নিশ্চিত করতে অগ্রিম পেমেন্ট করা আবশ্যক।",
        list: null,
      },
    ],
    footer: "আপনার জন্য সবচেয়ে উপযুক্ত পেমেন্ট মাধ্যমটি বেছে নিন — আপনার সুবিধাই আমাদের প্রধান অগ্রাধিকার।",
  },
};

const languages = [
  { code: "en", label: "EN" },
  { code: "bn", label: "BN" },
];

function LanguageDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = languages.find((l) => l.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-10 mt-1 w-24 overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg"
        >
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                role="option"
                aria-selected={lang === l.code}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-stone-50 ${
                  lang === l.code ? "font-semibold text-emerald-700" : "text-stone-600"
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PaymentPage() {
  const [lang, setLang] = useState("en");
  const t = content[lang];
  const isBn = lang === "bn";

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl">Payment</h1>

      <p className={`mt-4 max-w-xl text-stone-600 dark:text-gray-400 ${isBn ? "leading-loose" : "leading-relaxed"}`}>
        {t.intro}
      </p>

      <div className="mt-10 space-y-6">
        {t.sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="flex bg-white dark:bg-gray-800 gap-4 rounded-lg border border-stone-200 p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-stone-900 dark:text-white">{section.title}</h2>

                {section.list && (
                  <ul className="mt-2 space-y-1 text-stone-600 dark:text-gray-300 ">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.body && (
                  <p className={`mt-2 text-stone-600 dark:text-gray-300 ${isBn ? "leading-loose" : "leading-relaxed"}`}>
                    {section.body}
                  </p>
                )}

                {section.note && (
                  <p className="mt-2 text-sm italic text-stone-400 dark:text-gray-300">{section.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className={`mt-8 text-stone-600 dark:text-gray-300 ${isBn ? "leading-loose" : "leading-relaxed"}`}>
        {t.footer}
      </p>

      <div className="mt-10 flex items-center justify-between border-t border-stone-200 pt-5">
        <Link href="/terms" className="text-sm font-medium text-stone-700 dark:text-gray-300 underline-offset-4 hover:underline">
          {t.terms}
        </Link>
        <LanguageDropdown lang={lang} setLang={setLang} />
      </div>
    </main>
  );
}