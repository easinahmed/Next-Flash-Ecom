"use client"
import React, { useEffect, useState } from 'react'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import Link from 'next/link'
import Shopcategories from '@/components/shopcategories'
import WhatsApp from '@/components/whatsapp'
import ProductLink from '@/components/ProductLink'
import { fetchCategories, fetchProducts, fetchProductsByCategory } from '@/services/dummyjson'

const ShopNowPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(console.error)
  }, [])

  useEffect(() => {
    let active = true
    const request = selectedCategory === 'all'
      ? fetchProducts({ limit: 100 })
      : fetchProductsByCategory(selectedCategory, { limit: 100 })
    request.then((data) => { if (active) setItems(data.products || []) }).catch(console.error).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [selectedCategory])

  return (
    <div className="container mx-auto px-4 py-4">

      <div className=' flex items-center justify-start gap-2 mb-7' >
        <Link href={'/'} > <p className=' text-sm cursor-pointer ' >Home</p> </Link>
        <p className=' text-sm cursor-pointer ' >/</p>
        <p className=' text-sm cursor-pointer text-green-700 ' >Shopnow</p>
      </div>

      <div>
        <Shopcategories selectedCategory={selectedCategory} categories={categories} onCategoryChange={setSelectedCategory} />
      </div>

      <div className="container flex items-center justify-between ">

        <div className=" flex items-center justify-center " >
          <div className="h-[20px] w-[20px] bg-red-700 mb-4 rounded-3xl " />
          <h2 className=" text-lg lg:text-2xl font-bold mb-4 ml-2 ">{selectedCategory === 'all' ? 'All Products' : categories.find((category) => (category.slug || category.name) === selectedCategory)?.name || 'Products'}</h2>
        </div>
      </div>

      {loading ? <div className="py-12 text-center text-gray-500">Loading products...</div> : <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div className={'cursor-pointer border-1 rounded-3xl border-gray-400/20 min-h-fit shadow-2xs overflow-hidden '} key={item.id}>
            <div className=" relative items-center justify-center rounded-3xl overflow-hidden">
              <ProductLink item={item}><img className=" w-full h-56 object-cover rounded-t-3xl " src={item.image} alt={item.name} /></ProductLink>
              {item.discountPercentage > 0 && <span className="absolute top-3 left-3 text-white text-[10px] font-poppins px-3 py-1 font-bold border-1 bg-red-700 rounded-3xl">-{item.discountPercentage}%</span>}
              <Wishlistheart item={item} />
              <Addtocardbutton item={item} />
              <ProductLink item={item}><div className="text-start pl-5 border-t-[1px] border-gray-400 py-2">
                <h3 className="text-lg font-bold break-all ">{item.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-red-500">৳{item.price}</p>
                  {item.oldPrice > item.price && <p className="text-gray-500 text-[13px] lg:text-sm line-through">৳{item.oldPrice}</p>}
                </div>
              </div></ProductLink>
            </div>
          </div>
        ))}
      </div>}
      <WhatsApp/>
    </div>
  )
}

export default ShopNowPage