"use client"
import React, { useEffect, useState } from 'react'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import Link from 'next/link'
import WhatsApp from '@/components/whatsapp'
import ProductLink from '@/components/ProductLink'
import { fetchCategoryByNavbarSection, fetchProducts } from '@/services/dummyjson'

const AccessoriesPage = () => {
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryConfigured, setCategoryConfigured] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      try {
        const accessoryCategory = await fetchCategoryByNavbarSection('accessories', 'Accessories')
        if (!isMounted) return
        setCategory(accessoryCategory)
        setCategoryConfigured(Boolean(accessoryCategory))
        if (!accessoryCategory) {
          setProducts([])
          return
        }
        const data = await fetchProducts({
          category: accessoryCategory.slug || accessoryCategory.name,
          subcategory: selectedSubcategory,
          limit: 100,
        })
        if (isMounted) {
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error('Failed to load accessories:', err)
        if (isMounted) setProducts([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [selectedSubcategory])

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-start gap-2">
        <Link href="/"><p className="text-sm cursor-pointer hover:underline">Home</p></Link>
        <p className="text-sm">/</p>
        <p className="text-sm text-green-700 font-medium">Accessories</p>
      </div>

      <div className="pt-8">
        {category?.subcategories?.length > 0 && (
          <div className="mb-5 max-w-xs">
            <label htmlFor="accessory-subcategory" className="mb-1 block text-sm font-medium">Filter by subcategory</label>
            <select
              id="accessory-subcategory"
              value={selectedSubcategory}
              onChange={(event) => setSelectedSubcategory(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800"
            >
              <option value="">All subcategories</option>
              {category.subcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center">
          <div className="h-[20px] w-[20px] bg-red-700 mb-4 rounded-3xl" />
          <h2 className="text-lg lg:text-2xl font-bold mb-4 ml-2">{category?.name || 'Accessories'}</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : !categoryConfigured ? (
          <p className="text-center text-gray-500 py-12">Assign a category to the Accessories navbar section in Admin → Categories to show its products here.</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 overflow-hidden">
            {products.map((item) => (
              <div className="cursor-pointer border-1 rounded-3xl border-gray-400/20 min-h-fit shadow-2xs overflow-hidden flex flex-col justify-between bg-white dark:bg-gray-800" key={item.id}>
                <div className="relative items-center justify-center rounded-3xl overflow-hidden">
                  <ProductLink item={item}>
                    <img className="w-full h-48 sm:h-56 object-cover rounded-t-3xl" src={item.image} alt={item.name} />
                  </ProductLink>
                  {item.discountPercentage > 0 && (
                    <span className="absolute top-3 left-3 text-white text-[10px] font-poppins px-3 py-1 font-bold border-1 bg-red-700 rounded-3xl">
                      -{item.discountPercentage}%
                    </span>
                  )}
                  <Wishlistheart item={item} />
                  <Addtocardbutton item={item} />
                  <ProductLink item={item}>
                    <div className="text-start pl-5 border-t-[1px] border-gray-400/30 py-3">
                      <h3 className="text-base sm:text-lg font-bold truncate pr-3">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-red-500 font-semibold">TK.{item.price}</p>
                        {item.oldPrice > item.price && (
                          <p className="text-gray-500 text-[13px] lg:text-sm line-through">TK.{item.oldPrice}</p>
                        )}
                      </div>
                    </div>
                  </ProductLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <WhatsApp />
    </div>
  )
}

export default AccessoriesPage
