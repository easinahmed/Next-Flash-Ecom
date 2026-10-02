"use client"
import React, { useEffect, useState } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import Addtocardbutton from './addtocardbutton'
import Wishlistheart from './Wishlistheart'
import ProductLink from './ProductLink'
import { fetchProducts } from '@/services/dummyjson'

const Saggation = ({ category = '', excludeProductId = '' }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true
    async function loadSuggestions() {
      try {
        const uniqueItems = new Map()
        const addItems = (products) => {
          for (const item of products) {
            const id = item.id || item._id
            if (id && String(id) !== String(excludeProductId) && !uniqueItems.has(String(id))) {
              uniqueItems.set(String(id), item)
            }
          }
        }
        const categoryData = await fetchProducts({ category, limit: 8 })
        addItems(categoryData.products || [])

        if (uniqueItems.size < 4) {
          const allProducts = await fetchProducts({ limit: 50 })
          addItems(allProducts.products || [])
        }

        if (isCurrent) setItems([...uniqueItems.values()].slice(0, 8))
      } catch (err) {
        console.error('Failed to load suggestions:', err)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }
    loadSuggestions()
    return () => {
      isCurrent = false
    }
  }, [category, excludeProductId])

  if (!loading && items.length === 0) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="pt-6">
        <div className="flex items-center">
          <div className="h-[27px] w-[13px] bg-red-700 mb-4 rounded-3xl" />
          <h2 className="text-2xl font-bold mb-4 ml-2">You May Also Like</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <Splide options={{
            type: 'slide',
            rewind: true,
            perPage: 4,
            perMove: 1,
            gap: '1rem',
            breakpoints: {
              640: { perPage: 2 },
              1024: { perPage: 3 },
            },
          }}>
            {items.map((item) => (
              <SplideSlide className="cursor-pointer border-1 rounded-3xl border-gray-400/30 min-h-fit shadow-2xs overflow-hidden" key={item.id}>
                <div className="relative rounded-3xl flex flex-col justify-between h-full bg-white dark:bg-gray-800">
                  <ProductLink item={item}>
                    <img className="w-full h-44 sm:h-52 object-cover rounded-t-3xl" src={item.image} alt={item.name} />
                  </ProductLink>
                  <Wishlistheart item={item} />
                  <Addtocardbutton item={item} />
                  <ProductLink item={item}>
                    <div className="text-start pl-5 border-t-[1px] border-gray-400/30 py-3">
                      <h3 className="text-base sm:text-lg font-bold truncate pr-3">{item.name}</h3>
                      <p className="text-red-500 font-semibold mt-1">TK.{item.price}</p>
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

export default Saggation
