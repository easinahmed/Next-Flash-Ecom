'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const content = {
  en: {
    heading: 'Terms And Conditions',
    intro: 'Our Customer Care Team is Always Here to Assist You.',
    description:
      'For any questions or issues related to orders, delivery, returns, refunds, or anything else, you can reach us through the following channels:',
    call: 'Call',
    callValue: '09666200300 (24/7)',
    whatsapp: 'WhatsApp',
    whatsappValue: '+8801790535599',
    emailTitle: 'Email',
    generalContact: 'General Contact',
    support: 'Support',
    hoursTitle: 'Service Hours',
    hoursValue: 'Available 24/7',
    footer:
      'Our customer care team is always ready to provide fast and reliable support for any issue or inquiry you may have.',
  },
  bn: {
    heading: 'শর্তাবলী',
    intro: 'আমাদের কাস্টমার কেয়ার টিম আপনাকে সহায়তা করতে সর্বদা প্রস্তুত।',
    description:
      'অর্ডার, ডেলিভারি, রিটার্ন, রিফান্ড বা অন্য যেকোনো বিষয়ে আপনার কোনো প্রশ্ন বা সমস্যা থাকলে, নিচের মাধ্যমগুলোর সাহায্যে আমাদের সাথে যোগাযোগ করতে পারেন:',
    call: 'কল',
    callValue: '09666200300 (২৪/৭)',
    whatsapp: 'হোয়াটসঅ্যাপ',
    whatsappValue: '+8801790535599',
    emailTitle: 'ইমেইল',
    generalContact: 'সাধারণ যোগাযোগ',
    support: 'সাপোর্ট',
    hoursTitle: 'সেবার সময়সূচী',
    hoursValue: '২৪/৭ (সপ্তাহের ৭ দিন, ২৪ ঘণ্টা)',
    footer:
      'আপনার যেকোনো সমস্যা বা জিজ্ঞাসায় দ্রুত ও নির্ভরযোগ্য সহায়তা প্রদানের জন্য আমাদের কাস্টমার কেয়ার টিম সর্বদা প্রস্তুত রয়েছে।',
  },
};

export default function ContactUsPolicyPage() {
  const [lang, setLang] = useState('en');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const t = content[lang];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      {/* Header row: H1 + language dropdown */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
          {t.heading}
        </h1>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            {lang === 'en' ? 'EN' : 'BN'}
            <ChevronDown
              size={16}
              className={`transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => {
                  setLang('en');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                  lang === 'en' ? 'font-semibold text-emerald-600' : 'text-gray-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  setLang('bn');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                  lang === 'bn' ? 'font-semibold text-emerald-600' : 'text-gray-700'
                }`}
              >
                BN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p className="font-medium text-black dark:text-white">{t.intro}</p>
        <p>{t.description}</p>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-2">
            <span>📞</span>
            <p>
              <span className="font-semibold text-black dark:text-white  ">{t.call}:</span> <span className='text-gray-900 dark:text-gray-300'>{t.callValue}</span> 
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span>💬</span>
            <p>
              <span className="font-semibold text-black dark:text-white ">{t.whatsapp}:</span>{' '}
              <span className='text-gray-900 dark:text-gray-300'>{t.whatsappValue}</span> 
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span>📧</span>
            <div>
              <p className="font-semibold text-black dark:text-white ">{t.emailTitle}</p>
              <p className=' text-gray-900 dark:text-gray-300'>{t.generalContact}: <span className=' text-blue-600'>contact@flashcomfort.com</span> </p>
              <p className=' text-gray-900 dark:text-gray-300'>{t.support}: <span className=' text-blue-600'>support@flashcomfort.com</span> </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span>🕒</span>
            <p>
              <span className="font-semibold text-black dark:text-white ">{t.hoursTitle}:</span>{' '}
              <span className='text-gray-900 dark:text-gray-300' >{t.hoursValue}</span> 
            </p>
          </div>
        </div>

        <p>{t.footer}</p>
      </div>
    </div>
  );
}