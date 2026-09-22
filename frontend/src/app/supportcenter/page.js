'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  Send,
  ChevronDown,
  Globe,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const CONTENT = {
  en: {
    dir: 'ltr',
    eyebrow: 'We are here, always',
    h1: 'Support Center',
    intro:
      "Whatever you need — a question about an order, a delivery date, or a refund — our team is on call around the clock.",
    contactUs: 'Contact Us',
    contactItems: [
      { icon: Phone, label: 'Phone', value: '09642 922 922', meta: '24/7', href: 'tel:09642922922' },
      { icon: Mail, label: 'Email', value: 'contact@ghorerbazar.com', meta: 'Reply within a day', href: 'mailto:contact@ghorerbazar.com' },
      { icon: MessageCircle, label: 'Live Chat', value: 'Available', meta: '24/7', href: '#' },
      { icon: Send, label: 'WhatsApp', value: '+8801321208940', meta: 'Message anytime', href: 'https://wa.me/8801321208940' },
    ],
    faqHeading: 'Help & FAQs',
    faqSub: 'Find answers to common questions about ordering, delivery, returns, and more.',
    cards: [
      {
        icon: Package,
        title: 'Order Tracking',
        desc: 'Check the status of your order anytime using your order ID or phone number.',
        link: '/',
      },
      {
        icon: Truck,
        title: 'Shipping & Delivery',
        desc: 'Learn about delivery timelines, shipping fees, and available locations.',
        link: '/shippingdelivery',
      },
      {
        icon: RotateCcw,
        title: 'Return & Refund Policy',
        desc: 'Understand how to initiate returns and how refunds are processed.',
        link: '/refund',
      },
      {
        icon: CreditCard,
        title: 'Payment Information',
        desc: 'See available payment methods, including cash on delivery, cards, and mobile payments.',
        link: '/contactus',
      },
    ],
    cta: 'Learn more',
  },
  bn: {
    dir: 'ltr',
    eyebrow: 'আমরা আছি, সবসময়',
    h1: 'সহায়তা কেন্দ্র',
    intro:
      'অর্ডার সংক্রান্ত প্রশ্ন হোক, ডেলিভারির তারিখ হোক বা রিফান্ড — আমাদের টিম দিনরাত আপনার পাশে আছে।',
    contactUs: 'যোগাযোগ করুন',
    contactItems: [
      { icon: Phone, label: 'ফোন', value: '০৯৬৪২ ৯২২ ৯২২', meta: '২৪/৭', href: 'tel:09642922922' },
      { icon: Mail, label: 'ইমেইল', value: 'contact@ghorerbazar.com', meta: 'একদিনের মধ্যে উত্তর', href: 'mailto:contact@ghorerbazar.com' },
      { icon: MessageCircle, label: 'লাইভ চ্যাট', value: 'উপলব্ধ', meta: '২৪/৭', href: '#' },
      { icon: Send, label: 'হোয়াটসঅ্যাপ', value: '+৮৮০১৩২১২০৮৯৪০', meta: 'যেকোনো সময় মেসেজ করুন', href: 'https://wa.me/8801321208940' },
    ],
    faqHeading: 'হেল্প এবং সাধারণ জিজ্ঞাসা',
    faqSub: 'অর্ডার, ডেলিভারি, রিটার্ন এবং আরও অনেক বিষয়ে সাধারণ প্রশ্নগুলোর উত্তর খুঁজুন।',
    cards: [
      {
        icon: Package,
        title: 'অর্ডার ট্র্যাকিং',
        desc: 'আপনার ফোন নম্বর বা অর্ডার আইডি ব্যবহার করে যেকোনো সময় অর্ডারের বর্তমান অবস্থা দেখুন।',
        link: '/',
      },
      {
        icon: Truck,
        title: 'শিপিং ও ডেলিভারি',
        desc: 'ডেলিভারির সময়সীমা, শিপিং চার্জ এবং ডেলিভারি এলাকা সম্পর্কে জানুন।',
        link: '/shippingdelivery',
      },
      {
        icon: RotateCcw,
        title: 'রিটার্ন ও রিফান্ড পলিসি',
        desc: 'কীভাবে পণ্য ফেরত দিবেন এবং রিফান্ড প্রক্রিয়া কীভাবে কাজ করে তা বুঝে নিন।',
        link: '/refund',
      },
      {
        icon: CreditCard,
        title: 'পেমেন্ট সম্পর্কিত তথ্য',
        desc: 'ক্যাশ অন ডেলিভারি, কার্ড এবং মোবাইল পেমেন্টসহ সমস্ত পেমেন্ট মাধ্যমগুলো দেখুন।',
        link: '/contactus',
      },
    ],
    cta: 'আরও জানুন',
  },
};

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'bn', label: 'BN', name: 'বাংলা' },
];

function LanguageDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-emerald-800/15 bg-white px-3.5 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-800/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
      >
        <Globe className="h-4 w-4 text-emerald-700" strokeWidth={2} />
        {current.label}
        <ChevronDown
          className={`h-3.5 w-3.5 text-emerald-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang === l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3.5 py-2 text-sm transition ${
                  lang === l.code
                    ? 'bg-emerald-50 font-semibold text-emerald-800'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>{l.name}</span>
                <span className="text-xs tracking-wide text-stone-400">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SupportCenterPage() {
  const [lang, setLang] = useState('en');
  const t = CONTENT[lang];

  return (
    <main className="min-h-screen">
      {/* Header band */}
      <section className="relative overflow-hidden border-b border-emerald-900/10 bg-gradient-to-b from-emerald-900 to-emerald-800 px-6 py-16 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-100">
            {t.eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
            {t.intro}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        {/* Contact Us */}
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">{t.contactUs}</h2>
            <LanguageDropdown lang={lang} setLang={setLang} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {t.contactItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white dark:bg-gray-800 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-500 dark:text-orange-600">{item.label}</span>
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        {item.meta}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-base font-semibold text-stone-900 dark:text-gray-200">
                      {item.value}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-14 sm:mt-16">
          <h2 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">{t.faqHeading}</h2>
          <p className="mt-2 max-w-2xl text-stone-500 dark:text-gray-300">{t.faqSub}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {t.cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white dark:bg-gray-800 p-6 shadow-sm transition hover:border-emerald-700/30 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900/5 dark:bg-gray-300 text-emerald-800">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-500 dark:text-gray-400">{card.desc}</p>
                  <Link href={card.link}>
                  <button
                    type="button"
                    className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-green-500 transition cursor-pointer group-hover:gap-2"
                  >
                    {t.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}