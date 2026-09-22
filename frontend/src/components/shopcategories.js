"use client"
import React from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'

const Shopcategories = ({ selectedCategory, onCategoryChange, categories = [] }) => {
  const images = [
    { key: 'all', src: '/all.jpeg', alt: 'All products' },
    { key: 'leatherShoe', src: '/lethershoe.jpeg', alt: 'Leather shoes' },
    { key: 'sneakers', src: '/snakers.jpeg', alt: 'Sneakers' },
    { key: 'bag', src: '/bag.jpeg', alt: 'Bags' },
    { key: 'ladiesBag', src: '/ledisbag.jpeg', alt: 'Ladies bags' },
    { key: 'ladiesShoe', src: '/ledisshoe.jpeg', alt: 'Ladies shoes' },
    { key: 'belt', src: '/belt.jpeg', alt: 'Belts' },
    { key: 'wallet', src: '/wallet.jpeg', alt: 'Wallets' },
  ]

  const products = [
    { key: 'all', name: 'All Products', src: '/all.jpeg', alt: 'All products' },
    ...categories.map((category, index) => ({
      key: category.slug || category.name,
      name: category.name,
      src: category.image || images[(index + 1) % images.length].src,
      alt: category.name,
    })),
  ]

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="flex items-center justify-center ">
        <h2 className=" text-md md:text-2xl font-bold mb-4 ">Featured Categories</h2>
      </div>

      <Splide options={{
        perPage: 8,
        perMove: 1,
        gap: '1rem',
        breakpoints: {
          640: {
            perPage: 3,
          },
          768: {
            perPage: 4,
          },
        }
      }}>
        {products.map((product) => (
          <SplideSlide className={'cursor-pointer  '} key={product.key}>
            <button
              type="button"
              aria-pressed={selectedCategory === product.key}
              onClick={() => onCategoryChange(product.key)}
              className={`w-full flex flex-col bg-yellow-300/30 cursor-pointer rounded-2xl items-center justify-center mb-2 overflow-hidden border-2 ${selectedCategory === product.key ? 'border-orange-500' : 'border-transparent'}`}
            >
              <img className="h-20 w-20 object-cover overflow-hidden rounded-xl " src={product.src} alt={product.alt} />
              <div className="text-center ml-2 border-0 border-black">
                <h3 className="text-sm lg:text-lg font-bold text-nowrap ">{product.name}</h3>
              </div>
            </button>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  )
}

export default Shopcategories
