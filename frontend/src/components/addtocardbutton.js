'use client';

import React from 'react';
import { useCart } from './CartContext';

const Addtocardbutton = ({ item }) => {
    const { toggleCartItem, isItemInCart } = useCart();
    
    const itemId = item?.id || `${item?.name || item?.title}-${typeof item?.image === 'string' ? item?.image : item?.image?.src || item?.thumbnail}-${item?.price}`;
    const inCart = item ? isItemInCart(itemId) : false;

    const handleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!item) return;
        toggleCartItem(item);
    };

    return (
        <div>
            <button 
                type="button"
                onClick={handleClick}
                aria-label={inCart ? 'Remove from cart' : 'Add to cart'}
                className={`${inCart ? 'bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-700' : 'bg-gray-900 hover:bg-red-800 dark:bg-gray-700'} text-white w-full py-2 h-full cursor-pointer transition duration-300 font-medium text-sm`}
            >
                {inCart ? 'Added ✓' : 'Add to Cart'}
            </button>
        </div>
    );
};

export default Addtocardbutton;