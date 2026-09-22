import Link from 'next/link'

export function getProductHref(item) {
  if (item?.id) {
    return `/product?id=${item.id}`
  }
  const params = new URLSearchParams({
    name: item?.name || item?.title || 'Product',
    price: item?.price || '',
    oldPrice: item?.oldPrice || '',
    image: typeof item?.image === 'string' ? item.image : item?.image?.src || item?.thumbnail || '',
  })

  return `/product?${params.toString()}`
}

const ProductLink = ({ item, children, className = '' }) => (
  <Link href={getProductHref(item)} className={className}>
    {children}
  </Link>
)

export default ProductLink
