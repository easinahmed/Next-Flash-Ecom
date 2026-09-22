'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const content = {
  en: {
    label: 'EN',
    intro:
      'By using our website or purchasing our products/services, you agree to follow our Terms and Conditions.',
    items: [
      {
        title: 'Product Information',
        body: 'We try to provide accurate product descriptions, images, prices, and availability. However, slight variations may occur.',
      },
      {
        title: 'Orders',
        body: 'An order is considered confirmed after successful verification/confirmation by our team.',
      },
      {
        title: 'Payment',
        body: 'Customers must provide accurate payment information and complete the required payment according to the selected method.',
      },
      {
        title: 'Delivery',
        body: 'Delivery time may vary depending on location, weather, holidays, or other unexpected circumstances.',
      },
      {
        title: 'Return & Exchange',
        body: 'Returns or exchanges are accepted only according to our return and exchange policy.',
      },
      {
        title: 'Cancellation',
        body: 'We reserve the right to cancel or reject an order due to incorrect information, product unavailability, or other valid reasons.',
      },
      {
        title: 'Refusal to Accept Delivery',
        body: 'If, for any reason, you do not receive the product from the delivery man after confirming the order 100%, you will be required to pay the delivery charge and return the product. If you do not receive his call, or if you cause any financial loss to the company, we reserve the right to take legal action against you.',
      },
      {
        title: 'Customer Responsibility',
        body: 'Customers are responsible for providing correct name, phone number, address, and other required information.',
      },
      {
        title: 'Privacy',
        body: 'Customer information will be handled according to our Privacy Policy and will not be misused.',
      },
      {
        title: 'Policy Changes',
        body: 'We reserve the right to update or change these Terms and Conditions when necessary.',
      },
    ],
    footer:
      'By continuing to use our services, you acknowledge that you have read and agreed to these Terms and Conditions.',
  },
  bn: {
    label: 'BN',
    intro:
      'আমাদের ওয়েবসাইট ব্যবহার বা পণ্য/সেবা ক্রয় করার মাধ্যমে আপনি আমাদের নির্ধারিত শর্তাবলি মেনে চলতে সম্মত হচ্ছেন।',
    items: [
      {
        title: 'পণ্যের তথ্য',
        body: 'আমরা পণ্যের বিবরণ, ছবি, মূল্য ও স্টক সম্পর্কে সঠিক তথ্য দেওয়ার চেষ্টা করি। তবে সামান্য পার্থক্য হতে পারে।',
      },
      {
        title: 'অর্ডার',
        body: 'আমাদের টিম কর্তৃক যাচাই/নিশ্চিত করার পর একটি অর্ডার নিশ্চিত হিসেবে গণ্য হবে।',
      },
      {
        title: 'পেমেন্ট',
        body: 'গ্রাহককে সঠিক পেমেন্ট তথ্য প্রদান করতে হবে এবং নির্বাচিত পেমেন্ট পদ্ধতি অনুযায়ী প্রয়োজনীয় অর্থ পরিশোধ করতে হবে।',
      },
      {
        title: 'ডেলিভারি',
        body: 'এলাকা, আবহাওয়া, সরকারি ছুটি বা অনাকাঙ্ক্ষিত পরিস্থিতির কারণে ডেলিভারি সময় কিছুটা পরিবর্তিত হতে পারে।',
      },
      {
        title: 'রিটার্ন ও এক্সচেঞ্জ',
        body: 'আমাদের নির্ধারিত Return & Exchange Policy অনুযায়ী পণ্য ফেরত বা পরিবর্তন করা যাবে।',
      },
      {
        title: 'অর্ডার বাতিল',
        body: 'ভুল তথ্য, পণ্য স্টকে না থাকা বা অন্য কোনো যুক্তিসঙ্গত কারণে আমরা অর্ডার বাতিল বা প্রত্যাখ্যান করার অধিকার রাখি।',
      },
      {
        title: 'ডেলিভারি গ্রহণ না করা',
        body: 'কোনো কারণে অর্ডার ১০০% নিশ্চিত করার পরেও যদি আপনি ডেলিভারিম্যানের থেকে পণ্য গ্রহণ না করেন, তাহলে আপনাকে ডেলিভারি চার্জ পরিশোধ করে পণ্যটি ফেরত দিতে হবে। এছাড়া যদি আপনি ডেলিভারিম্যানের ফোন কল রিসিভ না করেন, অথবা আপনার কারণে কোম্পানির কোনো আর্থিক ক্ষতি হয়, সেক্ষেত্রে আমরা আপনার বিরুদ্ধে আইনি ব্যবস্থা নেওয়ার অধিকার রাখি।',
      },
      {
        title: 'গ্রাহকের দায়িত্ব',
        body: 'গ্রাহককে সঠিক নাম, মোবাইল নম্বর, ঠিকানা এবং প্রয়োজনীয় অন্যান্য তথ্য প্রদান করতে হবে।',
      },
      {
        title: 'গোপনীয়তা',
        body: 'গ্রাহকের তথ্য আমাদের Privacy Policy অনুযায়ী সংরক্ষণ ও ব্যবহার করা হবে এবং কোনোভাবেই অপব্যবহার করা হবে না।',
      },
      {
        title: 'শর্তাবলি পরিবর্তন',
        body: 'প্রয়োজন অনুযায়ী আমরা যেকোনো সময় এই Terms and Conditions পরিবর্তন বা আপডেট করার অধিকার রাখি।',
      },
    ],
    footer:
      'আমাদের ওয়েবসাইট বা সেবা ব্যবহার চালিয়ে যাওয়ার মাধ্যমে আপনি নিশ্চিত করছেন যে, আপনি এই শর্তাবলি পড়েছেন এবং এতে সম্মত হয়েছেন।',
  },
};

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'bn', label: 'BN' },
];

export default function TermsAndConditionsPage() {
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const t = content[lang];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
          Terms and Conditions
        </h1>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {content[lang].label}
            <ChevronDown
              size={16}
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <ul
              role="listbox"
              className="absolute right-0 mt-1 w-24 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-10"
            >
              {languages.map(({ code, label }) => (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => {
                      setLang(code);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      lang === code
                        ? 'bg-gray-100 font-semibold text-black'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">{t.intro}</p>

      <ol className="space-y-6">
        {t.items.map((item, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="font-semibold text-black dark:text-white shrink-0">
              {idx + 1}.
            </span>
            <div>
              <span className="font-semibold text-black dark:text-white">
                {item.title}:
              </span>{' '}
              <span className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.body}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-gray-500 dark:text-white border-t border-gray-200 pt-6 leading-relaxed">
        {t.footer}
      </p>
    </div>
  );
}