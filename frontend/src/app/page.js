"use client"
import Accessories from '@/components/accessories'
import BestSeller from '@/components/bestseller'
import Choosesneakers from '@/components/Choosesneakers'
import Combopack from '@/components/Combopack'
import Products from '@/components/products'
import SwiperCarousel from '@/components/slider'
import WhatsApp from '@/components/whatsapp'
import Youwant from '@/components/youwant'
import React from 'react'
import dynamic from 'next/dynamic'

const JustLanded = dynamic(() => import('@/components/justlanded'), {
  ssr: false,
  loading: () => <div className="container mx-auto min-h-96 px-4 py-8" />,
})

const page = () => {
  return (
    <div>
      <SwiperCarousel/>
      <Products/>
      <BestSeller/>
      <JustLanded/>
      <Combopack/>
      <Youwant/>
      <Accessories/>
      <Choosesneakers/>
      <WhatsApp/>
    </div>
  )
}

export default page