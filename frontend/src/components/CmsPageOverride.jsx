'use client';

import { usePathname } from 'next/navigation';
import { useCmsPage } from '@/lib/cmsPageController';

export default function CmsPageOverride({ children }) {
  const pathname = usePathname();
  const page = useCmsPage(pathname);

  return (
    <>
      {children}
      {page?.content?.trim() && (
        <section className="border-t border-gray-200 bg-gray-50 px-4 py-10 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white sm:px-8">
          <article className="mx-auto max-w-4xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Updated Information</p>
            <h2 className="text-2xl font-bold sm:text-3xl">{page.title}</h2>
            <div className="mt-5 space-y-6 text-base leading-8 text-gray-600 dark:text-gray-300">
              {(page.sections?.length ? page.sections : [{ content: page.content }]).map((section, index) => (
                <div key={section.id || index}>
                  {section.type === 'faq' ? (
                    <><h3 className="font-semibold text-gray-900 dark:text-white">{section.question}</h3><p className="mt-1 whitespace-pre-line">{section.answer}</p></>
                  ) : (
                    <><h3 className="font-semibold text-gray-900 dark:text-white">{section.title || section.label}</h3><p className="mt-1 whitespace-pre-line">{section.content}</p></>
                  )}
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </>
  );
}
