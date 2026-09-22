'use client';

import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSitePage, updateSitePage } from '@/lib/api';

export const CMS_PAGE_OPTIONS = [
  ['aboutus', 'About Us'], ['contactus', 'Contact Us'], ['privacy', 'Privacy Policy'],
  ['compamyinformation', 'Company Information'], ['terms', 'Terms & Conditions'], ['refund', 'Refund Policy'],
  ['supportcenter', 'Support Center'], ['howtoorder', 'How To Order'], ['shippingdelivery', 'Shipping & Delivery'],
  ['payment', 'Payment'], ['faq', 'FAQ'],
];

function initialSection(slug, index = 0) {
  return slug === 'faq'
    ? { id: `faq-${Date.now()}-${index}`, type: 'faq', label: 'FAQ item', question: '', answer: '' }
    : { id: `section-${Date.now()}-${index}`, type: 'section', label: `Section ${index + 1}`, title: '', content: '' };
}

function legacySections(page, slug) {
  if (page?.sections?.length) return page.sections;
  if (!page?.content) return [initialSection(slug)];
  return page.content.split(/\n\s*\n/).filter(Boolean).map((content, index) => ({
    ...initialSection(slug, index),
    label: `Paragraph ${index + 1}`,
    content,
  }));
}

export default function CmsSectionEditor({ slug, label }) {
  const [title, setTitle] = useState(label);
  const [sections, setSections] = useState([initialSection(slug)]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getSitePage(slug).then((page) => {
      if (!active) return;
      setTitle(page?.title || label);
      setSections(legacySections(page, slug));
    }).catch(() => {}).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug, label]);

  const updateSection = (index, values) => setSections((current) => current.map((section, i) => i === index ? { ...section, ...values } : section));
  const addSection = () => setSections((current) => [...current, initialSection(slug, current.length)]);
  const removeSection = (index) => setSections((current) => current.filter((_, i) => i !== index));

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateSitePage(slug, { title, content: sections.map((section) => section.content || section.answer || '').filter(Boolean).join('\n\n'), sections, isPublished: true });
      toast.success(`${label} content saved`);
    } catch (error) {
      toast.error(error.message || 'Failed to save page content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500 dark:border-gray-800 dark:bg-[#161623]">Loading {label} content...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#161623]">
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Page title</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
      </div>

      {sections.map((section, index) => (
        <section key={section.id || index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#161623]">
          <div className="mb-4 flex items-center gap-3"><input value={section.label || ''} onChange={(event) => updateSection(index, { label: event.target.value })} placeholder="Exact section name" className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" /><button type="button" onClick={() => removeSection(index)} disabled={sections.length === 1} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30" title="Remove section"><Trash2 className="h-4 w-4" /></button></div>
          {slug === 'faq' ? <div className="grid gap-3"><input value={section.question || ''} onChange={(event) => updateSection(index, { type: 'faq', question: event.target.value })} placeholder="FAQ question" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" /><textarea value={section.answer || ''} onChange={(event) => updateSection(index, { type: 'faq', answer: event.target.value })} placeholder="FAQ answer" rows={4} className="rounded-lg border border-gray-200 p-3 text-sm leading-6 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div> : <div className="grid gap-3"><input value={section.title || ''} onChange={(event) => updateSection(index, { type: 'section', title: event.target.value })} placeholder="Section heading" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" /><textarea value={section.content || ''} onChange={(event) => updateSection(index, { type: 'section', content: event.target.value })} placeholder={`Content for ${section.label || 'this section'}`} rows={6} className="rounded-lg border border-gray-200 p-3 text-sm leading-6 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>}
        </section>
      ))}

      <div className="flex flex-wrap gap-3"><button type="button" onClick={addSection} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"><Plus className="h-4 w-4" /> {slug === 'faq' ? 'Add FAQ' : 'Add section'}</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save changes'}</button></div>
    </form>
  );
}
