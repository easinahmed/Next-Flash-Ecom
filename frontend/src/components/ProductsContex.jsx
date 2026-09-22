'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct as apiCreateProduct, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct } from '@/lib/api';
import toast from 'react-hot-toast';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const addProduct = async (productData) => {
    try {
      const created = await apiCreateProduct(productData);
      toast.success('Product created successfully');
      refreshProducts();
      return created;
    } catch (err) {
      toast.error(err.message || 'Failed to create product');
      throw err;
    }
  };

  const editProduct = async (id, productData) => {
    try {
      const updated = await apiUpdateProduct(id, productData);
      toast.success('Product updated successfully');
      refreshProducts();
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
      throw err;
    }
  };

  const removeProduct = async (id) => {
    try {
      await apiDeleteProduct(id);
      toast.success('Product deleted successfully');
      refreshProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
      throw err;
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        refreshProducts,
        addProduct,
        editProduct,
        removeProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
}
