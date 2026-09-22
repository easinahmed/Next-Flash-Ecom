const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(window.localStorage.getItem('flash-shoe-auth') || 'null');
      if (stored && stored.token) {
        headers['Authorization'] = `Bearer ${stored.token}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return headers;
}

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }
  
  return response.json();
}

/* Products */
export async function getProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/products?${query}` : '/products';
    return await fetchApi(endpoint);
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
}

export async function getProductById(id) {
  try {
    return await fetchApi(`/products/${id}`);
  } catch (error) {
    console.error(`getProductById(${id}) error:`, error);
    return null;
  }
}

export const getProduct = getProductById;

export async function createProduct(productData) {
  return fetchApi('/products', {
    method: 'POST',
    body: productData,
  });
}

export async function updateProduct(id, productData) {
  return fetchApi(`/products/${id}`, {
    method: 'PUT',
    body: productData,
  });
}

export async function deleteProduct(id) {
  return fetchApi(`/products/${id}`, {
    method: 'DELETE',
  });
}

/* Brands */
export async function getBrands() {
  try {
    return await fetchApi('/brands');
  } catch (error) {
    console.error('getBrands error:', error);
    return [];
  }
}

export async function createBrand(data) {
  return fetchApi('/brands', { method: 'POST', body: data });
}

export async function updateBrand(id, data) {
  return fetchApi(`/brands/${id}`, { method: 'PUT', body: data });
}

export async function deleteBrand(id) {
  return fetchApi(`/brands/${id}`, { method: 'DELETE' });
}

/* Reviews */
export async function getProductReviews(productId) {
  return fetchApi(`/reviews/product/${productId}`);
}

export async function submitProductReview(productId, reviewData) {
  return fetchApi(`/reviews/product/${productId}`, {
    method: 'POST',
    body: reviewData,
  });
}

export async function getReviews() {
  return fetchApi('/reviews');
}

export async function updateReviewStatus(reviewId, status) {
  return fetchApi(`/reviews/${reviewId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function deleteReview(reviewId) {
  return fetchApi(`/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}

/* Site content */
export async function getSitePages() {
  return fetchApi('/site-pages');
}

export async function getSitePage(slug) {
  return fetchApi(`/site-pages/${slug}`);
}

export async function updateSitePage(slug, data) {
  return fetchApi(`/site-pages/${slug}`, { method: 'PUT', body: data });
}

/* Categories */
export async function getCategories() {
  try {
    return await fetchApi('/categories');
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
}

export async function createCategory(data) {
  return fetchApi('/categories', {
    method: 'POST',
    body: data,
  });
}

export async function updateCategory(id, data) {
  return fetchApi(`/categories/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteCategory(id) {
  return fetchApi(`/categories/${id}`, {
    method: 'DELETE',
  });
}

/* Orders */
export async function getOrders() {
  try {
    return await fetchApi('/orders');
  } catch (error) {
    console.error('getOrders error:', error);
    return [];
  }
}

export async function createOrder(orderData) {
  return fetchApi('/orders', {
    method: 'POST',
    body: orderData,
  });
}

export async function getOrderById(orderId) {
  if (!orderId) return null;
  try {
    return await fetchApi(`/orders/${encodeURIComponent(orderId)}`);
  } catch (error) {
    console.error(`getOrderById(${orderId}) error:`, error);
    return null;
  }
}

export async function updateOrderStatus(orderId, status, extra = {}) {
  return fetchApi(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status, ...extra },
  });
}

export async function updateOrder(orderId, orderData) {
  return fetchApi(`/orders/${orderId}`, {
    method: 'PUT',
    body: orderData,
  });
}

/* Customers */
export async function getCustomers() {
  try {
    return await fetchApi('/customers');
  } catch (error) {
    console.error('getCustomers error:', error);
    return [];
  }
}

export async function getCustomer(id) {
  try {
    return await fetchApi(`/customers/${id}`);
  } catch (error) {
    console.error(`getCustomer(${id}) error:`, error);
    return null;
  }
}

export async function createCustomer(data) {
  return fetchApi('/customers', {
    method: 'POST',
    body: data,
  });
}

export async function updateCustomer(id, data) {
  return fetchApi(`/customers/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function updateCustomerStatus(id, status) {
  return fetchApi(`/customers/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

/* Hero / CMS Banners */
export async function getHeroBanners() {
  try {
    const response = await fetchApi('/hero');
    return Array.isArray(response) ? response : response.slides || [];
  } catch (error) {
    console.error('getHeroBanners error:', error);
    return [];
  }
}

export async function getHeroBanner() {
  const list = await getHeroBanners();
  return { slides: list };
}

export async function updateHeroBanner(data) {
  return fetchApi('/hero', {
    method: 'PUT',
    body: data,
  });
}

export async function createHeroBanner(bannerData) {
  const current = await getHeroBanners();
  return updateHeroBanner({ slides: [...current, bannerData] });
}

/* Image Upload */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const headers = getAuthHeaders();
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/upload/product-image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }
  return response.json();
}

export async function uploadHeroImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const headers = getAuthHeaders();
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/upload/hero-image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Hero image upload failed');
  }

  return response.json();
}

/* Authentication */
export async function loginUser(email, password) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function registerUser(userData) {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

export async function googleLogin(googleData) {
  return fetchApi('/auth/google', {
    method: 'POST',
    body: googleData,
  });
}

export async function getMe() {
  return fetchApi('/auth/me');
}

export async function changePassword(passwordData) {
  return fetchApi('/auth/password', {
    method: 'PUT',
    body: passwordData,
  });
}

export async function getStaffUsers() {
  return fetchApi('/auth/staff');
}

export async function createStaffUser(staffData) {
  return fetchApi('/auth/staff', {
    method: 'POST',
    body: staffData,
  });
}

/* Courier Integration */
export async function getCourierSettings() {
  return fetchApi('/courier/settings');
}

export async function updateCourierSetting(provider, data) {
  return fetchApi(`/courier/settings/${provider}`, {
    method: 'PUT',
    body: data,
  });
}

export async function testCourierConnection(provider) {
  return fetchApi(`/courier/test/${provider}`, {
    method: 'POST',
  });
}

export async function dispatchOrderToCourier(orderId, provider, options = {}) {
  return fetchApi(`/courier/dispatch/${orderId}`, {
    method: 'POST',
    body: { provider, ...options },
  });
}
