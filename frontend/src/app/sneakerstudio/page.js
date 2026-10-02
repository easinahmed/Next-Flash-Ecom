"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import WhatsApp from '@/components/whatsapp'
import ProductLink from '@/components/ProductLink'
import { fetchCategoryByNavbarSection, fetchProducts } from '@/services/dummyjson'

const genderOptions = [
  { value: '', label: 'See All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
]

export default function SneakerStudioPage() {
  const [category, setCategory] = useState(null)
  const [selectedGender, setSelectedGender] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryLoaded, setCategoryLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true
    fetchCategoryByNavbarSection('sneakerstudio', 'Sneakers')
      .then((data) => {
        if (isMounted) setCategory(data)
      })
      .catch((error) => console.error('Failed to load Sneaker Studio category:', error))
      .finally(() => {
        if (isMounted) setCategoryLoaded(true)
      })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!category) {
      setProducts([])
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    fetchProducts({
      category: category.slug || category.name,
      gender: selectedGender,
      limit: 100,
    })
      .then((data) => {
        if (isMounted) setProducts(data.products || [])
      })
      .catch((error) => {
        console.error('Failed to load Sneaker Studio products:', error)
        if (isMounted) setProducts([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [category, selectedGender])

  return (
    <main className="container mx-auto min-h-screen px-4 py-6">
      <div className="mb-5 flex items-center gap-2">
        <Link href="/" className="text-sm hover:underline">Home</Link>
        <span className="text-sm">/</span>
        <span className="text-sm font-medium text-green-700">Sneaker Studio</span>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Sneaker Studio</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Shop sneakers for men, women, and kids.</p>
        </div>
        <div className="w-full sm:max-w-xs">
          <label htmlFor="sneaker-gender" className="mb-1 block text-sm font-medium">Select collection</label>
          <select
            id="sneaker-gender"
            value={selectedGender}
            onChange={(event) => setSelectedGender(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800"
          >
            {genderOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : !categoryLoaded || !category ? (
        <p className="py-12 text-center text-gray-500">
          Assign a category to the Sneaker Studio navbar section in Admin → Categories to show sneakers here.
        </p>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          {selectedGender ? `No ${selectedGender} sneakers available.` : 'No sneakers available.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((item) => (
            <article key={item.id} className="relative overflow-hidden rounded-3xl border border-gray-400/20 bg-white shadow-sm dark:bg-gray-800">
              <ProductLink item={item}>
                <img className="h-48 w-full rounded-t-3xl object-cover sm:h-56" src={item.image} alt={item.name} />
              </ProductLink>
              {item.discountPercentage > 0 && (
                <span className="absolute left-3 top-3 rounded-3xl border bg-red-700 px-3 py-1 text-[10px] font-bold text-white">
                  -{item.discountPercentage}%
                </span>
              )}
              <Wishlistheart item={item} />
              <Addtocardbutton item={item} />
              <ProductLink item={item}>
                <div className="border-t border-gray-400/30 px-5 py-3">
                  <h2 className="truncate text-base font-bold">{item.name}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-semibold text-red-500">TK.{item.price}</p>
                    {item.oldPrice > item.price && (
                      <p className="text-sm text-gray-500 line-through">TK.{item.oldPrice}</p>
                    )}
                  </div>
                </div>
              </ProductLink>
            </article>
          ))}
        </div>
      )}
      <WhatsApp />
    </main>
  )
}
