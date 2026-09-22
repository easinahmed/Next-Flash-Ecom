"use client"
import React, { useEffect, useState } from 'react'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import Link from 'next/link'
import WhatsApp from '@/components/whatsapp'
import ProductLink from '@/components/ProductLink'
import { fetchProducts } from '@/services/dummyjson'

export default function DiscountedProductPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDiscountedProducts() {
      try {
        const data = await fetchProducts({ limit: 100, skip: 0, discounted: true })
        setProducts(data.products || [])
      } catch (err) {
        console.error('Failed to load discounted products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDiscountedProducts()
  }, [])

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-start gap-2 mb-7">
        <Link href="/"><p className="text-sm cursor-pointer hover:underline">Home</p></Link>
        <p className="text-sm">/</p>
        <p className="text-sm text-green-700 font-medium">Discounted Products</p>
      </div>

      <div className="container flex items-center justify-between">
        <div className="flex items-center justify-center">
          <div className="h-[20px] w-[20px] bg-red-700 mb-4 rounded-3xl" />
          <h2 className="text-lg lg:text-2xl font-bold mb-4 ml-2">Your Discounted Products</h2>
        </div>

        <div className="dropdown dropdown-end">
          <button tabIndex={0} role="button" className="px-3 py-1 rounded-2xl bg-gray-100 dark:bg-gray-800 border-1 border-orange-500 cursor-pointer text-black dark:text-white m-1 mb-5">ITEM</button>
          <ul tabIndex={-1} className="dropdown-content menu border-1 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-box z-1 w-52 p-2 shadow-2xl">
            <li><Link href="/discountedproduct" className="bg-white dark:bg-gray-500 hover:bg-amber-200 dark:hover:bg-gray-600 border-1 border-orange-500">All Products</Link></li>
            <li><Link href="/manproduct" className="bg-white dark:bg-gray-500 hover:bg-amber-200 dark:hover:bg-gray-600 border-1 mt-1">Men</Link></li>
            <li><Link href="/womanproduct" className="bg-white dark:bg-gray-500 hover:bg-amber-200 dark:hover:bg-gray-600 border-1 mt-1">Women</Link></li>
            <li><Link href="/kidsproduct" className="bg-white dark:bg-gray-500 hover:bg-amber-200 dark:hover:bg-gray-600 border-1 mt-1">Kids</Link></li>
          </ul>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-hidden">
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
      <WhatsApp />
    </div>
  )
}