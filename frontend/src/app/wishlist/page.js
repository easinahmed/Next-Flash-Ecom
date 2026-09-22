"use client"
import React, { useState } from 'react'
import { Heart } from 'lucide-react'
import Saggation from '@/components/Saggation'
import Addtocardbutton from '@/components/addtocardbutton'
import Wishlistheart from '@/components/Wishlistheart'
import { useCart } from '@/components/CartContext'

const page = () => {
  const { wishlistItems: items, removeAllWishlistItems } = useCart()
  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 16
  const totalPages = Math.ceil(items.length / productsPerPage)
  const visibleItems = items.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage,
  )

  const goToPreviousPage = () => setCurrentPage((pageNumber) => Math.max(0, pageNumber - 1))
  const goToNextPage = () => setCurrentPage((pageNumber) => Math.min(totalPages - 1, pageNumber + 1))

  const handleRemoveAll = () => {
    removeAllWishlistItems()
    setCurrentPage(0)
  }

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="container flex items-center justify-between ">

        <div className=" flex items-center justify-center " >
          <Heart size={28} fill='#fc0303' color="#fc0303" strokeWidth={1} className=' mb-4' />
          <h2 className=" text-lg lg:text-2xl font-bold mb-4 ml-2 ">Your Fevriout item </h2>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleRemoveAll}
            className="mb-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Remove All
          </button>
        )}

      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleItems.map((item) => (
          <div className={'cursor-pointer border-1 rounded-3xl border-gray-400/20 min-h-fit shadow-2xs '} key={item.id}>
            <div className=" relative items-center justify-center rounded-3xl overflow-hidden">
              <img className=" w-full h-full lg:w-full lg:h-full object-cover rounded-t-3xl " src={item.image} alt={item.name} />
              <Addtocardbutton item={item}/>
             <Wishlistheart item={item}/>
              <div className=" text-start pl-5 border-t-[1px] border-gray-400 py-2 mt-[-24px] ">
                <h3 className="text-lg font-bold break-all ">{item.name || 'Product'}</h3>
                <p className="text-red-500"> TK.{item.price || ''}</p>
              </div>
            </div>
          </div>
        ))}
      </div> 

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className="bg-gray-900 dark:bg-gray-400 text-white dark:text-black py-1 px-4 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="bg-gray-900 dark:bg-gray-400 text-white dark:text-black py-1 px-4 rounded-lg hover:bg-green-500 transition duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ////////////////Saggation////////////// */}
      <div>
        <Saggation/>
      </div>

    </div>
  )
}

export default page