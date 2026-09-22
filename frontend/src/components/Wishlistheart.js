'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from './CartContext'

const Wishlistheart = ({ item }) => {
  const { toggleWishlist, isWishlisted: checkIsWishlisted } = useCart()
  const [localIsWishlisted, setLocalIsWishlisted] = useState(false)
  const itemId = item?.id || `${item?.name}-${item?.image?.src || item?.image}-${item?.price}`
  const isWishlisted = item ? checkIsWishlisted(itemId) : localIsWishlisted

  const handleClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (item) toggleWishlist(item)
    else setLocalIsWishlisted((current) => !current)
  }

  return (
    <button
    className=' cursor-pointer '
      type='button'
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isWishlisted}
      onClick={handleClick}
    >
      <Heart
        className='absolute hidden lg:block top-7 right-5'
        color={isWishlisted ? '#ef4444' : '#000000'}
        fill={isWishlisted ? '#ef4444' : 'none'}
        size={30}
        strokeWidth={2}
      />
      <Heart
        className='absolute lg:hidden top-7 right-5'
        color={isWishlisted ? '#ef4444' : '#000000'}
        fill={isWishlisted ? '#ef4444' : 'none'}
        size={25}
        strokeWidth={2}
      />
    </button>
  )
}

export default Wishlistheart
