"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getHeroBanner, updateHeroBanner } from "@/lib/api";

export default function CmsBannersPage() {
  const [slides, setSlides] = useState([]);
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    getHeroBanner()
      .then((res) => {
        if (!mounted) return;
        setSlides(res.slides || []);
        setJson(JSON.stringify(res.slides || [], null, 2));
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const save = () => {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error("Expected an array of slides");
      setSaving(true);
      updateHeroBanner({ slides: parsed })
        .then((res) => {
          setSlides(res.slides || []);
          setJson(JSON.stringify(res.slides || [], null, 2));
        })
        .catch((err) => setError(err.message || String(err)))
        .finally(() => setSaving(false));
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  return (
    <AdminLayout activeSection="CMS / Banners">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1d24]">Banners</h1>
        <p className="text-sm text-[#6b7280] mt-1">Edit homepage hero slides (JSON).</p>
      </div>

      <div className="bg-white rounded-xl border border-black/[0.06] p-6 mt-6">
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && (
          <div>
            <textarea value={json} onChange={(e) => setJson(e.target.value)} className="w-full h-64 p-3 border rounded text-sm font-mono" />
            <div className="flex items-center gap-3 mt-3">
              <button onClick={save} disabled={saving} className="bg-[#d62828] text-white px-4 py-2 rounded">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => { setJson(JSON.stringify(slides, null, 2)); setError(null); }} className="px-4 py-2 border rounded">Reset</button>
            </div>
            <p className="text-xs text-[#6b7280] mt-3">Each slide should be an object with <code>image</code>, optional <code>title</code>, <code>subtitle</code>, and <code>link</code>.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
