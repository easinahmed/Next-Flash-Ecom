"use client"
import React, { useEffect, useState } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import { MoveRight } from 'lucide-react'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import Link from 'next/link'
import WhatsApp from '@/components/whatsapp'
import ProductLink from '@/components/ProductLink'
import { fetchProducts } from '@/services/dummyjson'
import { getBrands } from '@/lib/api'

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [brandProducts, setBrandProducts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBrandProducts() {
      try {
        const brandData = await getBrands()
        setBrands(brandData || [])
        const productGroups = await Promise.all((brandData || []).map(async (brand) => {
          const data = await fetchProducts({ brand: brand.name, limit: 10 })
          return [brand._id, data.products || []]
        }))
        setBrandProducts(Object.fromEntries(productGroups))
      } catch (err) {
        console.error('Failed to load brand products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBrandProducts()
  }, [])

  const renderBrandSlider = (title, href, products) => (
    <div key={href} className="mt-10">
      <div className="flex items-center justify-between">
        <div className="container flex items-center">
          <div className="h-[27px] w-[13px] bg-red-700 mb-4 rounded-3xl" />
          <h2 className="text-2xl font-bold mb-4 ml-2">{title}</h2>
        </div>

        <div className="flex items-center justify-center gap-1 cursor-pointer mb-4">
          <Link href={href} className="flex items-center gap-1 text-nowrap text-sm border-b-1 lg:text-xl font-medium">
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
      ) : (
        <Splide options={{
          type: 'loop',
          perPage: 5,
          perMove: 1,
          gap: '1rem',
          breakpoints: {
            640: { perPage: 2 },
            1024: { perPage: 3 },
          },
        }}>
              {products.map((item) => (
            <SplideSlide className="cursor-pointer border-1 rounded-3xl border-gray-400/20 overflow-hidden min-h-fit shadow-2xs" key={item.id}>
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

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-start gap-2 mb-4">
        <Link href="/"><p className="text-sm cursor-pointer hover:underline">Home</p></Link>
        <p className="text-sm">/</p>
        <p className="text-sm text-green-700 font-medium">Brands</p>
      </div>

      <div className="flex items-center justify-center mb-2">
        <h1 className="text-md lg:text-2xl font-bold leading-5">What&apos;s Your Favourite Brand?</h1>
      </div>

      <div className="container flex flex-wrap items-center justify-center gap-5 overflow-hidden">
        {brands.map((brand) => <Link key={brand._id} href={`/brand/${brand.slug}`}><div className="flex h-20 w-28 items-center justify-center rounded-2xl border-2 border-gray-400 bg-white p-3 shadow-2xs transition hover:scale-105">{brand.image ? <img className="max-h-full max-w-full object-contain" src={brand.image} alt={brand.name} /> : <span className="font-bold text-gray-700">{brand.name}</span>}</div></Link>)}
      </div>

      {brands.map((brand) => renderBrandSlider(brand.name, `/brand/${brand.slug}`, brandProducts[brand._id] || []))}

      <WhatsApp />
    </div>
  )
}
