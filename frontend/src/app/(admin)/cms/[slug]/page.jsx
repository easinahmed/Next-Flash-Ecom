'use client';

import { use } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import CmsSectionEditor, { CMS_PAGE_OPTIONS } from '@/components/CmsSectionEditor';

export default function CmsPageEditor({ params }) {
  const { slug } = use(params);
  const page = CMS_PAGE_OPTIONS.find(([key]) => key === slug);

  if (!page) {
    return <AdminLayout activeSection="CMS / Banners"><div className="rounded-2xl bg-white p-8 text-center">CMS page not found.</div></AdminLayout>;
  }

  return (
    <AdminLayout activeSection="CMS / Banners">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">CMS editor</p><h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{page[1]}</h1><p className="mt-1 text-sm text-gray-500">Edit the exact sections shown on this page.</p></div>
        <Link href="/cms" className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200">Back to CMS</Link>
      </div>
      <CmsSectionEditor slug={page[0]} label={page[1]} />
    </AdminLayout>
  );
}
