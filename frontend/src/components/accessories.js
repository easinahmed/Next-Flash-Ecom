"use client"
import React, { useEffect, useState } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import { MoveRight } from 'lucide-react'
import Addtocardbutton from './addtocardbutton'
import Wishlistheart from './Wishlistheart'
import ProductLink from './ProductLink'
import Link from 'next/link'
import { fetchProducts, fetchProductsByCategory } from '@/services/dummyjson'

const Accessories = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAccessories() {
      try {
        const data = await fetchProducts({ limit: 10, accessories: true })
        const fallback = data.products?.length ? data : await fetchProductsByCategory('mobile-accessories', { limit: 10 })
        setItems(fallback.products || [])
      } catch (err) {
        console.error('Failed to load accessories:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAccessories()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="container flex items-center">
          <div className="h-[27px] w-[13px] bg-red-700 mb-4 rounded-3xl" />
          <h2 className="text-2xl font-bold mb-4 ml-2">Accessories</h2>
        </div>

        <div className="flex items-center justify-center gap-1 cursor-pointer mb-4">
          <Link href="/accessories" className="flex items-center gap-1 text-nowrap text-sm border-b-1 lg:text-xl font-medium">
            See All <MoveRight size={18} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No accessories available.</p>
      ) : (
        <Splide options={{
          type: 'loop',
          perPage: 4,
          perMove: 1,
          gap: '1rem',
          breakpoints: {
            640: { perPage: 2 },
            1024: { perPage: 3 },
          },
        }}>
          {items.map((item) => (
            <SplideSlide className="cursor-pointer border-1 overflow-hidden rounded-3xl border-gray-400/30 min-h-fit shadow-2xs" key={item.id}>
              <div className="relative rounded-3xl flex flex-col justify-between h-full bg-white dark:bg-gray-800">
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
            </SplideSlide>
          ))}
        </Splide>
      )}
    </div>
  )
}

export default Accessories
