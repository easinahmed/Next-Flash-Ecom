'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getBrands, getCategories, getHomepageSections, getProducts, updateHomepageSection } from '@/lib/api';
import { Check, RefreshCw, Search, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const FIXED_SECTIONS = [
  { key: 'best-seller', title: 'Best Seller', type: 'special' },
  { key: 'exclusive-combo-deals', title: 'Exclusive Combo Deals', type: 'special' },
  { key: 'which-you-want-men', title: 'Which You Want · Man', type: 'gender', value: 'men' },
  { key: 'which-you-want-women', title: 'Which You Want · Woman', type: 'gender', value: 'women' },
  { key: 'which-you-want-kids', title: 'Which You Want · Kids', type: 'gender', value: 'kids' },
  { key: 'gender-men', title: 'Men', type: 'gender', value: 'men' },
  { key: 'gender-women', title: 'Women', type: 'gender', value: 'women' },
  { key: 'gender-kids', title: 'Kids', type: 'gender', value: 'kids' },
];

function makeSectionKey(prefix, value) {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${prefix}-${slug}`;
}

export default function HomepageSectionsPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [savedSections, setSavedSections] = useState({});
  const [draftSections, setDraftSections] = useState({});
  const [selectedSectionKey, setSelectedSectionKey] = useState('best-seller');
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sections = useMemo(() => [
    ...FIXED_SECTIONS,
    ...categories.map((category) => ({
      key: makeSectionKey('category', category.slug || category.name),
      title: category.name,
      type: 'category',
      value: category.name,
      aliases: [category.name, category.slug].filter(Boolean),
    })),
    ...brands.map((brand) => ({
      key: makeSectionKey('brand', brand.slug || brand.name),
      title: brand.name,
      type: 'brand',
      value: brand.name,
    })),
  ], [categories, brands]);

  const selectedSection = sections.find((section) => section.key === selectedSectionKey) || sections[0];

  const loadData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const [categoryData, brandData, productData, sectionData] = await Promise.all([
        getCategories(),
        getBrands(),
        getProducts(),
        getHomepageSections(),
      ]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
      setProducts(Array.isArray(productData) ? productData : []);
      const sectionMap = Object.fromEntries(
        (Array.isArray(sectionData) ? sectionData : []).map((section) => [
          section.key,
          { title: section.title, productIds: (section.products || []).map((product) => String(product._id || product.id)) },
        ])
      );
      setSavedSections(sectionMap);
      setDraftSections({});
    } catch (loadError) {
      setError(loadError.message || 'Failed to load homepage section data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const selectedProductIds = useMemo(
    () => draftSections[selectedSectionKey] ?? savedSections[selectedSectionKey]?.productIds ?? [],
    [draftSections, savedSections, selectedSectionKey]
  );

  const matchingProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !query || [product.name, product.brand, product.category, product.subcategory]
        .some((value) => String(value || '').toLowerCase().includes(query));
      if (!matchesSearch) return false;
      const id = String(product._id || product.id);
      if (selectedProductIds.includes(id)) return true;
      if (selectedSection?.type === 'category') {
        return selectedSection.aliases.some((alias) => String(product.category || '').toLowerCase() === alias.toLowerCase());
      }
      if (selectedSection?.type === 'brand') return String(product.brand || '').toLowerCase() === selectedSection.value.toLowerCase();
      if (selectedSection?.type === 'gender') return String(product.gender || '').toLowerCase() === selectedSection.value;
      if (selectedSection?.key === 'best-seller') return product.bestSeller;
      if (selectedSection?.key === 'exclusive-combo-deals') return product.comboDeal;
      return true;
    });
  }, [products, productSearch, selectedSection, selectedProductIds]);

  const toggleProduct = (productId) => {
    setDraftSections((currentDrafts) => {
      const currentSelection = currentDrafts[selectedSectionKey]
        ?? savedSections[selectedSectionKey]?.productIds
        ?? [];
      return {
        ...currentDrafts,
        [selectedSectionKey]: currentSelection.includes(productId)
          ? currentSelection.filter((id) => id !== productId)
          : [...currentSelection, productId],
      };
    });
  };

  const handleSave = async () => {
    if (!selectedSection || saving) return;
    setSaving(true);
    try {
      await updateHomepageSection(selectedSection.key, {
        title: selectedSection.title,
        productIds: selectedProductIds,
      });
      setSavedSections((current) => ({
        ...current,
        [selectedSection.key]: { title: selectedSection.title, productIds: selectedProductIds },
      }));
      setDraftSections((current) => {
        const next = { ...current };
        delete next[selectedSection.key];
        return next;
      });
      toast.success(`${selectedSection.title} homepage products saved`);
    } catch (saveError) {
      toast.error(saveError.message || 'Failed to save homepage products');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeSection="Homepage Sections" searchPlaceholder="Manage homepage products...">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homepage Sections</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose the products shown in homepage collections, categories, brands, and Men/Women/Kids sections.
          </p>
        </div>
        <button type="button" onClick={() => loadData(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-[#161623] dark:text-gray-200">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#161623]">
          <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Homepage sections</h2>
          <div className="max-h-[70vh] space-y-1 overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => {
                  setSelectedSectionKey(section.key);
                  setProductSearch('');
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${selectedSectionKey === section.key ? 'bg-indigo-600 font-semibold text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'}`}
              >
                <span className="truncate">{section.title}</span>
                <span className="ml-2 text-xs opacity-75">{savedSections[section.key]?.productIds.length || 0}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#161623]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedSection?.title || 'Select a section'}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedProductIds.length} selected product(s)</p>
            </div>
            <button type="button" onClick={handleSave} disabled={loading || saving || !selectedSection} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save section'}
            </button>
          </div>

          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search product, brand, or category..." className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading products and sections...</div>
          ) : matchingProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No products found in this section. Try another search or section.</div>
          ) : (
            <div className="grid gap-3 p-4 sm:grid-cols-2 2xl:grid-cols-3">
              {matchingProducts.map((product) => {
                const id = String(product._id || product.id);
                const isSelected = selectedProductIds.includes(id);
                return (
                  <button key={id} type="button" onClick={() => toggleProduct(id)} aria-pressed={isSelected} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500'}`}>
                    <img src={product.images?.[0] || product.image || '/shoe1.avif'} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 object-cover dark:bg-gray-800" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{product.name || product.title}</span>
                      <span className="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">{[product.brand, product.category, product.subcategory].filter(Boolean).join(' · ')}</span>
                      <span className="mt-1 block text-sm font-bold text-red-600">৳{Number(product.price || 0).toLocaleString()}</span>
                    </span>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-transparent dark:border-gray-600'}`}>
                      <Check className="h-4 w-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
