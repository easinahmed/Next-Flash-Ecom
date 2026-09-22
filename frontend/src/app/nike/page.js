"use client"
import React, { useEffect, useState } from 'react'
import Nike from '@/images/nikelogo.png'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import Link from 'next/link'
import Image from 'next/image'
import ProductLink from '@/components/ProductLink'
import WhatsApp from '@/components/whatsapp'
import { fetchProductsByCategory } from '@/services/dummyjson'

export default function NikePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProductsByCategory('mens-shoes', { limit: 30 })
        setProducts(data.products || [])
      } catch (err) {
        console.error('Failed to load Nike products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="container mx-auto px-4 py-4">

      <div className='flex items-center justify-start gap-2'>
        <Link href={'/brands'}><p className='text-sm cursor-pointer hover:underline'>Brands</p></Link>
        <p className='text-sm'>/</p>
        <p className='text-sm text-green-700 font-medium'>Nike</p>
      </div>

      {/* Logo */}
      <div className='container flex items-center justify-center overflow-hidden mt-2'>
        <Image className='h-12 lg:h-20 w-20 lg:w-50 py-1 px-1 border-2 border-gray-400 rounded-2xl bg-white shadow-2xs cursor-pointer' src={Nike} alt='Nike Logo' />
      </div>

      {/* Products */}
      <div className="pt-8">
        <div className="flex items-center">
          <div className="h-[20px] w-[20px] bg-red-700 mb-4 rounded-3xl" />
          <h2 className="text-lg lg:text-2xl font-bold mb-4 ml-2">Nike</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 overflow-hidden">
            {products.map((item) => (
              <div className='cursor-pointer border-1 rounded-3xl border-gray-400/20 min-h-fit shadow-2xs' key={item.id}>
                <div className="relative items-center justify-center rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
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
                    <div className="text-start pl-5 border-t-[1px] border-gray-400/30 py-2">
                      <h3 className="text-base sm:text-lg font-bold truncate pr-3">{item.name}</h3>
                      <div className="flex items-center gap-2">
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