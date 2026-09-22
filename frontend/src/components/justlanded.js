"use client"
import React, { useEffect, useState } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import Addtocardbutton from './addtocardbutton'
import Wishlistheart from './Wishlistheart'
import ProductLink from './ProductLink'
import { fetchCategories, fetchProductsByCategory } from '@/services/dummyjson'

const JustLanded = () => {
  const [selectedCategory, setSelectedCategory] = useState('mens-shoes')
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadCategories() {
      try {
        const data = await fetchCategories()
        if (isMounted && data.length > 0) {
          setCategories(data)
          setSelectedCategory(data[0].slug || data[0].name)
        }
      } catch (err) {
        console.error('Failed to fetch Just Landed categories:', err)
      }
    }
    loadCategories()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    async function loadCategoryProducts() {
      setLoading(true)
      try {
        const data = await fetchProductsByCategory(selectedCategory, { limit: 10, justLanded: true })
        const products = data.products?.length
          ? data.products
          : (await fetchProductsByCategory(selectedCategory, { limit: 10 })).products || []
        if (isMounted) {
          setItems(products)
        }
      } catch (err) {
        console.error('Failed to fetch JustLanded products:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadCategoryProducts()
    return () => { isMounted = false }
  }, [selectedCategory])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container flex items-center">
        <div className="h-[27px] w-[13px] bg-red-700 mb-4 rounded-3xl" />
        <h2 className="text-2xl font-bold mb-4 ml-2">Just Landed</h2>
      </div>

      <div className="mb-7">
        <Splide options={{
          perPage: 8,
          perMove: 1,
          gap: '1rem',
          breakpoints: {
            640: { perPage: 3 },
            1024: { perPage: 4 },
          },
        }}>
          {categories.map((option) => {
            const key = option.slug || option.name
            return <SplideSlide className="mb-7 overflow-hidden" key={option._id || key}>
              <button
                type="button"
                aria-pressed={selectedCategory === key}
                onClick={() => setSelectedCategory(key)}
                className={`w-full cursor-pointer rounded-3xl border-1 py-2 transition ${
                  selectedCategory === key
                    ? 'border-orange-400 bg-orange-50 dark:bg-gray-900 text-orange-600 font-bold'
                    : 'border-gray-400/50 bg-transparent'
                }`}
              >
                <h3 className="text-sm lg:text-5 md:text-lg text-center truncate px-1">{option.name}</h3>
              </button>
            </SplideSlide>
          })}
        </Splide>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No products found in this category.</p>
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
            <SplideSlide className="cursor-pointer border-1 rounded-3xl border-gray-400/30 min-h-fit shadow-2xs overflow-hidden" key={item.id}>
              <div className="relative rounded-3xl flex flex-col justify-between h-full bg-white dark:bg-gray-800">
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

export default JustLanded
