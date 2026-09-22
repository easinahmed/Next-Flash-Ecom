"use client"
import Image from "next/image"
import logo from "@/images/icon_light.png"
import Link from "next/link"
import { Mail, MapPin, PhoneOutgoing } from "lucide-react"

const Footer = () => {
    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    *{
                        font-family: "Geist", sans-serif;
                    }
                `}
            </style>

            <footer className='flex flex-col justify-end bg-gray-900 shadow-2xl pt-10 px-4 sm:px-6 lg:px-8 overflow-hidden w-full mt-15'>
                <div className='w-full max-w-7xl mx-auto'>
                    <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">

                        <div className="w-full md:w-[45%] lg:w-[35%] flex flex-col items-start text-left">
                            <Image className=" h-20 lg:h-28 w-27 lg:w-40 rotate-4 ml-5 pb-3"
                                src={logo}
                                alt="Logo"
                                width={157}
                                height={40}
                            />
                            <div className='w-full max-w-52 h-0.5 bg-linear-to-r from-[#fbfbfc] dark:to-[#24212D]/0 '></div>
                            <p className='text-sm text-white mt-6 mb-4 max-w-[350px] leading-relaxed'>Flash is an e-commerce platform dedicated to providing safe and reliable Fashon to every home. </p>
                            <div>
                                <p className=" flex items-center justify-start gap-3 text-white "><MapPin /> Mirpur 11 ,Dhaka, Bangladesh </p>
                                <p className=" flex items-center justify- gap-3 text-white mt-4 "> <PhoneOutgoing /> +8801790535599 </p>
                                <p className=" flex items-center justify-start gap-3 text-white mt-4 "> <Mail /> flashsupport@gmail.com </p>
                            </div>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-2 text-white font-bold leading-5 border-b-1 '>Information</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                <Link href="/aboutus" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>About us</Link>
                                <Link href="/contactus" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Contact us</Link>
                                <Link href="/privacy" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Privacy Policy</Link>
                                <Link href="/compamyinformation" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Company Information
                                </Link>
                                <Link href="/terms" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Terms and Conditions</Link>
                                <Link href="/refund" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Refund & Return Policy
                                </Link>
                            </div>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-2 text-white font-bold leading-5 border-b-1 '>Social Links</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                <Link href="/" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Facebook</Link>
                                <Link href="/" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Instagram</Link>
                                <Link href="/" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Youtube</Link>
                                <Link href="/" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>TikTok</Link>
                                <Link href="/" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Twitter</Link>
                            </div>
                        </div>

                        <div className="w-[45%] md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-2 text-white font-bold leading-5 border-b-1 '>Support</h3>
                            <div className="flex flex-col gap-2 mt-6">
                                <Link href="/supportcenter" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Support Center</Link>
                                <Link href="/ordertracking" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Order Tracking
                                </Link>
                                <Link href="/howtoorder" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'> How To Order </Link>
                                <Link href="/shippingdelivery" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Shipping & Delivery</Link>
                                <Link href="/payment" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>Payment Policy</Link>
                                <Link href="/faq" className='text-white hover:text-red-600 dark:hover:text-red-600 transition-colors'>FAQ</Link>
                            </div>
                        </div>

                    </div>

                    <div className='w-full h-0.5 mt-4 mb-4 bg-linear-to-r via-[#f4f4f5] dark:to-[#24212D]/0'></div>

                    <div className=" sm:flex-row items-center justify-between relative z-10">
                        <p className='text-xs text-center text-white '>© {new Date().getFullYear()} FLASH COMFORT. All rights reserved.</p>
                    </div>

                    <div className="relative ">
                        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl h-full max-h-64 bg-green-500 rounded-full blur-[170px] pointer-events-none" />
                        <h3 className="text-center font-extrabold leading-[0.7] text-transparent text-[clamp(3rem,10vw,8rem)] text-nowrap [-webkit-text-stroke:1px_#0D542B] mt-6" >
                            FLASH COMFORT
                        </h3>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer