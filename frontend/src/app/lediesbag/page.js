"use client"
import React from 'react'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import Link from 'next/link'

const page = () => {
    const getDiscountPercentage = (price, oldPrice) => {
    const currentPrice = Number.parseFloat(price.replace(/[^0-9.]/g, ''))
    const previousPrice = Number.parseFloat(oldPrice.replace(/[^0-9.]/g, ''))

    if (!previousPrice || currentPrice >= previousPrice) return 0

    return Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
  }

  const images = [
    { src: '/shoe1.avif', alt: 'Image 1' },
    { src: '/shoe2.avif', alt: 'Image 2' },
    { src: '/shoe3.avif', alt: 'Image 3' },
    { src: '/shoe4.webp', alt: 'Image 4' },
    { src: '/shoe5.avif', alt: 'Image 5' },
    { src: '/shoe6.avif', alt: 'Image 6' },
    { src: '/shoe7.avif', alt: 'Image 7' },
    { src: '/shoe8.avif', alt: 'Image 8' },
    { src: '/shoe9.avif', alt: 'Image 9' },
    { src: '/shoe10.avif', alt: 'Image 10' },
  ]

  const products = [
    { name: 'Lides Bag' },
    { name: 'Money Bag' },
    { name: 'Backpack' },
    { name: 'Belt' },
    { name: 'Shoes Polish' },
  ]

  const producstname = [
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '40', size1: '42', size2: '38' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '42', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '38', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: 'M', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '40', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '41', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '38', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: 'M', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '40', size1: '42', size2: '38' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '42', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '38', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: 'M', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '40', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '41', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: '38', size1: '44', size2: '46' },
    { name: 'shaker', price: '$1800', oldPrice: '$2500', color: 'Red', color1: 'Blue', color2: 'Green', size: 'M', size1: '44', size2: '46' },
  ]

  const selectedProducts = products.map((product, index) => ({
    ...product,
    image: images[index % images.length] || images[0],
  }))

  const productImages = producstname.map((product, index) => ({
    ...product,
    image: images[index % images.length] || images[0],
  }))

  return (
    <div className="container mx-auto px-4 py-4">

      <div className=' flex items-center justify-start gap-2' >
       <Link href={'/'} > <p className=' text-sm cursor-pointer ' >Home</p> </Link>
        <p className=' text-sm cursor-pointer ' >/</p>
        <p className=' text-sm cursor-pointer text-green-700 ' >Lediesbag</p>
      </div>

      {/* //////////////////ALL Products////////////////////// */}
      <div className=" pt-8 ">
         <div className="flex items-center ">
          <div className="h-[20px] w-[20px] bg-red-700 mb-4 rounded-3xl " />
          <h2 className=" text-lg lg:text-2xl font-bold mb-4 ml-2 ">Ledies Bag</h2>
        </div>

       <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 overflow-hidden ">
        {productImages.map((item, index) => (
          <div className={'cursor-pointer border-1 rounded-3xl border-gray-400/20 min-h-fit shadow-2xs overflow-hidden '} key={index}>
            <div className=" relative items-center justify-center rounded-3xl overflow-hidden">
              <img className=" w-full h-full lg:w-full lg:h-full object-cover rounded-t-3xl " src={item.image.src} alt={item.image.alt} />
              <span className="absolute top-3 left-3 text-white text-[10px]  font-poppins px-3 py-1 font-bold border-1 bg-red-700 rounded-3xl">
                -{getDiscountPercentage(item.price, item.oldPrice)}%
              </span>
              <Wishlistheart item={item}/>
              <Addtocardbutton item={item}/>
              <div className="text-start pl-5 border-t-[1px] border-gray-400 py-2">
                <h3 className="text-lg font-bold break-all ">{item.name || 'Product'}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-red-500">TK.{item.price || ''}</p>
                  <p className="text-gray-500 text-[13px] lg:text-sm line-through">TK.{item.oldPrice || ''}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      {/* //////////////////ALL Products////////////////////// */}
    </div>
  )
}

export default page