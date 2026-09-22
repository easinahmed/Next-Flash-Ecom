'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { deleteReview, getReviews, updateReviewStatus } from '@/lib/api';
import { Check, Filter, MessageSquare, RefreshCw, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await getReviews();
      setReviews(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getReviews()
      .then((response) => {
        if (active) setReviews(Array.isArray(response) ? response : []);
      })
      .catch((error) => {
        if (active) toast.error(error.message || 'Failed to load reviews');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesStatus = status === 'all' || review.status === status;
      const matchesSearch = !query || [review.reviewerName, review.productName, review.product?.name, review.comment]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [reviews, search, status]);

  const changeStatus = async (reviewId, nextStatus) => {
    try {
      const updated = await updateReviewStatus(reviewId, nextStatus);
      setReviews((current) => current.map((review) => (review._id === updated._id ? updated : review)));
      toast.success(`Review ${nextStatus}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await deleteReview(reviewId);
      setReviews((current) => current.filter((review) => review._id !== reviewId));
      toast.success('Review deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete review');
    }
  };

  return (
    <AdminLayout activeSection="Reviews" searchPlaceholder="Search reviews...">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"><MessageSquare className="h-6 w-6 text-indigo-600" /> Product Reviews</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Moderate customer feedback before it appears on product pages.</p>
        </div>
        <button onClick={loadReviews} className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product, customer, or text..." className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-600 dark:border-gray-800 dark:bg-[#161623] dark:text-white" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-[#161623]">
          <Filter className="ml-2 h-4 w-4 text-gray-400" />
          {STATUS_OPTIONS.map((option) => <button key={option} onClick={() => setStatus(option)} className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${status === option ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{option}</button>)}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-[#161623]">
        {loading ? <div className="p-12 text-center text-gray-500">Loading reviews...</div> : visibleReviews.length === 0 ? <div className="p-12 text-center text-gray-400"><MessageSquare className="mx-auto mb-2 h-10 w-10" /><p>No reviews found</p></div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/70 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-white/5"><tr><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Product</th><th className="px-5 py-4">Review</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {visibleReviews.map((review) => <tr key={review._id} className="align-top hover:bg-gray-50/50 dark:hover:bg-white/5">
                  <td className="px-5 py-4"><p className="font-semibold text-gray-900 dark:text-white">{review.reviewerName}</p><p className="mt-1 text-xs text-gray-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</p></td>
                  <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">{review.product?.name || review.productName || 'Unknown product'}</td>
                  <td className="max-w-sm px-5 py-4"><div className="flex gap-0.5 text-amber-400">{'★'.repeat(review.rating)}<span className="text-gray-200">{'★'.repeat(5 - review.rating)}</span></div><p className="mt-1 line-clamp-2 text-gray-600 dark:text-gray-300">{review.comment}</p></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${review.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : review.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{review.status}</span></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-1.5">{review.status !== 'approved' && <button onClick={() => changeStatus(review._id, 'approved')} className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700" title="Approve review"><Check className="h-4 w-4" /></button>}{review.status !== 'rejected' && <button onClick={() => changeStatus(review._id, 'rejected')} className="rounded-lg bg-gray-700 p-2 text-white hover:bg-gray-800" title="Reject review"><X className="h-4 w-4" /></button>}<button onClick={() => handleDelete(review._id)} className="rounded-lg bg-rose-600 p-2 text-white hover:bg-rose-700" title="Delete review"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
