'use client';

import lightLogo from "@/images/icon_light.png";
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  X,
  User,
  UserPlus,
  ShoppingBag,
  XCircle,
  Star,
  LogOut,
  ChevronDown,
  ContactRound,
  Moon,
  Sun,
  SunDim,
  Trash2,
  Navigation,
  CircleX,
  MapPinned,
} from 'lucide-react';
import Image from 'next/image';
import { useCart } from './CartContext';

export default function Navbar({
  currentUser = null,
  onLogout,
  wishlistCount = 0,
  cartCount = 0,
}) {
  const navbarRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const {
    stoppingItems: items,
    updateStoppingQuantity,
    removeStoppingItem,
    checkoutStoppingItems,
    stoppingCount,
    wishlistCount: sharedWishlistCount,
  } = useCart();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [mobileMoodOpen, setMobileMoodOpen] = useState(false);

  const accountMenuRef = useRef(null);
  const mobileAccountRef = useRef(null);
  const mobileMoodRef = useRef(null);

  function SectionTitle({ children }) {
    return (
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-gray-800">
        <span className="h-4 w-[3px] rounded-sm bg-orange-500" />
        {children}
      </h2>
    );
  }

  // ---- theme handling -----------------------------------------------
  useLayoutEffect(() => {
    const html = document.documentElement;
    const storedTheme = window.localStorage.getItem('theme');
    const theme = storedTheme === 'dark'
      ? 'dark'
      : storedTheme === 'light'
        ? 'light'
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

    setIsDark(theme === 'dark');
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    window.localStorage.setItem('theme', theme);
    setIsThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!isThemeLoaded) return;
    const html = document.documentElement;
    const theme = isDark ? 'dark' : 'light';
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    window.localStorage.setItem('theme', theme);
  }, [isDark, isThemeLoaded]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleQty = (id, direction) => updateStoppingQuantity(id, direction);
  const handleRemove = (id) => removeStoppingItem(id);

  const handleViewCart = (drawerId) => (event) => {
    event.preventDefault();
    const drawer = document.getElementById(drawerId);
    if (drawer) drawer.checked = false;
    router.push('/cart');
  };

  const handleCheckout = (drawerId) => (event) => {
    checkoutStoppingItems();
    handleViewCart(drawerId)(event);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setSearchError('I did not search anything.');
      return;
    }

    setSearchError('');
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  // ---- sticky header on scroll ---------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        navbarRef.current?.classList.add('shadow-md');
      } else {
        navbarRef.current?.classList.remove('shadow-md');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---- close dropdowns on outside click -------------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
      if (mobileAccountRef.current && !mobileAccountRef.current.contains(event.target)) {
        setMobileAccountOpen(false);
      }
      if (mobileMoodRef.current && !mobileMoodRef.current.contains(event.target)) {
        setMobileMoodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (onLogout) await onLogout();
      setIsMobileMenuOpen(false);
      setAccountMenuOpen(false);
      setMobileAccountOpen(false);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    import('@/lib/api').then(({ getCategories }) => {
      getCategories().then(setCategories).catch(console.error);
    });
  }, []);

  const dynamicNavLinks = [
    { href: '/', label: 'Home' },
    ...categories.map(c => ({ href: `/category/${c.slug || c.name.toLowerCase().replace(/\\s+/g, '-')}`, label: c.name })),
    { href: '/brands', label: 'Brands' },
    { href: '/discountedproduct', label: 'Discounts' },
    ...(currentUser ? [] : [{ href: '/signin', label: 'Sign In' }]),
  ];

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));
  const themeText = isDark ? 'text-white' : 'text-black';
  const themeIcon = isDark ? 'text-white' : 'text-black';

  return (
    <>
      {/* ---------------- Top promo bar (desktop) ---------------- */}


      {/* ---------------- Top promo bar (mobile) ---------------- */}
      {/* <div className="block lg:hidden bg-gray-600 py-[15px]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] text-amber-50 truncate">
              Summer Sale Free Delivery - OFF 50%!
            </p>
            <Link
              href="/shopnow"
              className="shrink-0 text-[13px] font-semibold text-amber-50 underline underline-offset-1"
            >
              Shop Now
            </Link>
            <select className="self-end bg-gray-500 dark:bg-gray-500 text-amber-50 text-xs shrink-0">
              <option className="bg-white dark:bg-black text-black dark:text-amber-50" value="english">
                EN
              </option>
              <option className="bg-white dark:bg-black text-black dark:text-amber-50" value="bengali">
                BN
              </option>
            </select>
          </div>
        </div>
      </div> */}
      {/* ---------------- Main navbar ---------------- */}
      <nav
        ref={navbarRef}
        className={`sticky top-0 z-50 max-w-full border-b transition-shadow ${isDark ? 'border-gray-700 bg-black' : 'border-gray-200 bg-white'}`}
      >
        <div className="container mx-auto px-4">
          {/* ---- Mobile row ---- */}
          <div className="drawer block lg:hidden">
            <input
              id="flash-mobile-drawer"
              type="checkbox"
              className="drawer-toggle"
              checked={isMobileMenuOpen}
              onChange={() => setIsMobileMenuOpen((v) => !v)}
            />

            <div className="drawer-content">
              <div className="flex items-center justify-between py-4">
                <label
                  htmlFor="flash-mobile-drawer"
                  className="rounded-lg p-2 transition-colors bg-gray-100 dark:bg-gray-800 cursor-pointer"
                  aria-label="Toggle menu"
                >
                  <Menu className={`h-6 w-6 ${themeIcon}`} />
                </label>

                <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                  <Image className=" h-18 w-25 py-1 rotate-4 " src={lightLogo} alt='img' />
                </Link>

                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen((v) => !v);
                      setSearchError('');
                    }}
                    className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                    aria-expanded={isSearchOpen}
                  >
                    {isSearchOpen ? <CircleX color="#ff0000" size={24} className={themeIcon} /> : <Search size={24} className={themeIcon} />}
                  </button>
                  <Link

                    href="/wishlist"

                    className="relative rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Heart fill="#ff0000" size={24} className={themeIcon} strokeWidth={2} />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {sharedWishlistCount}
                    </span>
                  </Link>

                  {/* Mobile */}
                  <div className="drawer drawer-end z-9999">
                    <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content">
                      {/* Page content here */}
                      <label htmlFor="my-drawer-5" className="drawer-button cursor-pointer ">
                        <span className="absolute -right-1 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {stoppingCount}
                        </span>
                        <ShoppingCart size={24} className={themeIcon} strokeWidth={2} />
                      </label>
                    </div>
                    <div className="drawer-side">
                      <label htmlFor="my-drawer-5" aria-label="close sidebar" className="drawer-overlay"></label>
                      <div className="menu flex h-screen min-h-0 w-[min(77vw,28rem)] flex-col bg-white p-4 dark:bg-gray-600">

                        <label
                          htmlFor="my-drawer-5"
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-red-700"
                          aria-label="Close cart drawer"
                        >
                          <X className={`h-5 w-5 ${themeIcon}`} />
                        </label>

                        {/* Order review Mobile */}
                        <section className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl bg-gray-200 p-3 shadow-sm dark:bg-gray-800 sm:p-2">
                          <SectionTitle> <span className=' text-black dark:text-white '>Order Review</span></SectionTitle>
                          <div className="mt-4 divide-y divide-gray-100">
                            {items.map((item) => (
                              <div key={item.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0 sm:flex-nowrap sm:gap-4">
                                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white bg-white dark:bg-gray-700">
                                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-black dark:text-amber-200 font-bold ">{item.name}</p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[12px] text-gray-800 dark:text-white ">Qty:</span>
                                    <div className="flex items-center overflow-hidden rounded-md border border-white">
                                      <button
                                        type="button"
                                        onClick={() => handleQty(item.id, 'dec')}
                                        className="flex h-5 w-5 items-center justify-center bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-400 "
                                        aria-label="Decrease quantity"
                                      >
                                        -
                                      </button>
                                      <span className="flex h-5 w-6 items-center justify-center bg-white dark:bg-gray-600 text-sm text-gray-800 dark:text-white">
                                        {item.qty}
                                      </span>

                                      <div >
                                        <button
                                          type="button"
                                          onClick={() => handleQty(item.id, 'inc')}
                                          className="flex h-5 w-5 items-center justify-center bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-400 "
                                          aria-label="Increase quantity"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className=" flex items-center mt-3" >
                                    <p className="whitespace-nowrap px-2 text-sm text-black dark:text-white font-bold ">
                                      ৳{(item.price * item.qty).toLocaleString()}.00
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => handleRemove(item.id)}
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                      aria-label="Remove item"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {items.length === 0 && (
                              <p className="py-6 text-center text-sm text-gray-500">Your cart is empty.</p>
                            )}
                          </div>
                        </section>

                        {items.length > 0 && (
                          <>
                          <div className="mt-auto">
                            <div className="mt-4 border-t border-gray-300 pt-4 dark:border-gray-50">
                              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                                <span className="font-extrabold">Total</span>
                                <span className="text-base font-extrabold text-black dark:text-white">
                                  ৳{subtotal.toLocaleString()}.00
                                </span>
                              </div>
                            </div>

                            <Link href="/cart" onClick={handleCheckout('my-drawer-5')} className="mt-4 flex flex-col items-center justify-center bg-black py-2 font-extrabold leading-6 text-white dark:bg-white dark:text-black">
                              CHECKOUT
                            </Link>
                          </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Mobile */}

                </div>
              </div>
            </div>

            <div className="drawer-side z-50">
              <label
                htmlFor="my-drawer-1"
                aria-label="close sidebar"
                className="drawer-overlay fixed inset-0 bg-black/50"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <aside className={`menu min-h-full w-72 p-4 text-base-content ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                <div className="mb-4 flex items-center justify-between border-b-1 border-black dark:border-gray-300 pb-6 pt-2 ">
                  <div className="flex items-center gap-2 ">
                    <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                      <Image className=" h-18 w-25 rotate-4 " src={lightLogo} alt='img' />
                    </Link>
                  </div>

                  <label
                    htmlFor="flash-mobile-drawer"
                    className="cursor-pointer rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800"
                    aria-label="Close drawer"
                  >
                    <X className={`h-5 w-5 ${themeIcon}`} />
                  </label>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="relative" ref={mobileMoodRef}>
                    {mobileMoodOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg border border-white bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <button
                          onClick={() => {
                            setIsDark(false);
                            setMobileMoodOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200 dark:hover:bg-gray-950"
                        >
                          Light
                        </button>
                        <button
                          onClick={() => {
                            setIsDark(true);
                            setMobileMoodOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200 dark:hover:bg-gray-950"
                        >
                          Dark
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={mobileAccountRef}>
                    <button
                      type="button"
                      onClick={() => setMobileAccountOpen((v) => !v)}
                      aria-expanded={mobileAccountOpen}
                      aria-haspopup="menu"
                      className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-white cursor-pointer "
                    >
                      Account
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${mobileAccountOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {mobileAccountOpen && (
                      <div className=" left-0 top-full z-10 mt-1 w-full min-w-56 space-y-1 rounded-xl border border-gray-200 bg-white p-2 backdrop-blur-[100px] dark:border-gray-700 dark:bg-gray-800 dark:text-white " role="menu">
                        {currentUser ? (
                          <>
                            <p className="text-sm text-gray-500 dark:text-gray-300">{currentUser.email || currentUser.username}</p>
                            <Link href="/account" className="flex items-center gap-4 p-2 rounded-md border-1 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMobileAccountOpen(false); setIsMobileMenuOpen(false); }}>
                              <User size={20} /> Manage My Account
                            </Link>
                            <Link href="/myorder" className="flex items-center gap-4 p-2 rounded-md border-1 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMobileAccountOpen(false); setIsMobileMenuOpen(false); }}>
                              <ShoppingBag size={20} /> My Order
                            </Link>
                            <Link href="/ordertracking" className="flex items-center gap-4 p-2 rounded-md border-1 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMobileAccountOpen(false); setIsMobileMenuOpen(false); }}>
                              <MapPinned size={20} /> Order Tracking
                            </Link>
                            <Link href="/mycancellation" className="flex items-center gap-4 p-2 rounded-md border-1 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMobileAccountOpen(false); setIsMobileMenuOpen(false); }}>
                              <CircleX size={20} /> My Cancellation
                            </Link>
                            <button onClick={() => { handleLogout(); setMobileAccountOpen(false); setIsMobileMenuOpen(false); }} className="flex w-full items-center gap-4 p-2 rounded-md border-1 border-red-300 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer">
                              <LogOut size={20} /> Log Out
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-500 dark:text-gray-300 pb-1">Please sign in to access your account</p>
                            <Link href="/signin" className="flex items-center gap-4 p-2 rounded-md border-1 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMobileAccountOpen(false); setIsMobileMenuOpen(false); }}>
                              <User size={20} /> Sign In
                            </Link>
                            <Link href="/signup" className="flex items-center gap-4 p-2 rounded-md border-1 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setMobileAccountOpen(false); setIsMobileMenuOpen(false); }}>
                              <UserPlus size={20} /> Create Account
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <ul className="menu w-full space-y-2">
                  {dynamicNavLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block rounded-lg px-4 py-3 text-base font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-950 ${themeText} ${isActive(link.href) ? 'bg-blue-100 dark:bg-slate-600' : ''}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {currentUser && (
                  <button
                    onClick={handleLogout}
                    className="mt-6 w-full rounded-lg border border-red-700 bg-red-700 py-2 font-semibold text-white transition-colors hover:bg-red-600 dark:border-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  >
                    Log Out
                  </button>
                )}

                <button
                  onClick={toggleTheme}
                  className={`inline-flex items-center justify-between gap-2 rounded-full border border-gray-300 px-3 py-2 text-sm font-medium transition mt-10 hover:bg-white dark:border-gray-600 dark:hover:bg-gray-800 cursor-pointer ${isDark ? 'bg-black text-white' : 'bg-blue-200 text-black leading-2 font-bold '}`}
                  aria-label="Toggle light and dark mode "
                >
                  {isDark ? <Moon fill="#FFFF00" className={`h-4 w-4 ${themeIcon}`} /> : <SunDim color="#8B0000" fill="#8B0000" className={`h-4 w-4 ${themeIcon}`} />}
                  {isDark ? 'Dark mode' : 'Light mode'}
                </button>

              </aside>
            </div>
          </div>

          {/* ---- Desktop row ---- */}
          <div className="hidden items-center justify-between gap-12 lg:flex">

            <div className=' flex items-center gap-2' >
              <ContactRound className="hidden dark:block" size={36} color={isDark ? '#ffffff' : '#000000'} />
              <ContactRound className=" dark:hidden" size={36} color={isDark ? '#ffffff' : '#000000'} />
              <h1 className={`text-30 ${themeText} font-extrabold leading-6`} > Customer care: 09666200300 </h1>
            </div>

            <Link href="/" className={`text-2xl font-bold leading-6 ${themeText}`}>
              <Image className=" h-22 w-35 py-1 rotate-4 " src={lightLogo} alt='img' />
            </Link>

            <div className="flex items-center gap-6">
              {/* Search box */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchError('');
                  }}
                  placeholder="What are you looking for?"
                  className="w-56 rounded-lg border border-gray-300 py-2 pl-4 pr-10 text-sm focus:border-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer hover:opacity-80"
                  aria-label="Submit Search"
                >
                  <Search size={20} className={themeIcon} />
                </button>
              </form>

              <div className="flex items-center gap-4">
                <Link href="/wishlist" className="relative rounded-lg p-2 transition-colors hover:bg-gray-300 dark:hover:bg-gray-800">
                  <Heart fill="#ff0000" size={28} className={themeIcon} strokeWidth={2} />

                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {sharedWishlistCount}
                  </span>
                </Link>

                {/* Desktop */}
                <div className="relative rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="drawer drawer-end">
                    <input id="flash-cart-drawer" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content">
                      <label
                        htmlFor="flash-cart-drawer"
                        className="drawer-button block cursor-pointer"
                        aria-label="Shopping cart"
                      >
                        <ShoppingCart size={28} className={themeIcon} strokeWidth={2} />
                      </label>
                    </div>
                    <div className="drawer-side">
                      <label htmlFor="flash-cart-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                      <div className="menu flex h-screen min-h-0 w-[min(100vw,28rem)] flex-col bg-white p-4 dark:bg-gray-600">

                        <label
                          htmlFor="flash-cart-drawer"
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-red-200 dark:hover:bg-red-500 "
                          aria-label="Close cart drawer"
                        >
                          <X className={`h-5 w-5 ${themeIcon}`} />
                        </label>

                        {/* Order review Dasktop */}
                        <section className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl bg-gray-200 p-4 shadow-sm dark:bg-gray-800 sm:p-6">
                          <SectionTitle> <span className=' text-black dark:text-white '>Order Review</span></SectionTitle>
                          {/* Product */}
                          <div className="mt-4 divide-y divide-gray-100 ">
                            {items.map((item) => (
                              <div key={item.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0 sm:flex-nowrap sm:gap-4">
                                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white bg-white dark:bg-gray-700">
                                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-black dark:text-amber-200 font-bold ">{item.name}</p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm text-gray-700 dark:text-white ">Qty:</span>
                                    <div className="flex items-center overflow-hidden rounded-md border border-white">
                                      <button
                                        type="button"
                                        onClick={() => handleQty(item.id, 'dec')}
                                        className="flex h-7 w-7 items-center justify-center bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-400 "
                                        aria-label="Decrease quantity"
                                      >
                                        -
                                      </button>
                                      <span className="flex h-7 w-8 items-center justify-center bg-white dark:bg-gray-600 text-sm text-black dark:text-white">
                                        {item.qty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQty(item.id, 'inc')}
                                        className="flex h-7 w-7 items-center justify-center bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-400 "
                                        aria-label="Increase quantity"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <p className="whitespace-nowrap px-2 text-sm text-black dark:text-white font-bold ">
                                  ৳{(item.price * item.qty).toLocaleString()}.00
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleRemove(item.id)}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer "
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            {items.length === 0 && (
                              <p className="py-6 text-center text-sm text-gray-500">Your cart is empty.</p>
                            )}
                          </div>
                          {/* Product */}
                        </section>

                        {items.length > 0 && (
                          <>
                          <div className="mt-auto">
                            <div className="mt-4 border-t border-gray-300 pt-4 dark:border-gray-100">
                              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                                <span className="font-medium">Total</span>
                                <span className="text-base font-extrabold text-black dark:text-white">
                                  ৳{subtotal.toLocaleString()}.00
                                </span>
                              </div>
                            </div>

                            <Link href="/cart" onClick={handleCheckout('flash-cart-drawer')} className="mt-4 flex flex-col items-center justify-center bg-black py-2 font-extrabold leading-6 text-white dark:bg-white dark:text-black">
                              CHECKOUT
                            </Link>
                            </div>
                          </>
                        )}

                      </div>
                    </div>
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {stoppingCount}
                  </span>
                </div>
                {/* Desktop */}

                {/* Account dropdown (desktop) */}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        router.push('/signin');
                        return;
                      }
                      setAccountMenuOpen((v) => !v);
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer ${accountMenuOpen ? (isDark ? 'bg-black text-white' : 'bg-white text-black') : 'hover:bg-gray-300 dark:hover:bg-gray-800'} ${themeIcon}`}
                    aria-label="Account menu"
                  >
                    <User size={22} className={themeIcon} />
                  </button>
                  {accountMenuOpen && currentUser && (
                    <div className={`absolute right-0 mt-2 min-w-56 space-y-3 rounded-xl border-none py-4 pl-5 pr-3 backdrop-blur-[100px] ${isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-black'}`}>
                      <p className="text-sm text-gray-400 dark:text-gray-300">{currentUser.email || currentUser.username}</p>
                      <Link href="/account" className="flex items-center gap-4 hover:text-red-500 transition-colors" onClick={() => setAccountMenuOpen(false)}>
                        <User size={22} /> Manage My Account
                      </Link>
                      <Link href="/ordertracking" className="flex items-center gap-4 hover:text-red-500 transition-colors" onClick={() => setAccountMenuOpen(false)}>
                        <MapPinned size={22} /> Order Tracking
                      </Link>
                      <Link href="/myorder" className="flex items-center gap-4 hover:text-red-500 transition-colors" onClick={() => setAccountMenuOpen(false)}>
                        <ShoppingBag size={22} /> My Order
                      </Link>
                      <Link href="/mycancellation" className="flex items-center gap-4 hover:text-red-500 transition-colors" onClick={() => setAccountMenuOpen(false)}>
                        <CircleX size={22} /> My Cancellation
                      </Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-4 cursor-pointer text-red-500 hover:text-red-600 transition-colors">
                        <LogOut size={22} /> Log Out
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  className={`inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 cursor-pointer ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
                  aria-label="Toggle light and dark mode"
                >
                  {isDark ? <Moon className={`h-4 w-4 ${themeIcon}`} /> : <Sun className={`h-4 w-4 ${themeIcon}`} />}
                  {isDark ? 'Dark mode' : 'Light mode'}
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* ---------------- Mobile search dropdown ---------------- */}
        {isSearchOpen && (
          <div className="border-b border-white bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 lg:hidden">
            <div className="container mx-auto px-4 py-6">
              <div className="mx-auto max-w-2xl">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="What are you looking for?"
                      className="w-full rounded-full border-2 border-gray-300 px-6 py-4 pr-12 text-lg focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                      autoFocus
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setSearchError('');
                      }}
                    />
                    <button
                      type="submit"
                      className=" absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 ml-9 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      aria-label="Search"
                    >
                      <Search className={`h-6 w-6 ${themeIcon}`} />
                    </button>
                  </div>
                  {searchError && (
                    <p className="mt-2 px-4 text-sm text-red-600 dark:text-red-400" role="alert">
                      {searchError}
                    </p>
                  )}
                </form>

              </div>
            </div>
          </div>
        )}

        <div className={`hidden lg:block py-[15px] ${isDark ? 'bg-slate-800' : 'bg-gray-300'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-10">
              {dynamicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[16px] font-medium leading-6 transition-colors hover:text-red-700 ${themeText} ${isActive(link.href) ? `border-b-2 ${isDark ? 'border-white' : 'border-black'}` : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

          </div>
        </div>

      </nav>

    </>
  );
}