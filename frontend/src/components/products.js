"use client"
import React, { useEffect, useState } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import Link from 'next/link'
import { fetchCategories } from '@/services/dummyjson'

const defaultCategoryImages = {
  'mens-shoes': '/snakers.jpeg',
  'womens-shoes': '/ledisshoe.jpeg',
  'womens-bags': '/ledisbag.jpeg',
  'mens-shirts': '/lethershoe.jpeg',
  'sunglasses': '/sandals.png',
  'mobile-accessories': '/belt.jpeg',
  'sports-accessories': '/wallet.jpeg',
  'beauty': '/bag.jpeg',
}

const Products = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchCategories()
        if (cats && cats.length > 0) {
          setCategories(cats)
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center">
        <h2 className="text-md md:text-2xl font-bold mb-4">Featured Categories</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700" />
        </div>
      ) : (
        <Splide options={{
          perPage: 8,
          perMove: 1,
          gap: '1rem',
          breakpoints: {
            640: { perPage: 3 },
            768: { perPage: 4 },
            1024: { perPage: 6 },
          }
        }}>
          {categories.map((cat, index) => {
            const slug = cat.slug || cat
            const name = cat.name || slug
            const imgSrc = cat.image || defaultCategoryImages[slug] || `/shoe${(index % 10) + 1}.avif`

            return (
              <SplideSlide className="cursor-pointer" key={slug}>
                <div className="flex flex-col bg-yellow-300/30 dark:bg-gray-800 rounded-2xl items-center justify-center mb-2 overflow-hidden p-2 transition hover:scale-105">
                  <Link href={`/category/${slug}`} className="flex flex-col items-center w-full">
                    <img className="h-20 w-20 object-cover rounded-xl overflow-hidden mb-2" src={imgSrc} alt={name} />
                    <div className="text-center px-1">
                      <h3 className="text-xs lg:text-sm font-bold truncate max-w-[100px] capitalize">{name}</h3>
                    </div>
                  </Link>
                </div>
              </SplideSlide>
            )
          })}
        </Splide>
      )}
    </div>
  )
}

export default Products
