'use client'

import { MoveRight } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import ProductLink from '@/components/ProductLink'
import { fetchProducts } from '@/services/dummyjson'

const Choosesneakers = ({ showSeeAll = true }) => {
  const [products, setProducts] = useState([])
  const [visibleProductCount, setVisibleProductCount] = useState(16)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSneakers() {
      try {
        const data = await fetchProducts({ limit: 100 })
        const sneakers = (data.products || []).filter((product) => {
          const category = (product.category || '').toLowerCase()
          const name = (product.name || '').toLowerCase()
          return category.includes('sneaker') || name.includes('sneaker')
        })
        setProducts(sneakers)
      } catch (err) {
        console.error('Failed to load sneakers:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSneakers()
  }, [])

  const visibleProducts = products.slice(0, visibleProductCount)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="container flex items-center">
          <div className="h-[27px] w-[13px] bg-red-700 mb-4 rounded-3xl" />
          <h2 className="text-2xl font-bold mb-4 ml-2">Choose Your Sneakers</h2>
        </div>

        {showSeeAll && (
          <div className="flex items-center justify-center gap-1 cursor-pointer mb-4">
            <Link href={'/choosesneaker'}>
              <p className="flex items-center gap-1 text-nowrap text-sm border-b-1 lg:text-xl font-medium">
                See All <MoveRight size={18} />
              </p>
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 overflow-hidden">
          {visibleProducts.map((item) => (
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

      {!loading && visibleProductCount < products.length && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setVisibleProductCount((count) => count + 16)}
            className="rounded-full border border-gray-900 dark:border-gray-400 px-6 py-2 font-semibold transition-colors hover:bg-gray-900 dark:bg-gray-800 hover:text-white dark:hover:text-white cursor-pointer"
          >
            Load More...
          </button>
        </div>
      )}
    </div>
  )
}

export default Choosesneakers
