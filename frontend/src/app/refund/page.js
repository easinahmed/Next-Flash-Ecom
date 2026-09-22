'use client';

import { useState } from 'react';

const content = {
  EN: {
    intro: 'We want our customers to be completely satisfied with their purchase.',
    points: [
      { text: 'Products can be returned or exchanged if they are damaged, defective, or the wrong product was delivered.' },
      { text: 'If any leather product develops a manufacturing or quality-related problem within 3 months of purchase, we will replace the product with a new one.', emphasis: true },
      { text: 'The product must be unused or in reasonable condition, except where the issue is caused by a manufacturing defect.' },
      { text: 'Customers must contact us within the applicable return or replacement period and provide proof of purchase.' },
      { text: 'Refunds, where applicable, will be processed according to our refund terms and may exclude delivery charges.' },
      { text: 'Damage caused by improper use, accidents, water exposure, or normal wear and tear may not be eligible for replacement.' },
      { text: 'We reserve the right to inspect the product before approving a return, refund, or replacement.' },
    ],
  },
  BN: {
    intro: 'আমরা চাই আমাদের প্রতিটি কাস্টমার কেনাকাটায় সম্পূর্ণ সন্তুষ্ট থাকুন।',
    points: [
      { text: 'পণ্য ত্রুটিপূর্ণ, ক্ষতিগ্রস্ত অথবা ভুল পণ্য ডেলিভারি হলে রিটার্ন বা এক্সচেঞ্জ করা যাবে।' },
      { text: 'কোনো চামড়ার পণ্য কেনার পর ৩ মাসের মধ্যে উৎপাদনগত বা মানগত কোনো সমস্যা দেখা দিলে আমরা পণ্যটি পরিবর্তন করে নতুন পণ্য দিয়ে দেব।', emphasis: true },
      { text: 'উৎপাদনগত ত্রুটি ছাড়া অন্য কোনো কারণে পণ্য ক্ষতিগ্রস্ত হলে রিটার্ন বা রিপ্লেসমেন্ট প্রযোজ্য নাও হতে পারে।' },
      { text: 'রিটার্ন বা রিপ্লেসমেন্টের জন্য নির্ধারিত সময়ের মধ্যে আমাদের সাথে যোগাযোগ করতে হবে এবং ক্রয়ের প্রমাণ দিতে হবে।' },
      { text: 'প্রযোজ্য ক্ষেত্রে রিফান্ড আমাদের নির্ধারিত নিয়ম অনুযায়ী প্রদান করা হবে এবং ডেলিভারি চার্জ রিফান্ডের অন্তর্ভুক্ত নাও হতে পারে।' },
      { text: 'ভুল ব্যবহার, দুর্ঘটনা, পানির সংস্পর্শ অথবা স্বাভাবিক ব্যবহারের কারণে পণ্যের ক্ষয়ক্ষতি হলে ৩ মাসের রিপ্লেসমেন্ট সুবিধা প্রযোজ্য হবে না।' },
      { text: 'রিটার্ন, রিফান্ড বা রিপ্লেসমেন্ট অনুমোদনের আগে আমরা পণ্যটি যাচাই করার অধিকার রাখি।' },
    ],
  },
};

const heading = {
  EN: 'Refund & Return Policy',
  BN: 'রিফান্ড ও রিটার্ন পলিসি',
};

export default function RefundReturnPolicyPage() {
  const [lang, setLang] = useState('EN');
  const [open, setOpen] = useState(false);

  const data = content[lang];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-14 sm:px-8">
        {/* Header row: H1 + language dropdown */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
              {heading[lang]}
            </h1>
          </div>

          {/* Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition cursor-pointer hover:border-gray-400 hover:bg-gray-50"
            >
              {lang}
              <svg
                className={`h-4 w-4 text-gray-500  dark:text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <>
                {/* Click-away overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {['EN', 'BN'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setLang(code);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm transition hover:bg-gray-50 cursor-pointer ${
                        lang === code ? 'font-semibold text-emerald-600' : 'text-gray-700'
                      }`}
                    >
                      {code === 'EN' ? 'English (EN)' : 'বাংলা (BN)'}
                      {lang === code && (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Policy content */}
        <div
          className="mt-8 space-y-5 cursor-pointer"
          dir={lang === 'BN' ? 'ltr' : 'ltr'}
          lang={lang === 'BN' ? 'bn' : 'en'}
        >
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.intro}</p>

          <ul className="space-y-4">
            {data.points.map((point, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {point.emphasis ? (
                  <p className="italic font-medium text-black dark:text-white leading-relaxed">
                    {point.text}
                  </p>
                ) : (
                  <p className="text-gray-700 dark:text-gray-400 leading-relaxed">{point.text}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}