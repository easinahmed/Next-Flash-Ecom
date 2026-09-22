'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CONTENT = {
  en: {
    langLabel: 'EN',
    sections: [
      {
        title: '1. Information We Collect',
        body: 'We may collect information such as your name, phone number, email address, delivery address, payment details, and other information you provide while using our services.',
      },
      {
        title: '2. How We Use Your Information',
        body: 'Your information may be used to:',
        list: [
          'Process and deliver your orders',
          'Communicate with you about your orders or services',
          'Improve our website, products, and customer service',
          'Provide offers, promotions, or updates when permitted',
        ],
      },
      {
        title: '3. Information Protection',
        body: 'We take reasonable security measures to protect your personal information from unauthorized access, misuse, alteration, or disclosure.',
      },
      {
        title: '4. Sharing of Information',
        body: 'We do not sell or rent your personal information. We may share necessary information with trusted service providers, such as delivery or payment partners, only when required to provide our services.',
      },
      {
        title: '5. Cookies',
        body: 'Our website may use cookies and similar technologies to improve your browsing experience, understand website usage, and provide better services.',
      },
      {
        title: '6. Third-Party Services',
        body: 'Our website may contain links or integrations with third-party services. We are not responsible for the privacy practices of those external services.',
      },
      {
        title: '7. Your Rights',
        body: 'You may have the right to access, correct, or request deletion of your personal information, subject to applicable laws and legitimate business requirements.',
      },
      {
        title: '8. Policy Updates',
        body: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.',
      },
      {
        title: '9. Contact Us',
        body: 'If you have any questions or concerns about this Privacy Policy or your personal information, please contact us through our official contact channels.',
      },
    ],
    intro:
      'We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website or services.',
    introTitle: 'Privacy Policy — Summary',
  },
  bn: {
    langLabel: 'BN',
    sections: [
      {
        title: '১. আমরা যে তথ্য সংগ্রহ করি',
        body: 'আপনার নাম, ফোন নম্বর, ইমেইল ঠিকানা, ডেলিভারি ঠিকানা, পেমেন্ট সংক্রান্ত তথ্য এবং আপনি আমাদের সেবা ব্যবহারের সময় যে অন্যান্য তথ্য প্রদান করেন, সেগুলো আমরা সংগ্রহ করতে পারি।',
      },
      {
        title: '২. আপনার তথ্য কীভাবে ব্যবহার করা হয়',
        body: 'আপনার তথ্য ব্যবহার করা হতে পারে:',
        list: [
          'অর্ডার গ্রহণ ও ডেলিভারি সম্পন্ন করতে',
          'অর্ডার বা সেবা সম্পর্কে আপনার সঙ্গে যোগাযোগ করতে',
          'আমাদের ওয়েবসাইট, পণ্য ও কাস্টমার সার্ভিস উন্নত করতে',
          'অনুমোদিত ক্ষেত্রে অফার, প্রচারণা ও আপডেট জানাতে',
        ],
      },
      {
        title: '৩. তথ্যের নিরাপত্তা',
        body: 'আপনার ব্যক্তিগত তথ্যকে অননুমোদিত ব্যবহার, পরিবর্তন, প্রকাশ বা অ্যাক্সেস থেকে রক্ষা করার জন্য আমরা যুক্তিসঙ্গত নিরাপত্তা ব্যবস্থা গ্রহণ করি।',
      },
      {
        title: '৪. তথ্য শেয়ার করা',
        body: 'আমরা আপনার ব্যক্তিগত তথ্য বিক্রি বা ভাড়া দিই না। তবে সেবা প্রদানের প্রয়োজনে বিশ্বস্ত ডেলিভারি, পেমেন্ট বা অন্যান্য সার্ভিস পার্টনারের সঙ্গে প্রয়োজনীয় তথ্য শেয়ার করা হতে পারে।',
      },
      {
        title: '৫. কুকিজ (Cookies)',
        body: 'আমাদের ওয়েবসাইট আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করা, ওয়েবসাইট ব্যবহারের তথ্য বোঝা এবং আরও ভালো সেবা দেওয়ার জন্য Cookies ও অনুরূপ প্রযুক্তি ব্যবহার করতে পারে।',
      },
      {
        title: '৬. তৃতীয় পক্ষের সেবা',
        body: 'আমাদের ওয়েবসাইটে তৃতীয় পক্ষের ওয়েবসাইট বা সেবার লিংক থাকতে পারে। এসব বাহ্যিক সেবার গোপনীয়তা নীতির জন্য আমরা দায়ী নই।',
      },
      {
        title: '৭. আপনার অধিকার',
        body: 'প্রযোজ্য আইন অনুযায়ী আপনি আপনার ব্যক্তিগত তথ্য অ্যাক্সেস, সংশোধন অথবা নির্দিষ্ট পরিস্থিতিতে মুছে ফেলার অনুরোধ করতে পারেন।',
      },
      {
        title: '৮. Privacy Policy পরিবর্তন',
        body: 'প্রয়োজন অনুযায়ী আমরা সময়ে সময়ে এই Privacy Policy পরিবর্তন করতে পারি। পরিবর্তন করা হলে এই পেজে নতুন কার্যকর তারিখসহ তা প্রকাশ করা হবে।',
      },
      {
        title: '৯. যোগাযোগ',
        body: 'এই Privacy Policy বা আপনার ব্যক্তিগত তথ্য সম্পর্কে কোনো প্রশ্ন বা অভিযোগ থাকলে আমাদের অফিসিয়াল যোগাযোগের মাধ্যমে আমাদের সঙ্গে যোগাযোগ করতে পারেন।',
      },
    ],
    intro:
      'আমরা আপনার গোপনীয়তাকে সম্মান করি এবং আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। আপনি আমাদের ওয়েবসাইট বা সেবা ব্যবহার করার সময় কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ ও সুরক্ষা করা হয়, এই Privacy Policy-তে তা ব্যাখ্যা করা হয়েছে।',
    introTitle: 'গোপনীয়তা নীতি — সারাংশ',
  },
};

export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(false);
  const data = CONTENT[lang];

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white ">
          Privacy Policy
        </h1>

        {/* Language dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer "
          >
            {data.langLabel}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden cursor-pointer z-10">
              {['en', 'bn'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLang(code);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition ${
                    lang === code ? 'font-semibold text-emerald-600' : 'text-gray-700'
                  }`}
                >
                  {CONTENT[code].langLabel}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-black dark:text-white mb-2">{data.introTitle}</h2>
      <p className="text-gray- dark:text-gray-300 leading-relaxed mb-8">{data.intro}</p>

      <div className="space-y-6">
        {data.sections.map((section, idx) => (
          <section key={idx}>
            <h3 className="text-base font-semibold text-black dark:text-white mb-1.5">
              {section.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.body}</p>
            {section.list && (
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600 dark:text-gray-300 ">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}