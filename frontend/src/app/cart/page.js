'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cashon from "@/images/cashondelivery.svg"
import Card from "@/images/cardpayment.svg"
import Bkash from "@/images/bkashpyment.png"
import Nagad from "@/images/nagadicon.png"
import { useCart } from '@/components/CartContext'
import { createOrder } from '@/lib/api'

const DHAKA_DELIVERY_COST = 70;
const OUTSIDE_DHAKA_DELIVERY_COST = 130;
const GMAIL_PATTERN = /^[^\s@]+@gmail\.com$/i;

// ---------------------------------------------------------------------------
// Bangladesh Districts (English + Bangla names) — flat list, 64 districts
// ---------------------------------------------------------------------------
const DISTRICT = [
  { en: 'Dhaka', bn: 'ঢাকা' },
  { en: 'Faridpur', bn: 'ফরিদপুর' },
  { en: 'Gazipur', bn: 'গাজীপুর' },
  { en: 'Gopalganj', bn: 'গোপালগঞ্জ' },
  { en: 'Kishoreganj', bn: 'কিশোরগঞ্জ' },
  { en: 'Madaripur', bn: 'মাদারীপুর' },
  { en: 'Manikganj', bn: 'মানিকগঞ্জ' },
  { en: 'Munshiganj', bn: 'মুন্সিগঞ্জ' },
  { en: 'Narayanganj', bn: 'নারায়ণগঞ্জ' },
  { en: 'Narsingdi', bn: 'নরসিংদী' },
  { en: 'Rajbari', bn: 'রাজবাড়ী' },
  { en: 'Shariatpur', bn: 'শরীয়তপুর' },
  { en: 'Tangail', bn: 'টাঙ্গাইল' },
  { en: 'Bandarban', bn: 'বান্দরবান' },
  { en: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া' },
  { en: 'Chandpur', bn: 'চাঁদপুর' },
  { en: 'Chattogram', bn: 'চট্টগ্রাম' },
  { en: 'Cumilla', bn: 'কুমিল্লা' },
  { en: "Cox's Bazar", bn: 'কক্সবাজার' },
  { en: 'Feni', bn: 'ফেনী' },
  { en: 'Khagrachari', bn: 'খাগড়াছড়ি' },
  { en: 'Lakshmipur', bn: 'লক্ষ্মীপুর' },
  { en: 'Noakhali', bn: 'নোয়াখালী' },
  { en: 'Rangamati', bn: 'রাঙ্গামাটি' },
  { en: 'Bogura', bn: 'বগুড়া' },
  { en: 'Joypurhat', bn: 'জয়পুরহাট' },
  { en: 'Naogaon', bn: 'নওগাঁ' },
  { en: 'Natore', bn: 'নাটোর' },
  { en: 'Chapainawabganj', bn: 'চাঁপাইনবাবগঞ্জ' },
  { en: 'Pabna', bn: 'পাবনা' },
  { en: 'Rajshahi', bn: 'রাজশাহী' },
  { en: 'Sirajganj', bn: 'সিরাজগঞ্জ' },
  { en: 'Bagerhat', bn: 'বাগেরহাট' },
  { en: 'Chuadanga', bn: 'চুয়াডাঙ্গা' },
  { en: 'Jashore', bn: 'যশোর' },
  { en: 'Jhenaidah', bn: 'ঝিনাইদহ' },
  { en: 'Khulna', bn: 'খুলনা' },
  { en: 'Kushtia', bn: 'কুষ্টিয়া' },
  { en: 'Magura', bn: 'মাগুরা' },
  { en: 'Meherpur', bn: 'মেহেরপুর' },
  { en: 'Narail', bn: 'নড়াইল' },
  { en: 'Satkhira', bn: 'সাতক্ষীরা' },
  { en: 'Barguna', bn: 'বরগুনা' },
  { en: 'Barishal', bn: 'বরিশাল' },
  { en: 'Bhola', bn: 'ভোলা' },
  { en: 'Jhalokati', bn: 'ঝালকাঠি' },
  { en: 'Patuakhali', bn: 'পটুয়াখালী' },
  { en: 'Pirojpur', bn: 'পিরোজপুর' },
  { en: 'Habiganj', bn: 'হবিগঞ্জ' },
  { en: 'Moulvibazar', bn: 'মৌলভীবাজার' },
  { en: 'Sunamganj', bn: 'সুনামগঞ্জ' },
  { en: 'Sylhet', bn: 'সিলেট' },
  { en: 'Dinajpur', bn: 'দিনাজপুর' },
  { en: 'Gaibandha', bn: 'গাইবান্ধা' },
  { en: 'Kurigram', bn: 'কুড়িগ্রাম' },
  { en: 'Lalmonirhat', bn: 'লালমনিরহাট' },
  { en: 'Nilphamari', bn: 'নীলফামারী' },
  { en: 'Panchagarh', bn: 'পঞ্চগড়' },
  { en: 'Rangpur', bn: 'রংপুর' },
  { en: 'Thakurgaon', bn: 'ঠাকুরগাঁও' },
  { en: 'Jamalpur', bn: 'জামালপুর' },
  { en: 'Mymensingh', bn: 'ময়মনসিংহ' },
  { en: 'Netrokona', bn: 'নেত্রকোনা' },
  { en: 'Sherpur', bn: 'শেরপুর' },
];

// Sample Police Station (Thana) names per district, in English + Bangla.
// This is illustrative only — swap in your full dataset (or fetch it from an
// API keyed by district) for production use. The picker below also lets the
// customer type a name that isn't in the list, so coverage gaps aren't a dead end.
const POLICE_STATION_BY_DISTRICT = {
  Dhaka: [
    { en: 'Adabor', bn: 'আদাবর' },
    { en: 'Badda', bn: 'বাড্ডা' },
    { en: 'Banani', bn: 'বনানী' },
    { en: 'Bangshal', bn: 'বংশাল' },
    { en: 'Bimanbandar', bn: 'বিমানবন্দর' },
    { en: 'Cantonment', bn: 'ক্যান্টনমেন্ট' },
    { en: 'Chawkbazar', bn: 'চকবাজার' },
    { en: 'Dakshinkhan', bn: 'দক্ষিণখান' },
    { en: 'Darus Salam', bn: 'দারুস সালাম' },
    { en: 'Demra', bn: 'ডেমরা' },
    { en: 'Dhanmondi', bn: 'ধানমন্ডি' },
    { en: 'Gendaria', bn: 'গেন্ডারিয়া' },
    { en: 'Gulshan', bn: 'গুলশান' },
    { en: 'Hatirjheel', bn: 'হাতিরঝিল' },
    { en: 'Hazaribagh', bn: 'হাজারীবাগ' },
    { en: 'Jatrabari', bn: 'যাত্রাবাড়ী' },
    { en: 'Kadamtali', bn: 'কদমতলী' },
    { en: 'Kafrul', bn: 'কাফরুল' },
    { en: 'Kalabagan', bn: 'কলাবাগান' },
    { en: 'Kamrangirchar', bn: 'কামরাঙ্গীরচর' },
    { en: 'Khilgaon', bn: 'খিলগাঁও' },
    { en: 'Khilkhet', bn: 'খিলক্ষেত' },
    { en: 'Kotwali', bn: 'কোতোয়ালি' },
    { en: 'Lalbagh', bn: 'লালবাগ' },
    { en: 'Mirpur', bn: 'মিরপুর' },
    { en: 'Mohammadpur', bn: 'মোহাম্মদপুর' },
    { en: 'Motijheel', bn: 'মতিঝিল' },
    { en: 'Mugda', bn: 'মুগদা' },
    { en: 'New Market', bn: 'নিউমার্কেট' },
    { en: 'Pallabi', bn: 'পল্লবী' },
    { en: 'Paltan', bn: 'পল্টন' },
    { en: 'Ramna', bn: 'রমনা' },
    { en: 'Rampura', bn: 'রামপুরা' },
    { en: 'Rupnagar', bn: 'রূপনগর' },
    { en: 'Sabujbagh', bn: 'সবুজবাগ' },
    { en: 'Shah Ali', bn: 'শাহ আলী' },
    { en: 'Shahbagh', bn: 'শাহবাগ' },
    { en: 'Shahjahanpur', bn: 'শাহজাহানপুর' },
    { en: 'Sher-e-Bangla Nagar', bn: 'শেরেবাংলা নগর' },
    { en: 'Shyampur', bn: 'শ্যামপুর' },
    { en: 'Sutrapur', bn: 'সূত্রাপুর' },
    { en: 'Tejgaon', bn: 'তেজগাঁও' },
    { en: 'Tejgaon Industrial Area', bn: 'তেজগাঁও শিল্পাঞ্চল' },
    { en: 'Turag', bn: 'তুরাগ' },
    { en: 'Uttara East', bn: 'উত্তরা পূর্ব' },
    { en: 'Uttara West', bn: 'উত্তরা পশ্চিম' },
    { en: 'Uttar Khan', bn: 'উত্তরখান' },
    { en: 'Vasantek', bn: 'ভাসানটেক' },
    { en: 'Vatara', bn: 'ভাটারা' },
    { en: 'Wari', bn: 'ওয়ারী' },
  ],
  Faridpur: [
    { en: 'Faridpur Sadar', bn: 'ফরিদপুর সদর' },
    { en: 'Boalmari', bn: 'বোয়ালমারী' },
    { en: 'Alfadanga', bn: 'আলফাডাঙ্গা' },
    { en: 'Madhukhali', bn: 'মধুখালী' },
    { en: 'Bhanga', bn: 'ভাঙ্গা' },
    { en: 'Nagarkanda', bn: 'নগরকান্দা' },
    { en: 'Charbhadrasan', bn: 'চরভদ্রাসন' },
    { en: 'Sadarpur', bn: 'সদরপুর' },
    { en: 'Saltha', bn: 'সালথা' },
  ],
  Gazipur: [
    { en: 'Gazipur Sadar', bn: 'গাজীপুর সদর' },
    { en: 'Kaliakair', bn: 'কালিয়াকৈর' },
    { en: 'Kapasia', bn: 'কাপাসিয়া' },
    { en: 'Sreepur', bn: 'শ্রীপুর' },
    { en: 'Kaliganj', bn: 'কালীগঞ্জ' },
  ],
  Gopalganj: [
    { en: 'Gopalganj Sadar', bn: 'গোপালগঞ্জ সদর' },
    { en: 'Kashiani', bn: 'কাশিয়ানী' },
    { en: 'Muksudpur', bn: 'মুকসুদপুর' },
    { en: 'Kotalipara', bn: 'কোটালিপাড়া' },
    { en: 'Tungipara', bn: 'টুঙ্গিপাড়া' },
  ],
  Kishoreganj: [
    { en: 'Kishoreganj Sadar', bn: 'কিশোরগঞ্জ সদর' },
    { en: 'Hossainpur', bn: 'হোসেনপুর' },
    { en: 'Pakundia', bn: 'পাকুন্দিয়া' },
    { en: 'Katiadi', bn: 'কটিয়াদী' },
    { en: 'Bajitpur', bn: 'বাজিতপুর' },
    { en: 'Bhairab', bn: 'ভৈরব' },
    { en: 'Kuliarchar', bn: 'কুলিয়ারচর' },
    { en: 'Tarail', bn: 'তাড়াইল' },
    { en: 'Karimganj', bn: 'করিমগঞ্জ' },
    { en: 'Itna', bn: 'ইটনা' },
    { en: 'Mithamain', bn: 'মিঠামইন' },
    { en: 'Ashtagram', bn: 'অষ্টগ্রাম' },
    { en: 'Nikli', bn: 'নিকলী' },
  ],
  Madaripur: [
    { en: 'Madaripur Sadar', bn: 'মাদারীপুর সদর' },
    { en: 'Shibchar', bn: 'শিবচর' },
    { en: 'Kalkini', bn: 'কালকিনি' },
    { en: 'Rajoir', bn: 'রাজৈর' },
    { en: 'Dasar', bn: 'ডাসার' },
  ],
  Manikganj: [
    { en: 'Manikganj Sadar', bn: 'মানিকগঞ্জ সদর' },
    { en: 'Singair', bn: 'সিংগাইর' },
    { en: 'Shibalaya', bn: 'শিবালয়' },
    { en: 'Saturia', bn: 'সাটুরিয়া' },
    { en: 'Harirampur', bn: 'হরিরামপুর' },
    { en: 'Ghior', bn: 'ঘিওর' },
    { en: 'Daulatpur', bn: 'দৌলতপুর' },
  ],
  Munshiganj: [
    { en: 'Munshiganj Sadar', bn: 'মুন্সিগঞ্জ সদর' },
    { en: 'Sirajdikhan', bn: 'সিরাজদিখান' },
    { en: 'Tongibari', bn: 'টংগীবাড়ী' },
    { en: 'Srinagar', bn: 'শ্রীনগর' },
    { en: 'Lohajang', bn: 'লৌহজং' },
    { en: 'Gazaria', bn: 'গজারিয়া' },
  ],
  Narayanganj: [
    { en: 'Narayanganj Sadar', bn: 'নারায়ণগঞ্জ সদর' },
    { en: 'Bandar', bn: 'বন্দর' },
    { en: 'Rupganj', bn: 'রূপগঞ্জ' },
    { en: 'Sonargaon', bn: 'সোনারগাঁও' },
    { en: 'Araihazar', bn: 'আড়াইহাজার' },
  ],
  Narsingdi: [
    { en: 'Narsingdi Sadar', bn: 'নরসিংদী সদর' },
    { en: 'Belabo', bn: 'বেলাবো' },
    { en: 'Monohardi', bn: 'মনোহরদী' },
    { en: 'Palash', bn: 'পলাশ' },
    { en: 'Raipura', bn: 'রায়পুরা' },
    { en: 'Shibpur', bn: 'শিবপুর' },
  ],
  Rajbari: [
    { en: 'Rajbari Sadar', bn: 'রাজবাড়ী সদর' },
    { en: 'Goalanda', bn: 'গোয়ালন্দ' },
    { en: 'Pangsha', bn: 'পাংশা' },
    { en: 'Baliakandi', bn: 'বালিয়াকান্দি' },
    { en: 'Kalukhali', bn: 'কালুখালী' },
  ],
  Shariatpur: [
    { en: 'Shariatpur Sadar', bn: 'শরীয়তপুর সদর' },
    { en: 'Damudya', bn: 'ডামুড্যা' },
    { en: 'Naria', bn: 'নড়িয়া' },
    { en: 'Jajira', bn: 'জাজিরা' },
    { en: 'Bhedarganj', bn: 'ভেদরগঞ্জ' },
    { en: 'Gosairhat', bn: 'গোসাইরহাট' },
  ],
  Tangail: [
    { en: 'Tangail Sadar', bn: 'টাঙ্গাইল সদর' },
    { en: 'Sakhipur', bn: 'সখিপুর' },
    { en: 'Basail', bn: 'বাসাইল' },
    { en: 'Madhupur', bn: 'মধুপুর' },
    { en: 'Ghatail', bn: 'ঘাটাইল' },
    { en: 'Kalihati', bn: 'কালিহাতী' },
    { en: 'Nagarpur', bn: 'নাগরপুর' },
    { en: 'Mirzapur', bn: 'মির্জাপুর' },
    { en: 'Gopalpur', bn: 'গোপালপুর' },
    { en: 'Delduar', bn: 'দেলদুয়ার' },
    { en: 'Bhuapur', bn: 'ভূঞাপুর' },
    { en: 'Dhanbari', bn: 'ধনবাড়ী' },
  ],
  Bandarban: [
    { en: 'Bandarban Sadar', bn: 'বান্দরবান সদর' },
    { en: 'Thanchi', bn: 'থানচি' },
    { en: 'Lama', bn: 'লামা' },
    { en: 'Naikhongchhari', bn: 'নাইক্ষ্যংছড়ি' },
    { en: 'Ali Kadam', bn: 'আলীকদম' },
    { en: 'Rowangchhari', bn: 'রোয়াংছড়ি' },
    { en: 'Ruma', bn: 'রুমা' },
  ],
  Brahmanbaria: [
    { en: 'Brahmanbaria Sadar', bn: 'ব্রাহ্মণবাড়িয়া সদর' },
    { en: 'Ashuganj', bn: 'আশুগঞ্জ' },
    { en: 'Nasirnagar', bn: 'নাসিরনগর' },
    { en: 'Nabinagar', bn: 'নবীনগর' },
    { en: 'Banchharampur', bn: 'বাঞ্ছারামপুর' },
    { en: 'Kasba', bn: 'কসবা' },
    { en: 'Akhaura', bn: 'আখাউড়া' },
    { en: 'Sarail', bn: 'সরাইল' },
    { en: 'Bijoynagar', bn: 'বিজয়নগর' },
  ],
  Chandpur: [
    { en: 'Chandpur Sadar', bn: 'চাঁদপুর সদর' },
    { en: 'Faridganj', bn: 'ফরিদগঞ্জ' },
    { en: 'Haimchar', bn: 'হাইমচর' },
    { en: 'Haziganj', bn: 'হাজীগঞ্জ' },
    { en: 'Kachua', bn: 'কচুয়া' },
    { en: 'Matlab Uttar', bn: 'মতলব উত্তর' },
    { en: 'Matlab Dakshin', bn: 'মতলব দক্ষিণ' },
    { en: 'Shahrasti', bn: 'শাহরাস্তি' },
  ],
  Chattogram: [
    { en: 'Anwara', bn: 'আনোয়ারা' },
    { en: 'Banshkhali', bn: 'বাঁশখালী' },
    { en: 'Boalkhali', bn: 'বোয়ালখালী' },
    { en: 'Chandanaish', bn: 'চন্দনাইশ' },
    { en: 'Fatikchhari', bn: 'ফটিকছড়ি' },
    { en: 'Bhujpur', bn: 'ভুজপুর' },
    { en: 'Hathazari', bn: 'হাটহাজারী' },
    { en: 'Lohagara', bn: 'লোহাগাড়া' },
    { en: 'Mirsharai', bn: 'মীরসরাই' },
    { en: 'Zorarganj', bn: 'জোরারগঞ্জ' },
    { en: 'Patiya', bn: 'পটিয়া' },
    { en: 'Rangunia', bn: 'রাঙ্গুনিয়া' },
    { en: 'South Rangunia', bn: 'দক্ষিণ রাঙ্গুনিয়া' },
    { en: 'Raozan', bn: 'রাউজান' },
    { en: 'Sandwip', bn: 'সন্দ্বীপ' },
    { en: 'Satkania', bn: 'সাতকানিয়া' },
    { en: 'Sitakunda', bn: 'সীতাকুণ্ড' },
    { en: 'Akbarshah', bn: 'আকবরশাহ' },
    { en: 'Bakalia', bn: 'বাকলিয়া' },
    { en: 'Bandar', bn: 'বন্দর' },
    { en: 'Bayazid Bostami', bn: 'বায়েজিদ বোস্তামী' },
    { en: 'Chandgaon', bn: 'চান্দগাঁও' },
    { en: 'Chawkbazar', bn: 'চকবাজার' },
    { en: 'Double Mooring', bn: 'ডবলমুরিং' },
    { en: 'EPZ', bn: 'ইপিজেড' },
    { en: 'Halishahar', bn: 'হালিশহর' },
    { en: 'Karnaphuli', bn: 'কর্ণফুলী' },
    { en: 'Khulshi', bn: 'খুলশী' },
    { en: 'Kotwali', bn: 'কোতোয়ালী' },
    { en: 'Pahartali', bn: 'পাহাড়তলী' },
    { en: 'Panchlaish', bn: 'পাঁচলাইশ' },
    { en: 'Patenga', bn: 'পতেঙ্গা' },
    { en: 'Sadarghat', bn: 'সদরঘাট' },
  ],
  Cumilla: [
    { en: 'Barura', bn: 'বরুড়া' },
    { en: 'Brahmanpara', bn: 'ব্রাহ্মণপাড়া' },
    { en: 'Burichang', bn: 'বুড়িচং' },
    { en: 'Chandina', bn: 'চান্দিনা' },
    { en: 'Chauddagram', bn: 'চৌদ্দগ্রাম' },
    { en: 'Cumilla Adarsha Sadar', bn: 'কুমিল্লা আদর্শ সদর' },
    { en: 'Cumilla Sadar Dakshin', bn: 'কুমিল্লা সদর দক্ষিণ' },
    { en: 'Daudkandi', bn: 'দাউদকান্দি' },
    { en: 'Debidwar', bn: 'দেবীদ্বার' },
    { en: 'Homna', bn: 'হোমনা' },
    { en: 'Laksam', bn: 'লাকসাম' },
    { en: 'Lalmai', bn: 'লালমাই' },
    { en: 'Meghna', bn: 'মেঘনা' },
    { en: 'Monohorgonj', bn: 'মনোহরগঞ্জ' },
    { en: 'Muradnagar', bn: 'মুরাদনগর' },
    { en: 'Nangalkot', bn: 'নাঙ্গলকোট' },
    { en: 'Titas', bn: 'তিতাস' },
  ],
  "Cox's Bazar": [
    { en: "Cox's Bazar Sadar", bn: 'কক্সবাজার সদর' },
    { en: 'Chakaria', bn: 'চকরিয়া' },
    { en: 'Kutubdia', bn: 'কুতুবদিয়া' },
    { en: 'Maheshkhali', bn: 'মহেশখালী' },
    { en: 'Ramu', bn: 'রামু' },
    { en: 'Teknaf', bn: 'টেকনাফ' },
    { en: 'Ukhia', bn: 'উখিয়া' },
    { en: 'Pekua', bn: 'পেকুয়া' },
    { en: 'Eidgaon', bn: 'ঈদগাঁও' },
  ],
  Feni: [
    { en: 'Feni Sadar', bn: 'ফেনী সদর' },
    { en: 'Chhagalnaiya', bn: 'ছাগলনাইয়া' },
    { en: 'Daganbhuiyan', bn: 'দাগনভূঞা' },
    { en: 'Parshuram', bn: 'পরশুরাম' },
    { en: 'Fulgazi', bn: 'ফুলগাজী' },
    { en: 'Sonagazi', bn: 'সোনাগাজী' },
  ],
  Khagrachari: [
    { en: 'Khagrachari Sadar', bn: 'খাগড়াছড়ি সদর' },
    { en: 'Dighinala', bn: 'দীঘিনালা' },
    { en: 'Panchhari', bn: 'পানছড়ি' },
    { en: 'Lakshmichhari', bn: 'লক্ষ্মীছড়ি' },
    { en: 'Mahalchhari', bn: 'মহালছড়ি' },
    { en: 'Manikchhari', bn: 'মানিকছড়ি' },
    { en: 'Ramgarh', bn: 'রামগড়' },
    { en: 'Matiranga', bn: 'মাটিরাঙ্গা' },
    { en: 'Guimara', bn: 'গুইমারা' },
  ],
  Lakshmipur: [
    { en: 'Lakshmipur Sadar', bn: 'লক্ষ্মীপুর সদর' },
    { en: 'Raipur', bn: 'রায়পুর' },
    { en: 'Ramganj', bn: 'রামগঞ্জ' },
    { en: 'Ramgati', bn: 'রামগতি' },
    { en: 'Kamalnagar', bn: 'কমলনগর' },
  ],
  Noakhali: [
    { en: 'Noakhali Sadar', bn: 'নোয়াখালী সদর' },
    { en: 'Begumganj', bn: 'বেগমগঞ্জ' },
    { en: 'Chatkhil', bn: 'চাটখিল' },
    { en: 'Companiganj', bn: 'কোম্পানীগঞ্জ' },
    { en: 'Hatiya', bn: 'হাতিয়া' },
    { en: 'Senbagh', bn: 'সেনবাগ' },
    { en: 'Subarnachar', bn: 'সুবর্ণচর' },
    { en: 'Sonaimuri', bn: 'সোনাইমুড়ী' },
    { en: 'Kabirhat', bn: 'কবিরহাট' },
  ],
  Rangamati: [
    { en: 'Rangamati Sadar', bn: 'রাঙ্গামাটি সদর' },
    { en: 'Belaichhari', bn: 'বিলাইছড়ি' },
    { en: 'Bagaichhari', bn: 'বাঘাইছড়ি' },
    { en: 'Barkal', bn: 'বরকল' },
    { en: 'Juraichhari', bn: 'জুরাইছড়ি' },
    { en: 'Rajasthali', bn: 'রাজস্থলী' },
    { en: 'Kaptai', bn: 'কাপ্তাই' },
    { en: 'Langadu', bn: 'লংগদু' },
    { en: 'Naniarchar', bn: 'নানিয়ারচর' },
    { en: 'Kaukhali', bn: 'কাউখালী' },
  ],
  Bogura: [
    { en: 'Adamdighi', bn: 'আদমদীঘি' },
    { en: 'Bogura Sadar', bn: 'বগুড়া সদর' },
    { en: 'Dhunat', bn: 'ধুনট' },
    { en: 'Dupchanchia', bn: 'দুপচাঁচিয়া' },
    { en: 'Gabtali', bn: 'গাবতলী' },
    { en: 'Kahaloo', bn: 'কাহালু' },
    { en: 'Nandigram', bn: 'নন্দীগ্রাম' },
    { en: 'Sariakandi', bn: 'সারিয়াকান্দি' },
    { en: 'Sahajanpur', bn: 'শাজাহানপুর' },
    { en: 'Sherpur', bn: 'শেরপুর' },
    { en: 'Shibganj', bn: 'শিবগঞ্জ' },
    { en: 'Sonatala', bn: 'সোনাতলা' },
  ],
  Joypurhat: [
    { en: 'Akkelpur', bn: 'আক্কেলপুর' },
    { en: 'Joypurhat Sadar', bn: 'জয়পুরহাট সদর' },
    { en: 'Kalai', bn: 'কালাই' },
    { en: 'Khetlal', bn: 'ক্ষেতলাল' },
    { en: 'Panchbibi', bn: 'পাঁচবিবি' },
  ],
  Naogaon: [
    { en: 'Atrai', bn: 'আত্রাই' },
    { en: 'Badalgachhi', bn: 'বদলগাছী' },
    { en: 'Dhamoirhat', bn: 'ধামইরহাট' },
    { en: 'Manda', bn: 'মান্দা' },
    { en: 'Mohadevpur', bn: 'মহাদেবপুর' },
    { en: 'Naogaon Sadar', bn: 'নওগাঁ সদর' },
    { en: 'Niamatpur', bn: 'নিয়ামতপুর' },
    { en: 'Patnitala', bn: 'পত্নীতলা' },
    { en: 'Porsha', bn: 'পোরশা' },
    { en: 'Raninagar', bn: 'রাণীনগর' },
    { en: 'Sapahar', bn: 'সাপাহার' },
  ],
  Natore: [
    { en: 'Bagatipara', bn: 'বাগাতিপাড়া' },
    { en: 'Baraigram', bn: 'বড়াইগ্রাম' },
    { en: 'Gurudaspur', bn: 'গুরুদাসপুর' },
    { en: 'Lalpur', bn: 'লালপুর' },
    { en: 'Naldanga', bn: 'নলডাঙ্গা' },
    { en: 'Natore Sadar', bn: 'নাটোর সদর' },
    { en: 'Singra', bn: 'সিংড়া' },
  ],
  Chapainawabganj: [
    { en: 'Bholahat', bn: 'ভোলাহাট' },
    { en: 'Chapainawabganj Sadar', bn: 'চাঁপাইনবাবগঞ্জ সদর' },
    { en: 'Gomastapur', bn: 'গোমস্তাপুর' },
    { en: 'Nachole', bn: 'নাচোল' },
    { en: 'Shibganj', bn: 'শিবগঞ্জ' },
  ],
  Pabna: [
    { en: 'Atgharia', bn: 'আটঘরিয়া' },
    { en: 'Bera', bn: 'বেড়া' },
    { en: 'Bhangura', bn: 'ভাঙ্গুড়া' },
    { en: 'Chatmohar', bn: 'চাটমোহর' },
    { en: 'Faridpur', bn: 'ফরিদপুর' },
    { en: 'Ishwardi', bn: 'ঈশ্বরদী' },
    { en: 'Pabna Sadar', bn: 'পাবনা সদর' },
    { en: 'Santhia', bn: 'সাঁথিয়া' },
    { en: 'Sujanagar', bn: 'সুজানগর' },
  ],
  Rajshahi: [
    { en: 'Bagha', bn: 'বাঘা' },
    { en: 'Bagmara', bn: 'বাগমারা' },
    { en: 'Charghat', bn: 'চারঘাট' },
    { en: 'Durgapur', bn: 'দুর্গাপুর' },
    { en: 'Godagari', bn: 'গোদাগাড়ী' },
    { en: 'Mohanpur', bn: 'মোহনপুর' },
    { en: 'Paba', bn: 'পবা' },
    { en: 'Puthia', bn: 'পুঠিয়া' },
    { en: 'Tanore', bn: 'তানোর' },
  ],
  Sirajganj: [
    { en: 'Belkuchi', bn: 'বেলকুচি' },
    { en: 'Chauhali', bn: 'চৌহালী' },
    { en: 'Kamarkhanda', bn: 'কামারখন্দ' },
    { en: 'Kazipur', bn: 'কাজীপুর' },
    { en: 'Raiganj', bn: 'রায়গঞ্জ' },
    { en: 'Shahjadpur', bn: 'শাহজাদপুর' },
    { en: 'Sirajganj Sadar', bn: 'সিরাজগঞ্জ সদর' },
    { en: 'Tarash', bn: 'তাড়াশ' },
    { en: 'Ullahpara', bn: 'উল্লাপাড়া' },
  ],
  Bagerhat: [
    { en: 'Bagerhat Sadar', bn: 'বাগেরহাট সদর' },
    { en: 'Chitalmari', bn: 'চিতলমারী' },
    { en: 'Fakirhat', bn: 'ফকিরহাট' },
    { en: 'Kachua', bn: 'কচুয়া' },
    { en: 'Mollahat', bn: 'মোল্লাহাট' },
    { en: 'Mongla', bn: 'মোংলা' },
    { en: 'Morrelganj', bn: 'মোড়েলগঞ্জ' },
    { en: 'Rampal', bn: 'রামপাল' },
    { en: 'Sarankhola', bn: 'শরণখোলা' },
  ],
  Chuadanga: [
    { en: 'Alamdanga', bn: 'আলমডাঙ্গা' },
    { en: 'Chuadanga Sadar', bn: 'চুয়াডাঙ্গা সদর' },
    { en: 'Damurhuda', bn: 'দামুড়হুদা' },
    { en: 'Jibannagar', bn: 'জীবননগর' },
  ],
  Jashore: [
    { en: 'Abhaynagar', bn: 'অভয়নগর' },
    { en: 'Bagherpara', bn: 'বাঘারপাড়া' },
    { en: 'Chaugachha', bn: 'চৌগাছা' },
    { en: 'Jhikargachha', bn: 'ঝিকরগাছা' },
    { en: 'Keshabpur', bn: 'কেশবপুর' },
    { en: 'Jashore Sadar', bn: 'যশোর সদর' },
    { en: 'Manirampur', bn: 'মণিরামপুর' },
    { en: 'Sharsha', bn: 'শার্শা' },
  ],
  Jhenaidah: [
    { en: 'Harinakunda', bn: 'হরিণাকুণ্ডু' },
    { en: 'Jhenaidah Sadar', bn: 'ঝিনাইদহ সদর' },
    { en: 'Kaliganj', bn: 'কালীগঞ্জ' },
    { en: 'Kotchandpur', bn: 'কোটচাঁদপুর' },
    { en: 'Maheshpur', bn: 'মহেশপুর' },
    { en: 'Shailkupa', bn: 'শৈলকুপা' },
  ],
  Khulna: [
    { en: 'Batiaghata', bn: 'বটিয়াঘাটা' },
    { en: 'Dacope', bn: 'দাকোপ' },
    { en: 'Dumuria', bn: 'ডুমুরিয়া' },
    { en: 'Dighalia', bn: 'দিঘলিয়া' },
    { en: 'Koyra', bn: 'কয়রা' },
    { en: 'Paikgachha', bn: 'পাইকগাছা' },
    { en: 'Phultala', bn: 'ফুলতলা' },
    { en: 'Rupsha', bn: 'রূপসা' },
    { en: 'Terokhada', bn: 'তেরখাদা' },
  ],
  Kushtia: [
    { en: 'Bheramara', bn: 'ভেড়ামারা' },
    { en: 'Daulatpur', bn: 'দৌলতপুর' },
    { en: 'Khoksa', bn: 'খোকসা' },
    { en: 'Kumarkhali', bn: 'কুমারখালী' },
    { en: 'Kushtia Sadar', bn: 'কুষ্টিয়া সদর' },
    { en: 'Mirpur', bn: 'মিরপুর' },
  ],
  Magura: [
    { en: 'Magura Sadar', bn: 'মাগুরা সদর' },
    { en: 'Mohammadpur', bn: 'মহম্মদপুর' },
    { en: 'Shalikha', bn: 'শালিখা' },
    { en: 'Sreepur', bn: 'শ্রীপুর' },
  ],
  Meherpur: [
    { en: 'Gangni', bn: 'গাংনী' },
    { en: 'Meherpur Sadar', bn: 'মেহেরপুর সদর' },
    { en: 'Mujibnagar', bn: 'মুজিবনগর' },
  ],
  Narail: [
    { en: 'Kalia', bn: 'কালিয়া' },
    { en: 'Lohagara', bn: 'লোহাগড়া' },
    { en: 'Narail Sadar', bn: 'নড়াইল সদর' },
  ],
  Satkhira: [
    { en: 'Assasuni', bn: 'আশাশুনি' },
    { en: 'Debhata', bn: 'দেবহাটা' },
    { en: 'Kalaroa', bn: 'কলারোয়া' },
    { en: 'Kaliganj', bn: 'কালীগঞ্জ' },
    { en: 'Satkhira Sadar', bn: 'সাতক্ষীরা সদর' },
    { en: 'Shyamnagar', bn: 'শ্যামনগর' },
    { en: 'Tala', bn: 'তালা' },
  ],
  Barguna: [
    { en: 'Amtali', bn: 'আমতলী' },
    { en: 'Bamna', bn: 'বামনা' },
    { en: 'Barguna Sadar', bn: 'বরগুনা সদর' },
    { en: 'Betagi', bn: 'বেতাগী' },
    { en: 'Patharghata', bn: 'পাথরঘাটা' },
    { en: 'Taltali', bn: 'তালতলী' },
  ],
  Barishal: [
    { en: 'Agailjhara', bn: 'আগৈলঝাড়া' },
    { en: 'Babuganj', bn: 'বাবুগঞ্জ' },
    { en: 'Bakerganj', bn: 'বাকেরগঞ্জ' },
    { en: 'Banaripara', bn: 'বানারীপাড়া' },
    { en: 'Gournadi', bn: 'গৌরনদী' },
    { en: 'Hizla', bn: 'হিজলা' },
    { en: 'Barishal Sadar', bn: 'বরিশাল সদর' },
    { en: 'Mehendiganj', bn: 'মেহেন্দিগঞ্জ' },
    { en: 'Muladi', bn: 'মুলাদী' },
    { en: 'Wazirpur', bn: 'উজিরপুর' },
  ],
  Bhola: [
    { en: 'Bhola Sadar', bn: 'ভোলা সদর' },
    { en: 'Burhanuddin', bn: 'বোরহানউদ্দিন' },
    { en: 'Char Fasson', bn: 'চরফ্যাশন' },
    { en: 'Daulatkhan', bn: 'দৌলতখান' },
    { en: 'Lalmohan', bn: 'লালমোহন' },
    { en: 'Manpura', bn: 'মনপুরা' },
    { en: 'Tazumuddin', bn: 'তজুমদ্দিন' },
  ],
  Jhalokati: [
    { en: 'Jhalokati Sadar', bn: 'ঝালকাঠি সদর' },
    { en: 'Kanthalia', bn: 'কাঁঠালিয়া' },
    { en: 'Nalchity', bn: 'নলছিটি' },
    { en: 'Rajapur', bn: 'রাজাপুর' },
  ],
  Patuakhali: [
    { en: 'Bauphal', bn: 'বাউফল' },
    { en: 'Dashmina', bn: 'দশমিনা' },
    { en: 'Galachipa', bn: 'গলাচিপা' },
    { en: 'Kalapara', bn: 'কলাপাড়া' },
    { en: 'Mirzaganj', bn: 'মির্জাগঞ্জ' },
    { en: 'Patuakhali Sadar', bn: 'পটুয়াখালী সদর' },
    { en: 'Rangabali', bn: 'রাঙ্গাবালী' },
    { en: 'Dumki', bn: 'দুমকি' },
  ],
  Pirojpur: [
    { en: 'Bhandaria', bn: 'ভাণ্ডারিয়া' },
    { en: 'Kawkhali', bn: 'কাউখালী' },
    { en: 'Mathbaria', bn: 'মঠবাড়িয়া' },
    { en: 'Nazirpur', bn: 'নাজিরপুর' },
    { en: 'Pirojpur Sadar', bn: 'পিরোজপুর সদর' },
    { en: 'Nesarabad/Swarupkati', bn: 'নেছারাবাদ/স্বরূপকাঠী' },
    { en: 'Indurkani', bn: 'ইন্দুরকানী' },
  ],
  Habiganj: [
    { en: 'Ajmiriganj', bn: 'আজমিরীগঞ্জ' },
    { en: 'Bahubal', bn: 'বাহুবল' },
    { en: 'Baniyachong', bn: 'বানিয়াচং' },
    { en: 'Chunarughat', bn: 'চুনারুঘাট' },
    { en: 'Habiganj Sadar', bn: 'হবিগঞ্জ সদর' },
    { en: 'Lakhai', bn: 'লাখাই' },
    { en: 'Madhavpur', bn: 'মাধবপুর' },
    { en: 'Nabiganj', bn: 'নবীগঞ্জ' },
    { en: 'Shayestaganj', bn: 'শায়েস্তাগঞ্জ' },
  ],
  Moulvibazar: [
    { en: 'Barlekha', bn: 'বড়লেখা' },
    { en: 'Kamalganj', bn: 'কমলগঞ্জ' },
    { en: 'Kulaura', bn: 'কুলাউড়া' },
    { en: 'Moulvibazar Sadar', bn: 'মৌলভীবাজার সদর' },
    { en: 'Rajnagar', bn: 'রাজনগর' },
    { en: 'Sreemangal', bn: 'শ্রীমঙ্গল' },
    { en: 'Juri', bn: 'জুড়ী' },
  ],
  Sunamganj: [
    { en: 'Bishwamvarpur', bn: 'বিশ্বম্ভরপুর' },
    { en: 'Chhatak', bn: 'ছাতক' },
    { en: 'Shantiganj / Dakshin Sunamganj', bn: 'শান্তিগঞ্জ / দক্ষিণ সুনামগঞ্জ' },
    { en: 'Derai', bn: 'দিরাই' },
    { en: 'Dharamapasha', bn: 'ধর্মপাশা' },
    { en: 'Dowarabazar', bn: 'দোয়ারাবাজার' },
    { en: 'Jagannathpur', bn: 'জগন্নাথপুর' },
    { en: 'Jamalganj', bn: 'জামালগঞ্জ' },
    { en: 'Sullah', bn: 'শাল্লা' },
    { en: 'Sunamganj Sadar', bn: 'সুনামগঞ্জ সদর' },
    { en: 'Tahirpur', bn: 'তাহিরপুর' },
    { en: 'Madhyanagar', bn: 'মধ্যনগর' },
  ],
  Sylhet: [
    { en: 'Balaganj', bn: 'বালাগঞ্জ' },
    { en: 'Beanibazar', bn: 'বিয়ানীবাজার' },
    { en: 'Bishwanath', bn: 'বিশ্বনাথ' },
    { en: 'Companiganj', bn: 'কোম্পানীগঞ্জ' },
    { en: 'Dakshin Surma', bn: 'দক্ষিণ সুরমা' },
    { en: 'Fenchuganj', bn: 'ফেঞ্চুগঞ্জ' },
    { en: 'Golapganj', bn: 'গোলাপগঞ্জ' },
    { en: 'Gowainghat', bn: 'গোয়াইনঘাট' },
    { en: 'Jaintiapur', bn: 'জৈন্তাপুর' },
    { en: 'Kanaighat', bn: 'কানাইঘাট' },
    { en: 'Sylhet Sadar', bn: 'সিলেট সদর' },
    { en: 'Zakiganj', bn: 'জকিগঞ্জ' },
    { en: 'Osmani Nagar', bn: 'ওসমানী নগর' },
  ],
  Dinajpur: [
    { en: 'Birampur', bn: 'বিরামপুর' },
    { en: 'Birganj', bn: 'বীরগঞ্জ' },
    { en: 'Biral', bn: 'বিরল' },
    { en: 'Bochaganj', bn: 'বোচাগঞ্জ' },
    { en: 'Chirirbandar', bn: 'চিরিরবন্দর' },
    { en: 'Phulbari', bn: 'ফুলবাড়ী' },
    { en: 'Ghoraghat', bn: 'ঘোড়াঘাট' },
    { en: 'Hakimpur', bn: 'হাকিমপুর' },
    { en: 'Kaharole', bn: 'কাহারোল' },
    { en: 'Khansama', bn: 'খানসামা' },
    { en: 'Dinajpur Sadar', bn: 'দিনাজপুর সদর' },
    { en: 'Nawabganj', bn: 'নবাবগঞ্জ' },
    { en: 'Parbatipur', bn: 'পার্বতীপুর' },
  ],
  Gaibandha: [
    { en: 'Phulchhari', bn: 'ফুলছড়ি' },
    { en: 'Gaibandha Sadar', bn: 'গাইবান্ধা সদর' },
    { en: 'Gobindaganj', bn: 'গোবিন্দগঞ্জ' },
    { en: 'Palashbari', bn: 'পলাশবাড়ী' },
    { en: 'Sadullapur', bn: 'সাদুল্লাপুর' },
    { en: 'Sughatta', bn: 'সাঘাটা' },
    { en: 'Sundarganj', bn: 'সুন্দরগঞ্জ' },
  ],
  Kurigram: [
    { en: 'Bhurungamari', bn: 'ভুরুঙ্গামারী' },
    { en: 'Char Rajibpur', bn: 'চর রাজিবপুর' },
    { en: 'Chilmari', bn: 'চিলমারী' },
    { en: 'Phulbari', bn: 'ফুলবাড়ী' },
    { en: 'Kurigram Sadar', bn: 'কুড়িগ্রাম সদর' },
    { en: 'Nageshwari', bn: 'নাগেশ্বরী' },
    { en: 'Rajarhat', bn: 'রাজারহাট' },
    { en: 'Raomari', bn: 'রৌমারী' },
    { en: 'Ulipur', bn: 'উলিপুর' },
  ],
  Lalmonirhat: [
    { en: 'Aditmari', bn: 'আদিতমারী' },
    { en: 'Hatibandha', bn: 'হাতীবান্ধা' },
    { en: 'Kaliganj', bn: 'কালীগঞ্জ' },
    { en: 'Lalmonirhat Sadar', bn: 'লালমনিরহাট সদর' },
    { en: 'Patgram', bn: 'পাটগ্রাম' },
  ],
  Nilphamari: [
    { en: 'Dimla', bn: 'ডিমলা' },
    { en: 'Domar', bn: 'ডোমার' },
    { en: 'Jaldhaka', bn: 'জলঢাকা' },
    { en: 'Kishoreganj', bn: 'কিশোরগঞ্জ' },
    { en: 'Nilphamari Sadar', bn: 'নীলফামারী সদর' },
    { en: 'Saidpur', bn: 'সৈয়দপুর' },
  ],
  Panchagarh: [
    { en: 'Atwari', bn: 'আটোয়ারী' },
    { en: 'Boda', bn: 'বোদা' },
    { en: 'Debiganj', bn: 'দেবীগঞ্জ' },
    { en: 'Panchagarh Sadar', bn: 'পঞ্চগড় সদর' },
    { en: 'Tetulia', bn: 'তেতুঁলিয়া' },
  ],
  Rangpur: [
    { en: 'Badarganj', bn: 'বদরগঞ্জ' },
    { en: 'Gangachhara', bn: 'গঙ্গাচড়া' },
    { en: 'Kaunia', bn: 'কাউনিয়া' },
    { en: 'Rangpur Sadar', bn: 'রংপুর সদর' },
    { en: 'Mithapukur', bn: 'মিঠাপুকুর' },
    { en: 'Pirgachha', bn: 'পীরগাছা' },
    { en: 'Pirganj', bn: 'পীরগঞ্জ' },
    { en: 'Taraganj', bn: 'তারাগঞ্জ' },
  ],
  Thakurgaon: [
    { en: 'Baliadangi', bn: 'বালিয়াডাঙ্গী' },
    { en: 'Haripur', bn: 'হরিপুর' },
    { en: 'Pirganj', bn: 'পীরগঞ্জ' },
    { en: 'Ranisankail', bn: 'রাণীশংকৈল' },
    { en: 'Thakurgaon Sadar', bn: 'ঠাকুরগাঁও সদর' },
  ],
  Jamalpur: [
    { en: 'Baksiganj', bn: 'বকশীগঞ্জ' },
    { en: 'Dewanganj', bn: 'দেওয়ানগঞ্জ' },
    { en: 'Islampur', bn: 'ইসলামপুর' },
    { en: 'Jamalpur Sadar', bn: 'জামালপুর সদর' },
    { en: 'Madarganj', bn: 'মাদারগঞ্জ' },
    { en: 'Melandaha', bn: 'মেলান্দহ' },
    { en: 'Sarishabari', bn: 'সরিষাবাড়ী' },
  ],
  Mymensingh: [
    { en: 'Bhaluka', bn: 'ভালুকা' },
    { en: 'Dhobaura', bn: 'ধোবাউড়া' },
    { en: 'Fulbaria', bn: 'ফুলবাড়ীয়া' },
    { en: 'Gaffargaon', bn: 'গফরগাঁও' },
    { en: 'Gauripur', bn: 'গৌরীপুর' },
    { en: 'Haluaghat', bn: 'হালুয়াঘাট' },
    { en: 'Ishwarganj', bn: 'ঈশ্বরগঞ্জ' },
    { en: 'Mymensingh Sadar', bn: 'ময়মনসিংহ সদর' },
    { en: 'Muktagachha', bn: 'মুক্তাগাছা' },
    { en: 'Nandail', bn: 'নান্দাইল' },
    { en: 'Phulpur', bn: 'ফুলপুর' },
    { en: 'Trisal', bn: 'ত্রিশাল' },
    { en: 'Tara Khanda', bn: 'তারাকান্দা' },
  ],
  Netrokona: [
    { en: 'Atpara', bn: 'আটপাড়া' },
    { en: 'Barhatta', bn: 'বারহাট্টা' },
    { en: 'Durgapur', bn: 'দুর্গাপুর' },
    { en: 'Khaliajuri', bn: 'খালিয়াজুরী' },
    { en: 'Kalmakanda', bn: 'কলমাকান্দা' },
    { en: 'Kendua', bn: 'কেন্দুয়া' },
    { en: 'Madan', bn: 'মদন' },
    { en: 'Mohanganj', bn: 'মোহনগঞ্জ' },
    { en: 'Netrokona Sadar', bn: 'নেত্রকোনা সদর' },
    { en: 'Purbadhala', bn: 'পূর্বধলা' },
  ],
  Sherpur: [
    { en: 'Jhenaigati', bn: 'ঝিনাইগাতী' },
    { en: 'Nakla', bn: 'নকলা' },
    { en: 'Nalitabari', bn: 'নালিতাবাড়ী' },
    { en: 'Sherpur Sadar', bn: 'শেরপুর সদর' },
    { en: 'Sreebardi', bn: 'শ্রীবরদী' },
  ],
};

const DEFAULT_ADDRESS_FORM = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  district: '',
  policeStation: '',
  notesOpen: false,
  notes: '',
};

export default function page() {
  const router = useRouter();
  const {
    cartItems: items,
    updateCartQuantity,
    removeCartItem,
    clearCart,
  } = useCart();
  const [form, setForm] = useState(DEFAULT_ADDRESS_FORM);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const deliveryCost = form.district === 'Dhaka' ? DHAKA_DELIVERY_COST : OUTSIDE_DHAKA_DELIVERY_COST;
  const total = Math.max(0, subtotal + deliveryCost - discount);

  const handleQty = (id, direction) => {
    updateCartQuantity(id, direction);
  };

  const handleRemove = (id) => {
    removeCartItem(id);
    toast.success('Item removed from cart');
  };

  // Text inputs (name, phone, email, address)
  const handleFieldChange = (setter) => (field) => (e) => {
    const value = field === 'phone'
      ? e.target.value.replace(/\D/g, '')
      : e.target.value;
    setter((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleDistrictChange = (setter) => (districtEn) => {
    setter((prev) => ({
      ...prev,
      district: districtEn,
      policeStation: '',
    }));
    setValidationErrors((prev) => ({ ...prev, district: '', policeStation: '' }));
  };

  const handlePoliceStationChange = (setter) => (stationEn) => {
    setter((prev) => ({ ...prev, policeStation: stationEn }));
    setValidationErrors((prev) => ({ ...prev, policeStation: '' }));
  };

  // Special notes toggle + textarea, per address
  const handleNotesToggle = (setter) => () => {
    setter((prev) => ({ ...prev, notesOpen: !prev.notesOpen }));
  };
  const handleNotesChange = (setter) => (e) => {
    const value = e.target.value;
    setter((prev) => ({ ...prev, notes: value }));
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code first');
      return;
    }
    if (couponCode.trim().toUpperCase() === 'SAVE10') {
      const value = Math.round(subtotal * 0.1);
      setDiscount(value);
      toast.success(`Coupon applied, you saved ৳${value}`);
    } else {
      toast.error('This coupon is not valid');
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    const email = form.email.trim();

    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Fill Your Name';
    if (!form.phone.trim()) errors.phone = 'Fillup Your Number';
    else if (form.phone.length !== 11) errors.phone = 'Your number must be at least 11 characters long';
    if (!form.address.trim()) errors.address = 'Fillup Your Address';
    if (!form.district) errors.district = 'Select Your District';
    if (!form.policeStation) errors.policeStation = 'Select Your Police Station';
    if (email && !GMAIL_PATTERN.test(email)) {
      errors.email = 'Your Gmail does not have @gmail.com at the end, please give it.';
    }
    if (!agreed) errors.agreed = 'Fill This Condition';

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const paymentMethodMap = {
      cod: 'cash-on-delivery',
      online: 'online',
      bkash: 'bkash',
      nagad: 'nagad',
    };

    const orderPayload = {
      orderId: `ORD-${Date.now()}`,
      items: items.map((item) => ({
        productId: item.id,
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
        quantity: item.qty,
        size: item.size || '',
        color: item.color || '',
      })),
      customerName: form.fullName,
      mobile: form.phone,
      phone: form.phone,
      email,
      address: form.address,
      district: form.district,
      thana: form.policeStation,
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        email,
        address: form.address,
        district: form.district,
        thana: form.policeStation,
      },
      paymentMethod: paymentMethodMap[paymentMethod] || paymentMethod,
      notes: form.notes || '',
      subtotal,
      deliveryCost,
      discount,
      total,
    };

    setSubmitting(true);
    try {
      const created = await createOrder(orderPayload);
      const sessionOrder = {
        ...orderPayload,
        orderId: created.orderId || orderPayload.orderId,
        _id: created._id,
        productImage: items[0]?.image || '/shoe1.avif',
        productName: items[0]?.name || 'Order',
        quantity: items.reduce((sum, item) => sum + item.qty, 0),
        paymentMethod,
        total: created.total ?? total,
        deliveryCost: created.deliveryFee ?? deliveryCost,
        deliveryFee: created.deliveryFee ?? deliveryCost,
      };

      sessionStorage.setItem('flashShoeOrder', JSON.stringify(sessionOrder));
      clearCart();
      router.push('/orderdetails');
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 py-8 sm:px-8">
      <div className="mx-auto grid max-w-[1550px] grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr]">
        {/* ================= LEFT COLUMN ================= */}
        <div className="space-y-6">
          {/* Order review */}
          <section className="rounded-xl bg-gray-200 dark:bg-gray-800 p-6 shadow-sm">
            <SectionTitle> <span className=' text-black dark:text-white '>Order review</span></SectionTitle>
            <div className="mt-4 divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white dark:bg-gray-700">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-black dark:text-amber-200 font-bold ">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        {item.size ? `Size: ${item.size}` : ''}
                        {item.size && item.color ? ' · ' : ''}
                        {item.color ? `Color: ${item.color}` : ''}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-white ">Qty:</span>
                      <div className="flex items-center overflow-hidden rounded-md border border-gray-300 dark:border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleQty(item.id, 'dec')}
                          className="flex h-7 w-7 items-center justify-center bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-400 "
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
                          className="flex h-7 w-7 items-center justify-center bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-400 "
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
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    aria-label="Remove item"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">Your cart is empty.</p>
              )}
            </div>
          </section>

          {items.length > 0 && (
            <>
          {/* Shipping address */}
          <section className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <SectionTitle> <span className=' text-black dark:text-white ' >Shipping Address</span></SectionTitle>
            <div className="mt-4">
              <AddressFields
                form={form}
                errors={validationErrors}
                onChange={handleFieldChange(setForm)}
                onDistrictChange={handleDistrictChange(setForm)}
                onPoliceStationChange={handlePoliceStationChange(setForm)}
                onNotesToggle={handleNotesToggle(setForm)}
                onNotesChange={handleNotesChange(setForm)}
              />
            </div>
          </section>

            </>
          )}
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        {items.length > 0 && (
        <div className="space-y-6">
          {/* Payment method */}
          <section className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <SectionTitle> <span className=' text-black dark:text-white '>Payment method</span> </SectionTitle>
            <div className="mt-4 grid grid-cols-2 gap-3 ">
              <PaymentOption
                label="Cash On Delivery"
                selected={paymentMethod === 'cod'}
                onClick={() => setPaymentMethod('cod')}
                icon={<CodIcon />}
              />
              <PaymentOption
                label="Online Payment"
                selected={paymentMethod === 'online'}
                onClick={() => setPaymentMethod('online')}
                icon={<CardIcon />}
              />
              <PaymentOption
                label="Bkash"
                selected={paymentMethod === 'bkash'}
                onClick={() => setPaymentMethod('bkash')}
                icon={<BkashIcon />}
              />
              <PaymentOption
                label="Nagad"
                selected={paymentMethod === 'nagad'}
                onClick={() => setPaymentMethod('nagad')}
                icon={<NagadIcon />}
              />
            </div>
          </section>

          {/* Coupon */}
          <section className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setCouponOpen((prev) => !prev)}
              className="flex w-full items-center justify-between text-sm text-gray-700 dark:text-white "
            >
              Have any coupon or gift voucher?
              <ChevronDownIcon className={` cursor-pointer transition-transform ${couponOpen ? 'rotate-180' : ''}`} />
            </button>
            {couponOpen && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="rounded-md bg-gray-800 dark:bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 dark:hover:bg-gray-600 cursor-pointer "
                >
                  Apply
                </button>
              </div>
            )}
          </section>

            {/* Special notes (optional) */}
      <section className=' rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm '>
        <button
          type="button"
          onClick={handleNotesToggle(setForm)}
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-white "
        >
          <span
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-orange-500 cursor-pointer"
            aria-hidden="true"
          >
            {form.notesOpen && <span className="h-2 w-2 rounded-full bg-orange-500" />}
          </span>
          Special notes <span className="text-xs text-gray-400">(Optional)</span>
        </button>
        {form.notesOpen && (
          <div className="mt-2">
            <textarea
              value={form.notes}
              maxLength={90}
              onChange={handleNotesChange(setForm)}
              rows={3}
              placeholder="e.g. landmark, delivery instructions…"
              className="w-full resize-none rounded-md border border-gray-200 p-3 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">{form.notes.length} / 90 characters</p>
          </div>
        )}
      </section>

          {/* Totals */}
          <section className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-500 dark:text-white ">Sub total</span>
              <span className="text-sm text-gray-800 dark:text-white/80 ">{subtotal.toLocaleString()}.00 BDT</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-500 dark:text-white">Delivery cost</span>
              <span className="text-sm text-gray-800 dark:text-white/80">{deliveryCost.toFixed(2)} BDT</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-orange-600">Discount</span>
                <span className="text-sm text-orange-600">-{discount.toLocaleString()}.00 BDT</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-base font-semibold text-gray-900 dark:text-white/80">{total.toLocaleString()}.00BDT</span>
            </div>
          </section>

          {/* Terms */}
          {validationErrors.agreed && (
            <p role="alert" className="text-sm text-red-600">{validationErrors.agreed}</p>
          )}
          <div className="flex items-start gap-2 px-1">
            <button
              type="button"
              onClick={() => {
                setAgreed((prev) => !prev);
                setValidationErrors((prev) => ({ ...prev, agreed: '' }));
              }}
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-orange-500 cursor-pointer "
              aria-pressed={agreed}
              aria-label="Agree to terms"
            >
              {agreed && <span className="h-2 w-2 rounded-full bg-orange-500" />}
            </button>
            
            <p className="text-sm text-gray-600 dark:text-white ">
              I have read and agree to the{' '}
              <Link href="/terms" className="text-orange-500 hover:underline">Terms and Conditions</Link>,{' '}
              <Link href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link> &{' '}
              <Link href="/refund" className="text-orange-500 hover:underline">Refund and Return Policy</Link>.
            </p>
          </div>
          

          {/* Place order */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={submitting || items.length === 0}
            className="w-full rounded-md bg-orange-500 py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-orange-600 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? 'PLACING ORDER…' : 'PLACE ORDER'}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="flex items-center gap-2 text-[15px] font-semibold text-gray-800">
      <span className="h-4 w-[3px] rounded-sm bg-orange-500" />
      {children}
    </h2>
  );
}

function AddressFields({ form, errors, onChange, onDistrictChange, onPoliceStationChange, onNotesToggle, onNotesChange }) {
  const policeStationOptions = POLICE_STATION_BY_DISTRICT[form.district] || [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          {errors.fullName && <p role="alert" className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          <input
            type="text"
            value={form.fullName}
            onChange={onChange('fullName')}
            placeholder="Your Full Name *"
            className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none"
          />
          
        </div>
        <div>
             {errors.phone && <p role="alert" className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          <div className="flex items-center overflow-hidden rounded-md border border-gray-200 focus-within:border-orange-400">
            <span className="border-r border-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-600 dark:text-white">+88</span>
            <input
              type="tel"
              value={form.phone}
              onChange={onChange('phone')}
              inputMode="numeric"
              minLength={11}
              pattern="[0-9]{11,}"
              placeholder="017*********"
              className="w-full px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none"
            />
          </div>
         
        </div>
      </div>
      <div>
         {errors.email && <p role="alert" className="mt-1 text-sm text-red-600">{errors.email}</p>}
        <input
          type="email"
          value={form.email}
          onChange={onChange('email')}
          pattern="[^\s@]+@gmail\.com"
          maxLength={254}
          placeholder="example@gmail.com (Optional)"
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none"
        />
      </div>
      <div>
        {errors.address && <p role="alert" className="mt-1 text-sm text-red-600">{errors.address}</p>}
        <input
          type="text"
          value={form.address}
          onChange={onChange('address')}
          placeholder="ex: House no. / building / street / area"
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          {errors.district && <p role="alert" className="mt-1 text-sm text-red-600">{errors.district}</p>}
          <SearchableSelect
            options={DISTRICT}
            value={form.district}
            onChange={onDistrictChange}
            placeholder="Select Your Zilla"
            searchPlaceholder="Search district…"
          />
          
        </div>
        <div>
           {errors.policeStation && <p role="alert" className="mt-1 text-sm text-red-600">{errors.policeStation}</p>}
          <SearchableSelect
            options={policeStationOptions}
            value={form.policeStation}
            onChange={onPoliceStationChange}
            placeholder="Select Your Thana"
            searchPlaceholder="Search police station…"
            allowCustom
          />
         
          {policeStationOptions.length === 0 && (
            <p className="mt-1 text-xs text-gray-400">
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A searchable dropdown ("combobox") that lists options as "English (Bangla)"
 * and lets the user filter the list by typing either the English or Bangla name.
 */
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = 'Search…',
  allowCustom = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Falls back to a plain "custom" entry (no Bangla name) when the current
  // value isn't one of the known options — only relevant when allowCustom.
  const selected = options.find((o) => o.en === value) || (value ? { en: value, bn: '' } : null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.en.toLowerCase().includes(q) || o.bn.includes(query.trim())
    );
  }, [options, query]);

  const trimmedQuery = query.trim();
  const hasExactMatch = filtered.some((o) => o.en.toLowerCase() === trimmedQuery.toLowerCase());
  const showCustomOption = allowCustom && trimmedQuery.length > 0 && !hasExactMatch;

  const handleSelect = (optionEn) => {
    onChange(optionEn);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2.5 text-left text-sm text-gray-700 dark:text-white focus:border-orange-400 focus:outline-none cursor-pointer"
      >
        <span className="truncate">
          {selected ? (
            <>
              {selected.en}
              {selected.bn && <span className="text-gray-400 cursor-pointer"> ({selected.bn})</span>}
            </>
          ) : (
            <span className="text-gray-400 cursor-pointer">{placeholder}</span>
          )}
        </span>
        <ChevronDownIcon className={`ml-2 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Click-outside catcher */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white dark:bg-gray-700 shadow-lg">
            <div className="border-b border-gray-100 p-2">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {showCustomOption && (
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelect(trimmedQuery)}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 cursor-pointer"
                  >
                    Use “{trimmedQuery}”
                  </button>
                </li>
              )}
              {filtered.map((option) => (
                <li key={option.en}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.en)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                      option.en === value ? 'bg-orange-50 text-orange-600 cursor-pointer' : 'text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-950 cursor-pointer'
                    }`}
                  >
                    <span>
                      {option.en} <span className="text-gray-400 dark:text-gray-100">({option.bn})</span>
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && !showCustomOption && (
                <li className="px-3 py-2 text-sm text-gray-400">No matches found</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function PaymentOption({ label, selected, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-md border px-3 py-3 text-left text-sm font-medium cursor-pointer text-gray-700 dark:text-white transition ${
        selected ? 'border-orange-400' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {icon}
      <span>{label}</span>
      {selected && (
        <span className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500 text-white">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414l2.792 2.792 6.793-6.793a1 1 0 011.415 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </button>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M8.5 3.5a1 1 0 00-1 1V5h5v-.5a1 1 0 00-1-1h-3zM4 6.5h12l-.72 9.36A2 2 0 0113.29 17.5H6.71a2 2 0 01-1.99-1.64L4 6.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 ${className}`}>
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CodIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white">
     <Image src={Cashon} alt='img'/>
    </span>
  );
}

function CardIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded rounded-2xl text-white">
      <Image src={Card} alt='img'/>
    </span>
  );
}

function BkashIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
      <Image src={Bkash} alt='img'/>
    </span>
  );
}

function NagadIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
      <Image src={Nagad} alt='img'/>
    </span>
  );
}