"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import discountedProductImage from '../../../public/discountproduct.webp'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import { MoveRight } from 'lucide-react'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import Link from 'next/link'
import WhatsApp from '@/components/whatsapp'
import ProductLink from '@/components/ProductLink'
import { fetchProductsByCategory } from '@/services/dummyjson'

export default function SneakerStudioPage() {
  const [menSneakers, setMenSneakers] = useState([])
  const [womenSneakers, setWomenSneakers] = useState([])
  const [kidsSneakers, setKidsSneakers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSneakerStudioData() {
      try {
        const [menData, womenData] = await Promise.all([
          fetchProductsByCategory('mens-shoes', { limit: 10 }),
          fetchProductsByCategory('womens-shoes', { limit: 10 }),
        ])
        setMenSneakers(menData.products || [])
        setWomenSneakers(womenData.products || [])
        setKidsSneakers((womenData.products || []).slice(0, 6))
      } catch (err) {
        console.error('Failed to load sneaker studio data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSneakerStudioData()
  }, [])

  const renderSneakerSlider = (title, href, products) => (
    <div className="mt-10">
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
            <SplideSlide className="cursor-pointer border-1 rounded-3xl border-gray-400/20 min-h-fit shadow-2xs overflow-hidden" key={item.id}>
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
    <div className="min-h-screen">
      <Image src={discountedProductImage} alt="Discounted Product" width={1920} height={1080} className="bg-cover overflow-hidden w-full h-auto" />
      <div className="container mx-auto px-4">
        <div className="inset-0 flex flex-col items-center justify-center bg-opacity-50">
          <div className="relative grid items-center justify-center gap-3">
            <h3 className="text-center font-extrabold leading-5 text-transparent text-2xl lg:text-5xl text-nowrap [-webkit-text-stroke:1px_#0D542B] bg-clip-text bg-red-500 mt-6">
              FLASH SHOE
            </h3>
            <h3 className="text-2xl lg:text-5xl text-gray-800 dark:text-white text-center mt-0 lg:mt-5 font-bold leading-5 text-balance lg:text-nowrap bg-clip-text bg-red-500">
              Your one-stop destination for all your sneaker needs
            </h3>
          </div>
          <p className="text-center text-sm lg:text-lg text-gray-800 dark:text-gray-200 mt-2 lg:mt-6 max-w-full lg:max-w-180 pt-3">
            Every occasion deserves a different look. A stylish one for a movie date, a powerful one for a morning run and a casual one for a meetup with friends. Sneaker Studio at Flash is where you can ace them all.
          </p>
        </div>

        {renderSneakerSlider('Man Sneakers', '/mansneakers', menSneakers)}
        {renderSneakerSlider('Woman Sneakers', '/womansneakers', womenSneakers)}
        {renderSneakerSlider("Kid's Sneakers", '/kidssneakers', kidsSneakers)}
      </div>
      <WhatsApp />
    </div>
  )
}