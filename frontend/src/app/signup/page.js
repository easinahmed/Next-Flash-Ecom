'use client';
import { useState } from 'react';
import Link from "next/link";
import logo from "@/images/icon_light.png"
import Image from "next/image";
import { MoveLeft, Loader2 } from "lucide-react";
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
     const [fullName, setFullName] = useState('');
     const [address, setAddress] = useState('');
     const [email, setEmail] = useState('');
     const [phone, setPhone] = useState('');
     const [password, setPassword] = useState('');
     const [cpassword, setCpassword] = useState('');
     const [error, setError] = useState('');
     const [isLoading, setIsLoading] = useState(false);

     const { signup, isLoggedIn } = useAuth();
     const router = useRouter();

     if (isLoggedIn) {
          router.push('/');
          return null;
     }

     const handleSubmit = async (e) => {
          e.preventDefault();
          setError('');

          if (password !== cpassword) {
               setError('Passwords do not match');
               return;
          }

          setIsLoading(true);
          const result = await signup({
               fullName: fullName.trim(),
               address: address.trim(),
               email: email.trim(),
               phone: phone.trim(),
               password: password.trim(),
          });
          setIsLoading(false);

          if (result.success) {
               router.push('/');
          } else {
               setError(result.error || 'Registration failed');
          }
     };

     return (
          <div>
               <div className="w-full max-w-lg mx-auto px-5 sm:max-w-4xl mt-9 pb-12">
                    <div className="mb-8">
                         <Link href="/"><Image src={logo} alt="logo" className="w-20 min-h-17 rotate-10" />
                         </Link>
                         <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Create your account</h1>
                         <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Join Flash Shoe to order items and track your packages</p>
                    </div>

                    {error && (
                         <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
                              {error}
                         </div>
                    )}

                    <form className="w-full" onSubmit={handleSubmit}>
                         <div className="grid sm:grid-cols-2 gap-6">
                              <div>
                                   <label htmlFor="fname" className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Full Name</label>
                                   <input
                                        type="text"
                                        id="fname"
                                        name="fname"
                                        placeholder="Your Full Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                                   />
                              </div>
                              <div>
                                   <label htmlFor="lname" className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Address</label>
                                   <input
                                        type="text"
                                        id="lname"
                                        name="lname"
                                        placeholder="House, Road, City"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                                   />
                              </div>
                              <div>
                                   <label htmlFor="email"
                                        className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Email</label>
                                   <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="you@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                                   />
                              </div>
                              <div>
                                   <label htmlFor="mobile"
                                        className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Mobile Number</label>
                                   <input
                                        type="tel"
                                        id="mobile"
                                        name="mobile"
                                        placeholder="017*******"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                                   />
                              </div>
                              <div>
                                   <label htmlFor="password"
                                        className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Password</label>
                                   <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                                   />
                              </div>
                              <div>
                                   <label htmlFor="cpassword"
                                        className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Confirm Password</label>
                                   <input
                                        type="password"
                                        id="cpassword"
                                        name="cpassword"
                                        placeholder="••••••••"
                                        value={cpassword}
                                        onChange={(e) => setCpassword(e.target.value)}
                                        required
                                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                                   />
                              </div>
                         </div>

                         <div className="flex items-center justify-between mt-8">
                              <button
                                   type="submit"
                                   disabled={isLoading}
                                   className="py-2.5 px-6 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
                              >
                                   {isLoading ? 'Creating account...' : 'Create an account'}
                              </button>

                              <Link href="/signin"
                                   className="text-blue-700 hover:underline ml-1 font-medium dark:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded flex items-center justify-center gap-1 ">
                                   <MoveLeft className="h-4 w-4" /> Back to Sign In
                              </Link>
                         </div>
                    </form>
               </div>
          </div>
     );
}
