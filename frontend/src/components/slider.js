'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Autoplay } from 'swiper/modules';

// Swiper core + required modules styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';
import { getHeroBanners } from '@/lib/api';

export default function SwiperDemo() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    let active = true;
    getHeroBanners().then((data) => {
      if (active) setSlides(Array.isArray(data) ? data : []);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="relative h-[20vh] w-full sm:h-[70vh] md:h-[35vh] lg:h-[80vh] bg-black">
      {slides.length === 0 ? (
        <div className="h-full w-full bg-neutral-800" aria-label="Loading hero banners" />
      ) : <Swiper
        key={slides.length}
        modules={[Navigation, Pagination, Keyboard, Autoplay]}
        slidesPerView={1}
        spaceBetween={30}
        loop={slides.length > 1}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          stopOnLastSlide: false,
          pauseOnMouseEnter: false,
        }}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        navigation
        breakpoints={{
          // tweak per-breakpoint spacing/slides here if you ever want
          // multiple slides visible on larger screens
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 1, spaceBetween: 30 },
          1024: { slidesPerView: 1, spaceBetween: 30 },
        }}
        className="h-full w-full [--swiper-navigation-color:#fff] [--swiper-pagination-color:#fff]"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide._id || slide.image || i} className="relative bg-neutral-700">
            <Link href={slide.link || '/shopnow'} className="relative block h-full w-full">
            <Image
              src={slide.image}
              alt={slide.title || `Slide ${i + 1}`}
              fill
              sizes="100vw"
              className="object-cover cursor-pointer "
              priority={i === 0}
            />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>}
    </div>
  );
}