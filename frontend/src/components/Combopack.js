"use client"
import React, { useEffect, useState } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import { Fan, MoveRight } from 'lucide-react'
import Addtocardbutton from './addtocardbutton'
import Wishlistheart from './Wishlistheart'
import ProductLink from './ProductLink'
import Link from 'next/link'
import { fetchProducts } from '@/services/dummyjson'

const Combopack = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComboDeals() {
      try {
        const data = await fetchProducts({ limit: 8, skip: 5 })
        setItems(data.products || [])
      } catch (err) {
        console.error('Failed to load combo deals:', err)
      } finally {
        setLoading(false)
      }
    }
    loadComboDeals()
  }, [])

  return (
    <div className="bg-gray-300 dark:bg-gray-800 rounded-2xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="container flex items-center">
            <div className="grid items-center justify-center h-[24px] w-[24px] bg-red-700 mb-4 rounded-3xl animate-spin">
              <Fan fill="#000000" size={18} strokeWidth={1} />
            </div>
            <h2 className="text-md lg:text-2xl text-black dark:text-white font-bold mb-4 ml-2">
              Exclusive Combo Deals
            </h2>
          </div>

          <div className="flex items-center justify-center gap-1 cursor-pointer mb-4">
            <Link href={'/combodeals'}>
              <p className="flex items-center gap-1 text-nowrap text-sm border-b-1 lg:text-xl font-medium">
                See All <MoveRight size={18} />
              </p>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No combo deals available.</p>
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
              <SplideSlide className="cursor-pointer border-1 rounded-3xl overflow-hidden border-gray-400 min-h-fit shadow-2xs bg-white dark:bg-black" key={item.id}>
                <div className="relative rounded-3xl flex flex-col justify-between h-full">
                  <ProductLink item={item}>
                    <img className="w-full h-48 sm:h-56 object-cover rounded-t-3xl" src={item.image} alt={item.name} />
                  </ProductLink>
                  {item.discountPercentage > 0 && (
                    <span className="absolute top-3 left-3 text-white text-[10px] font-poppins px-3 py-1 font-bold border-1 bg-red-700 rounded-3xl">
                      - {item.discountPercentage}%
                    </span>
                  )}
                  <Wishlistheart item={item} />
                  <Addtocardbutton item={item} />
                  <ProductLink item={item}>
                    <div className="text-start pl-5 border-t-[1px] border-gray-400 py-3">
                      <h3 className="text-base sm:text-lg font-bold truncate pr-3">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-red-500 font-semibold">TK.{item.price}</p>
                        {item.oldPrice > item.price && (
                          <p className="text-gray-500 line-through text-[13px] lg:text-sm">TK.{item.oldPrice}</p>
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
    </div>
  )
}

export default Combopack