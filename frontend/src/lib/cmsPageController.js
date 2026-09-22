import { useEffect, useState } from 'react';
import { getSitePage } from '@/lib/api';

export const CMS_PAGE_SLUGS = {
  '/aboutus': 'aboutus',
  '/contactus': 'contactus',
  '/privacy': 'privacy',
  '/compamyinformation': 'compamyinformation',
  '/terms': 'terms',
  '/refund': 'refund',
  '/supportcenter': 'supportcenter',
  '/howtoorder': 'howtoorder',
  '/shippingdelivery': 'shippingdelivery',
  '/payment': 'payment',
  '/faq': 'faq',
};

export function useCmsPage(pathname) {
  const slug = CMS_PAGE_SLUGS[pathname];
  const [page, setPage] = useState(null);

  useEffect(() => {
    let active = true;
    if (!slug) return undefined;

    getSitePage(slug)
      .then((data) => {
        if (active) setPage(data?.content?.trim() ? data : null);
      })
      .catch(() => {
        if (active) setPage(null);
      });

    return () => { active = false; };
  }, [slug]);

  return page;
}
