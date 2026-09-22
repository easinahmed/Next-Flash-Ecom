'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { getHeroBanners, createHeroBanner, updateHeroBanner, uploadHeroImage } from '@/lib/api';
import { Image as ImageIcon, Plus, RefreshCw, Link as LinkIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CmsPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [link, setLink] = useState('/sneakerstudio');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [saving, setSaving] = useState(false);
  const pageOptions = [
      ['aboutus', 'About Us'], ['contactus', 'Contact Us'], ['privacy', 'Privacy Policy'],
      ['compamyinformation', 'Company Information'], ['terms', 'Terms & Conditions'], ['refund', 'Refund Policy'],
      ['supportcenter', 'Support Center'], ['howtoorder', 'How To Order'], ['shippingdelivery', 'Shipping & Delivery'],
      ['payment', 'Payment'], ['faq', 'FAQ'],
  ];

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await getHeroBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHeroBanners().then((data) => setBanners(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let bannerImage = image;
      if (imageFile) {
        const uploaded = await uploadHeroImage(imageFile);
        bannerImage = uploaded.imageUrl || uploaded.url || uploaded.secure_url;
      }
      await createHeroBanner({
        title,
        subtitle,
        image: bannerImage || '/shoe1.avif',
        link,
        buttonText,
        active: true,
      });
      toast.success('Hero banner added');
      setShowModal(false);
      setTitle('');
      setSubtitle('');
      setImage('');
      setImageFile(null);
      loadBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to add banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (index) => {
    if (!window.confirm('Delete this hero banner?')) return;
    try {
      const nextBanners = banners.filter((_, bannerIndex) => bannerIndex !== index);
      await updateHeroBanner({ slides: nextBanners });
      setBanners(nextBanners);
      toast.success('Hero banner deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete hero banner');
    }
  };

  return (
    <AdminLayout activeSection="CMS / Banners">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hero & Promotional Banners</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Control home sliders and banner promotions across your storefront.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadBanners}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Banner
          </button>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#161623]">
        <div className="mb-4"><h2 className="text-lg font-bold text-gray-900 dark:text-white">Content editors</h2><p className="mt-1 text-sm text-gray-500">Open an individual page to edit its labeled sections.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/cms/banners" className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-bold text-indigo-700 hover:bg-indigo-100">Hero banners</Link>
          {pageOptions.map(([slug, label]) => <Link key={slug} href={`/cms/${slug}`} className="rounded-xl border border-gray-200 p-4 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">{label}</Link>)}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-gray-500 bg-white dark:bg-[#161623] rounded-2xl border border-gray-200 dark:border-gray-800">
            Loading banners from backend...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-gray-400 bg-white dark:bg-[#161623] rounded-2xl border border-gray-200 dark:border-gray-800">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">No Hero Banners Found</p>
          </div>
        ) : (
          banners.map((b, idx) => (
            <div key={b._id || idx} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#161623]">
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                <img src={b.image || '/shoe1.avif'} alt={b.title} className="h-full w-full object-cover" />
                <span className="absolute top-3 right-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                  Active
                </span>
              </div>
              <div className="flex items-start justify-between gap-3"><h3 className="font-bold text-lg text-gray-900 dark:text-white">{b.title}</h3><button type="button" onClick={() => handleDeleteBanner(idx)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950" title="Delete hero banner"><Trash2 className="h-4 w-4" /></button></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{b.subtitle}</p>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800 text-xs">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                  <LinkIcon className="h-3.5 w-3.5" />
                  {b.link || '/'}
                </span>
                <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {b.buttonText || 'Shop'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#161623]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Hero Banner</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Special Sneaker Sale"
                  className="w-full rounded-xl border p-2.5 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Get up to 40% off"
                  className="w-full rounded-xl border p-2.5 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Banner image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="mb-2 w-full rounded-xl border p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Or paste an image URL"
                  className="w-full rounded-xl border p-2.5 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Button Link</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/sneakerstudio"
                  className="w-full rounded-xl border p-2.5 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border p-2.5 font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-indigo-600 p-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
