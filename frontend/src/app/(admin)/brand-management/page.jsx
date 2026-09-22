'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { createBrand, deleteBrand, getBrands, updateBrand } from '@/lib/api';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrandManagementPage() {
  const [brands, setBrands] = useState([]);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getBrands()
      .then((data) => {
        if (active) setBrands(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) toast.error(error.message || 'Failed to load brands');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const openForm = (brand = null) => {
    setEditing(brand);
    setName(brand?.name || '');
    setImage(null);
    setPreview(brand?.image || '');
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (image) formData.append('image', image);
      if (editing) await updateBrand(editing._id, formData);
      else await createBrand(formData);
      toast.success(editing ? 'Brand updated' : 'Brand created');
      openForm(null);
      await loadBrands();
    } catch (error) {
      toast.error(error.message || 'Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (brand) => {
    if (!window.confirm(`Remove ${brand.name} from the brand list?`)) return;
    try {
      await deleteBrand(brand._id);
      setBrands((current) => current.filter((item) => item._id !== brand._id));
      toast.success('Brand removed');
    } catch (error) {
      toast.error(error.message || 'Failed to remove brand');
    }
  };

  return (
    <AdminLayout activeSection="Brands" searchPlaceholder="Search brands...">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands</h1><p className="mt-1 text-sm text-gray-500">Create brands with logo images for your storefront.</p></div>
        <button onClick={() => openForm(null)} className="inline-flex items-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Plus className="h-4 w-4" /> Add brand</button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#161623]">
          {loading ? <div className="p-12 text-center text-gray-500">Loading brands...</div> : brands.length === 0 ? <div className="p-12 text-center text-gray-500">No brands yet.</div> : <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">{brands.map((brand) => <div key={brand._id} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"><div className="flex h-32 items-center justify-center bg-gray-50 p-5 dark:bg-gray-900">{brand.image ? <img src={brand.image} alt={brand.name} className="max-h-full max-w-full object-contain" /> : <ImagePlus className="h-8 w-8 text-gray-300" />}</div><div className="flex items-center justify-between p-3"><span className="font-semibold text-gray-900 dark:text-white">{brand.name}</span><div className="flex gap-1"><button onClick={() => openForm(brand)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="Edit brand"><Pencil className="h-4 w-4" /></button><button onClick={() => handleDelete(brand)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Delete brand"><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div>}
        </div>

        <form onSubmit={handleSubmit} className="h-fit rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#161623]"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-gray-900 dark:text-white">{editing ? 'Edit brand' : 'New brand'}</h2>{editing && <button type="button" onClick={() => openForm(null)} className="text-gray-400" title="Clear form"><X className="h-4 w-4" /></button>}</div><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Brand name" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white" /><div className="mt-4">{preview && <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-gray-50 p-3 dark:bg-gray-900"><img src={preview} alt="Brand preview" className="max-h-full max-w-full object-contain" /></div>}<label className="block cursor-pointer rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 hover:border-indigo-500"><ImagePlus className="mx-auto mb-1 h-5 w-5" />Choose brand picture<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label></div><button disabled={saving || !name.trim()} className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Save brand' : 'Create brand'}</button></form>
      </div>
    </AdminLayout>
  );
}
