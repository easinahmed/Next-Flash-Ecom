"use client"
import React from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'

const Accessoriesitems = ({ selectedCategory, onCategoryChange, categories = [] }) => {
  const images = [
    { src: '/all.jpeg', alt: 'All accessories' },
    { src: '/bag.jpeg', alt: 'Bags' },
    { src: '/ledisbag.jpeg', alt: 'Ladies bags' },
    { src: '/wallet.jpeg', alt: 'Wallets' },
    { src: '/belt.jpeg', alt: 'Belts' },
    { src: '/accessories.jpeg', alt: 'Other accessories' },
     ]

  const products = [
    { key: 'all', name: 'See All' },
    ...categories.map((category) => ({
      key: category.slug || category.name,
      name: category.name,
    })),
  ]

    const selectedProducts = products.map((product, index) => ({
    ...product,
    image: images[index % images.length] || images[0],
  }))

  return (
    <div>
            {/* //////////////////Selected Your Products////////////////////// */}
      <div>
        <Splide options={{
          perPage: 6,
          perMove: 1,
          gap: '1rem',
          breakpoints: {
            640: {
              perPage: 4,
            },
            768: {
              perPage: 5,
            },
          }
        }}>
          {selectedProducts.map((product, index) => (
            <SplideSlide className={'cursor-pointer overflow-hidden pt-6 '} key={index}>
              <button
                type="button"
                aria-pressed={selectedCategory === product.key}
                onClick={() => onCategoryChange(product.key)}
                className={`w-full cursor-pointer bg-yellow-300/50 rounded-2xl grid-rows-1 items-center justify-center mb-2 overflow-hidden border-2 ${selectedCategory === product.key ? 'border-orange-500' : 'border-transparent'}`}
              >
                <img className=" w-full h-full lg:w-full lg:h-full object-cover " src={product.image.src} alt={product.image.alt} />
                <div className="text-center ml-2 border-0 border-black">
                  <h3 className="text-sm lg:text-lg font-bold text-nowrap ">{product.name}</h3>
                </div>
              </button>
            </SplideSlide>
          ))}
        </Splide>
      </div>
      {/* //////////////////Selected Your Products////////////////////// */}
    </div>
  )
}

export default Accessoriesitems
