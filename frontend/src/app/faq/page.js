'use client';

import { useState, useRef, useEffect } from 'react';
import { Hind_Siliguri, Noto_Serif_Bengali } from 'next/font/google';

const body = Hind_Siliguri({
  subsets: ['latin', 'bengali'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const display = Noto_Serif_Bengali({
  subsets: ['latin', 'bengali'],
  weight: ['600', '700'],
  variable: '--font-display',
});

// ---------- Content (EN / BN) ----------

const CONTENT = {
  en: {
    eyebrow: 'Support',
    heading: 'Frequently Asked Questions (FAQ)',
    subheading:
      "Everything you need to know about ordering, delivery and payments. Can't find your answer? Reach out — we're happy to help.",
    contactLabel: 'Contact Us',
    faqs: [
      {
        q: 'How can I place an order?',
        type: 'text',
        a: 'You can order through our website, WhatsApp, Facebook or phone call — whichever is most convenient for you.',
      },
      {
        q: 'How do I track my order?',
        type: 'text',
        a: 'Visit our Order Tracking page and enter your phone number. You can also message us on WhatsApp, Facebook, or Live Chat to check your order status.',
      },
      {
        q: 'What are the available payment methods?',
        type: 'text',
        a: 'We accept Visa, MasterCard, bKash, Nagad, and Cash on Delivery (COD). Partial payment is also available, and pre-payment is required for pre-order items.',
      },
      {
        q: 'What are the delivery charges?',
        type: 'list',
        items: [
          { label: 'Inside Dhaka City', value: '70 TK' },
          { label: 'Outside Dhaka', value: '130 TK' },
          { label: 'Express Delivery (Dhaka only)', value: '100 TK' },
        ],
      },
      {
        q: 'How long does delivery take?',
        type: 'text',
        a: 'Regular delivery times vary by location. Express delivery within Dhaka ensures faster arrival.',
      },
      {
        q: 'Do you offer express delivery?',
        type: 'text',
        a: 'Yes, express delivery is available only in Dhaka city.',
      },
      {
        q: 'Can I change or cancel my order after placing it?',
        type: 'text',
        a: 'If your order has not been dispatched yet, you may request a change or cancellation by contacting our support team.',
      },
      {
        q: 'What should I do if I receive a damaged or wrong product?',
        type: 'text',
        a: "Contact our support team immediately via phone, WhatsApp, Facebook, or Live Chat. We'll assist you with replacement or return.",
      },
      {
        q: 'Do you offer returns or refunds?',
        type: 'text',
        a: 'Yes, depending on product type and condition. Please refer to our Return & Refund Policy or contact support.',
      },
      {
        q: 'How do I contact customer support?',
        type: 'contact',
        items: ['Phone call', 'WhatsApp', 'Facebook Messenger'],
      },
    ],
  },
  bn: {
    eyebrow: 'সহায়তা',
    heading: 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)',
    subheading:
      'অর্ডার, ডেলিভারি ও পেমেন্ট সম্পর্কে যা জানা দরকার, সবকিছু এখানে আছে। উত্তর খুঁজে না পেলে যোগাযোগ করুন — আমরা সাহায্য করতে প্রস্তুত।',
    contactLabel: 'যোগাযোগ করুন',
    faqs: [
      {
        q: 'আমি কীভাবে অর্ডার করতে পারি?',
        type: 'text',
        a: 'আপনি আমাদের ওয়েবসাইট, হোয়াটসঅ্যাপ, ফেসবুক বা ফোন কল মাধ্যমে অর্ডার করতে পারেন—যেকোনো মাধ্যম যা আপনার জন্য সুবিধাজনক।',
      },
      {
        q: 'আমি কীভাবে আমার অর্ডার ট্র্যাক করব?',
        type: 'text',
        a: 'আমাদের অর্ডার ট্র্যাকিং পেইজে ভিজিট করুন এবং ফোন নম্বর দিন। এছাড়াও আপনার অর্ডারের বর্তমান অবস্থা জানতে আপনি আমাদের হোয়াটসঅ্যাপ, ফেসবুক বা লাইভ চ্যাটেও মেসেজ করতে পারেন।',
      },
      {
        q: 'পেমেন্টের মাধ্যমগুলো কী কী?',
        type: 'text',
        a: 'আমরা ভিসা (Visa), মাস্টারকার্ড (MasterCard), বিকাশ, নগদ এবং ক্যাশ অন ডেলিভারি (COD) গ্রহণ করে থাকি। আংশিক পেমেন্টের সুবিধাও রয়েছে, এবং প্রি-অর্ডার করা আইটেমগুলোর জন্য অগ্রিম পেমেন্ট (প্রি-পেমেন্ট) করা আবশ্যক।',
      },
      {
        q: 'ডেলিভারি চার্জ কত?',
        type: 'list',
        items: [
          { label: 'ঢাকা শহরের ভেতরে', value: '৭০ টাকা' },
          { label: 'ঢাকার বাইরে', value: '১৩০ টাকা' },
          { label: 'এক্সপ্রেস ডেলিভারি (শুধুমাত্র ঢাকা)', value: '১০০ টাকা' },
        ],
      },
      {
        q: 'ডেলিভারি হতে কত সময় লাগে?',
        type: 'text',
        a: 'সাধারণ ডেলিভারির সময় লোকেশনের ওপর নির্ভর করে ভিন্ন হয়ে থাকে। তবে ঢাকার ভেতরে এক্সপ্রেস ডেলিভারির মাধ্যমে দ্রুত পার্সেল পৌঁছানো নিশ্চিত করা হয়।',
      },
      {
        q: 'আপনারা কি এক্সপ্রেস ডেলিভারি দিয়ে থাকেন?',
        type: 'text',
        a: 'হ্যাঁ, এক্সপ্রেস ডেলিভারি শুধুমাত্র ঢাকা শহরের ভেতরেই দেওয়া হয়।',
      },
      {
        q: 'অর্ডার করার পর কি আমি আমার অর্ডার পরিবর্তন বা বাতিল করতে পারব?',
        type: 'text',
        a: 'যদি আপনার অর্ডারটি এখনো কুরিয়ারে হস্তান্তর করা না হয়ে থাকে, তবে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করে আপনি অর্ডার পরিবর্তন বা বাতিল করার অনুরোধ করতে পারেন।',
      },
      {
        q: 'আমি যদি কোনো ড্যামেজ (ক্ষতিগ্রস্ত) বা ভুল পণ্য পাই, তবে আমার কী করা উচিত?',
        type: 'text',
        a: 'দ্রুত আমাদের সাপোর্ট টিমের সাথে ফোন, হোয়াটসঅ্যাপ, ফেসবুক বা লাইভ চ্যাটের মাধ্যমে যোগাযোগ করুন। আমরা আপনাকে পণ্য পরিবর্তন (রিপ্লেসমেন্ট) বা রিটার্ন করতে সহায়তা করব।',
      },
      {
        q: 'আপনারা কি রিটার্ন বা রিফান্ডের (টাকা ফেরত) সুবিধা দেন?',
        type: 'text',
        a: "হ্যাঁ, তবে তা পণ্যের ধরন এবং অবস্থার ওপর নির্ভর করে। এ বিষয়ে বিস্তারিত জানতে অনুগ্রহ করে আমাদের 'রিটার্ন ও রিফান্ড পলিসি' দেখুন অথবা আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।",
      },
      {
        q: 'কাস্টমার সাপোর্টের সাথে আমি কীভাবে যোগাযোগ করব?',
        type: 'contact',
        items: ['ফোন কল', 'হোয়াটসঅ্যাপ', 'ফেসবুক মেসেঞ্জার'],
      },
    ],
  },
};

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'bn', label: 'BN' },
];

// ---------- Small icon set (inline, no extra deps) ----------

function IconChevron({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none"
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.75 10h14.5M10 2.75c2.2 2 3.3 4.6 3.3 7.25s-1.1 5.25-3.3 7.25c-2.2-2-3.3-4.6-3.3-7.25S7.8 4.75 10 2.75z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5.5 4h3l1.5 4-2 1.5a11 11 0 005.5 5.5L15 13l4 1.5v3a1.5 1.5 0 01-1.6 1.5A15 15 0 014 6.6 1.5 1.5 0 015.5 4z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 12c0-4.4 3.8-8 8.5-8S21 7.6 21 12s-3.8 8-8.5 8c-1 0-2-.15-2.9-.43L5 21l1.2-3.6C4.75 16 4 14.1 4 12z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMessenger() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 3.5C6.9 3.5 3 7.1 3 12c0 2.7 1.2 5.1 3.2 6.7V21l3-1.6c.9.25 1.8.4 2.8.4 5.1 0 9-3.6 9-8.5S17.1 3.5 12 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 12.8l2.9-3 2.2 2.2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CONTACT_ICONS = [IconPhone, IconChat, IconMessenger];

// ---------- Decorative "string of dates" divider ----------

function DateStrand() {
  const dots = new Array(11).fill(0);
  return (
    <div className="relative mx-auto mt-6 h-3 w-52 sm:w-64">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#C9A15A]/40" />
      <div className="relative flex h-full items-center justify-between">
        {dots.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i % 3 === 0 ? 'bg-[#7A2436]' : 'bg-[#C9A15A]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Language dropdown ----------

function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full cursor-pointer border border-[#7A2436]/20 bg-white px-3.5 py-2 text-sm font-medium text-[#3B1220] shadow-sm transition-colors hover:border-[#7A2436]/40"
      >
        <IconGlobe />
        {current.label}
        <IconChevron open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-28 overflow-hidden rounded-xl border border-[#7A2436]/15 bg-white shadow-lg"
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
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-sm transition-colors ${
                  lang === l.code
                    ? 'bg-[#FBF1E4] font-semibold text-[#7A2436]'
                    : 'text-[#3B1220]/80 hover:bg-[#FBF1E4]/70'
                }`}
              >
                {l.label}
                {lang === l.code && <span className="h-1.5 w-1.5 rounded-full bg-[#C9A15A]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Accordion item ----------

function FaqItem({ item, index, openIndex, setOpenIndex, lang }) {
  const isOpen = openIndex === index;
  const num = String(index + 1).padStart(2, '0');

  return (
    <div className="border-b border-[#E7DCC8] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpenIndex(isOpen ? -1 : index)}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-4 py-5 text-left sm:gap-5 cursor-pointer "
      >
        <span
          className={`mt-0.5 shrink-0 font-[family-name:var(--font-display)] text-sm font-semibold tabular-nums transition-colors ${
            isOpen ? 'text-[#7A2436] dark:text-red-700' : 'text-[#C9A15A]'
          }`}
        >
          {num}
        </span>
        <span className="flex-1 font-[family-name:var(--font-display)] text-base font-bold leading-snug text-[#241C16] dark:text-black sm:text-lg">
          {item.q}
        </span>
        <span className={isOpen ? 'text-[#7A2436]' : 'text-[#B8A88F]'}>
          <IconChevron open={isOpen} />
        </span>
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="pb-6 pl-[2.35rem] pr-6 text-[15px] leading-relaxed text-[#5C5142] dark:text-black sm:pl-[3.1rem]">
            {item.type === 'text' && <p>{item.a}</p>}

            {item.type === 'list' && (
              <ul className="space-y-2.5">
                {item.items.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-4 rounded-lg bg-[#FBF6EE] px-4 py-2.5"
                  >
                    <span className="text-[#3B1220] dark:text-black">{row.label}</span>
                    <span className="font-[family-name:var(--font-display)] font-semibold text-[#7A2436] dark:text-black">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {item.type === 'contact' && (
              <ul className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                {item.items.map((label, i) => {
                  const Icon = CONTACT_ICONS[i];
                  return (
                    <li
                      key={label}
                      className="flex flex-1 items-center gap-2.5 rounded-lg border border-[#E7DCC8] bg-white px-4 py-3 cursor-pointer text-[#3B1220] dark:text-black"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF1E4] text-[#7A2436] dark:text-black">
                        <Icon />
                      </span>
                      <span className="text-sm font-medium">{label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Page ----------

export default function FaqPage() {
  const [lang, setLang] = useState('en');
  const [openIndex, setOpenIndex] = useState(0);
  const t = CONTENT[lang];

  return (
    <main
      className={`${body.variable} ${display.variable} min-h-screen font-[family-name:var(--font-body)]`}
    >
      {/* Utility bar: Contact Us + language dropdown */}
      <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-6 pt-6 sm:px-8">
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-3xl px-6 pb-10 pt-8 text-center sm:px-8">
        <span className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A15A]">
          {t.eyebrow}
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#3B1220] dark:text-orange-500 sm:text-4xl">
          {t.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#6B5D4F] dark:text-orange-800">
          {t.subheading}
        </p>
        <DateStrand />
      </header>

      {/* FAQ list */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-8">
        <div className="rounded-2xl border border-[#E7DCC8] bg-white/60 px-4 shadow-sm sm:px-6">
          {t.faqs.map((item, i) => (
            <FaqItem
              key={item.q}
              item={item}
              index={i}
              openIndex={openIndex}
              setOpenIndex={setOpenIndex}
              lang={lang}
            />
          ))}
        </div>
      </section>
    </main>
  );
}