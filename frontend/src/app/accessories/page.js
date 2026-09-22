"use client"
import React, { useEffect, useState } from 'react'
import Addtocardbutton from '@/components/addtocardbutton'
import Accessoriesitems from '@/components/accessoriesitems'
import Wishlistheart from '@/components/Wishlistheart'
import Link from 'next/link'
import WhatsApp from '@/components/whatsapp'
import ProductLink from '@/components/ProductLink'
import { fetchCategories, fetchProductsByCategory, fetchProducts } from '@/services/dummyjson'

const AccessoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      try {
        const data = selectedCategory === 'all'
          ? await fetchProducts({ limit: 30, accessories: true })
          : await fetchProductsByCategory(selectedCategory, { limit: 30 })
        if (isMounted) {
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error('Failed to load accessories:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [selectedCategory])

  useEffect(() => {
    let isMounted = true
    Promise.all([fetchCategories(), fetchProducts({ limit: 100, accessories: true })]).then(([categoryData, accessoryData]) => {
      if (!isMounted) return
      const accessoryCategories = new Set((accessoryData.products || []).map((product) => product.category?.toLowerCase()))
      setCategories((categoryData || []).filter((category) => accessoryCategories.has(category.name?.toLowerCase())))
    }).catch((err) => console.error('Failed to load accessory categories:', err))
    return () => { isMounted = false }
  }, [])

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-start gap-2">
        <Link href="/"><p className="text-sm cursor-pointer hover:underline">Home</p></Link>
        <p className="text-sm">/</p>
        <p className="text-sm text-green-700 font-medium">Accessories</p>
      </div>

      <div>
        <Accessoriesitems selectedCategory={selectedCategory} categories={categories} onCategoryChange={setSelectedCategory} />
      </div>

      <div className="pt-8">
        <div className="flex items-center">
          <div className="h-[20px] w-[20px] bg-red-700 mb-4 rounded-3xl" />
          <h2 className="text-lg lg:text-2xl font-bold mb-4 ml-2">{selectedCategory === 'all' ? 'All Accessories' : categories.find((category) => (category.slug || category.name) === selectedCategory)?.name || 'Accessories'}</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
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
