import { getProducts, getProductById as apiGetProductById, getCategories as apiGetCategories } from '@/lib/api';

export function normalizeProduct(item) {
  if (!item) return null;
  const id = item._id || item.id;
  const price = typeof item.price === 'number' ? item.price : Number.parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0;
  const originalPrice = Number(item.originalPrice ?? item.oldPrice ?? 0);
  const discountPercentage = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : Number(item.discountPercentage || 0);

  const imagesList = Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : [typeof item.image === 'string' ? item.image : item.thumbnail || '/shoe1.avif'];

  const thumbnailImage = item.thumbnail || item.image || imagesList[0] || '/shoe1.avif';

  return {
    id: id,
    _id: id,
    name: item.name || item.title || 'Product',
    title: item.title || item.name || 'Product',
    price: price,
    originalPrice,
    oldPrice: originalPrice,
    discountPercentage,
    rating: item.rating || 4.8,
    brand: item.brand || 'Flash Shoe',
    category: item.category || 'sneakers',
    gender: item.gender || '',
    description: item.description || 'High quality item from our collection.',
    images: imagesList,
    image: thumbnailImage,
    colors: Array.isArray(item.colors) ? item.colors : [],
    sizes: Array.isArray(item.sizes) ? item.sizes : [],
    stock: item.stock ?? 15,
    bestSeller: item.bestSeller || false,
    justLanded: item.justLanded || false,
    accessories: item.accessories || false,
    featured: item.featured || false,
    reviews: item.reviews || [],
  };
}

export async function fetchProducts({ limit = 50, skip = 0, category = '', brand = '', gender = '', discounted = false, justLanded = false, bestSeller = false, accessories = false, search = '', sortBy = '', order = '' } = {}) {
  try {
    const params = {};
    if (category) params.category = category;
    if (brand) params.brand = brand;
    if (gender) params.gender = gender;
    if (discounted) params.discounted = 'true';
    if (justLanded) params.justLanded = 'true';
    if (bestSeller) params.bestSeller = 'true';
    if (accessories) params.accessories = 'true';
    if (search) params.search = search;

    const rawList = await getProducts(params);
    const normalized = (Array.isArray(rawList) ? rawList : []).map(normalizeProduct).filter(Boolean);

    return {
      products: normalized,
      total: normalized.length,
      skip: skip,
      limit: limit,
    };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return { products: [], total: 0, skip: 0, limit: 0 };
  }
}

export async function fetchProductById(id) {
  if (!id) return null;
  try {
    const item = await apiGetProductById(id);
    if (!item) return null;
    return normalizeProduct(item);
  } catch (error) {
    console.error(`Error in fetchProductById(${id}):`, error);
    return null;
  }
}

export async function fetchCategories() {
  try {
    const cats = await apiGetCategories();
    return cats || [];
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    return [];
  }
}

export async function fetchProductsByCategory(categorySlug, { limit = 50, skip = 0, justLanded = false } = {}) {
  return fetchProducts({ category: categorySlug, limit, skip, justLanded });
}

export async function searchProducts(query, { limit = 50 } = {}) {
  if (!query || !query.trim()) return { products: [], total: 0 };
  const res = await fetchProducts({ search: query.trim(), limit });
  return {
    products: res.products,
    total: res.products.length,
  };
}
