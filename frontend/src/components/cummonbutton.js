import React, { useState } from 'react';

const Cummonbutton = () => {
  const [selectedSize, setSelectedSize] = useState(null);

  const products = [
    {
      sizes: ['40', '42', '38'],
    },
  ];

  const _items = products.map((product, idx) => {
    return {
      id: idx,
      ...product,
    };
  });

  const handleSizeClick = (size) => {
    setSelectedSize((prevSize) => (prevSize === size ? null : size));
  };

  return (
    <div>
      {_items.map((item) => (
        <div key={item.id}>
          <div className="flex items-start justify-start gap-2 text-black dark:text-white pb-1 ">
            {item.sizes.map((size) => (
              <button
                key={size}
                className={`text-center border border-gray-400 px-2 lg:px-3 lg:py-1 rounded-md cursor-pointer transition-colors ${
                  selectedSize === size
                    ? 'bg-green-600 text-black border-green-600'
                    : 'bg-transparent text-gray-800 dark:text-white'
                }`}
                onClick={() => handleSizeClick(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cummonbutton;