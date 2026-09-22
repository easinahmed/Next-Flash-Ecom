"use client"
import React from 'react'
import Choosesneakers from '@/components/Choosesneakers'
import Link from 'next/link'

export default function ChooseSneakersPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-start gap-2">
        <Link href="/"><p className="text-sm cursor-pointer hover:underline">Home</p></Link>
        <p className="text-sm">/</p>
        <p className="text-sm text-green-700 font-medium">Choose Sneakers</p>
      </div>
      <Choosesneakers showSeeAll={false} />
    </div>
  )
}