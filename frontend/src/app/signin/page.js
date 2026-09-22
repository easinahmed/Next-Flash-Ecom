'use client';
import React, { useState, useEffect } from 'react';
import logo from "@/images/icon_light.png"
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginForm() {
   const [isVisible, setIsVisible] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const { login, loginWithGoogle, isLoggedIn, isAdmin } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (isLoggedIn) {
         if (isAdmin) {
            router.push('/dashboard');
         } else {
            router.push('/');
         }
      }
   }, [isLoggedIn, isAdmin, router]);

   const toggleVisibility = () => {
      setIsVisible((prevState) => !prevState);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      if (!email.trim() || !password.trim()) {
         setError('Please enter both email and password');
         return;
      }

      setIsLoading(true);
      const result = await login(email.trim(), password.trim());
      setIsLoading(false);

      if (result.success) {
         if (['admin', 'moderator'].includes(result.user.role)) {
            router.push('/dashboard');
         } else {
            router.push('/');
         }
      } else {
         setError(result.error || 'Login failed. Please check your credentials.');
      }
   };

   // Real Google Sign-In: receives a signed ID token from Google,
   // forwards ONLY that token to the backend for verification.
   const handleGoogleSuccess = async (credentialResponse) => {
      setIsLoading(true);
      setError('');

      const idToken = credentialResponse.credential;

      if (!idToken) {
         setIsLoading(false);
         setError('Google Sign-In did not return a token. Please try again.');
         return;
      }

      const result = await loginWithGoogle({ idToken });
      setIsLoading(false);

      if (result.success) {
         router.push('/');
      } else {
         setError(result.error || 'Google Sign-In failed.');
      }
   };

   const handleGoogleError = () => {
      setError('Google Sign-In failed. Please try again.');
   };

   return (
      <main className="px-4 md:px-8 pt-5 flex flex-col items-center justify-center">
         <div className="py-4 max-w-md w-full">
            <div
               className="p-6 rounded-lg bg-white border border-slate-300 shadow-xs md:p-8 dark:bg-neutral-800 dark:border-neutral-700">
               <div className="mb-2 flex justify-center">
                  <Link href="/"><Image src={logo} alt="logo" className="w-20 min-h-17 rotate-10" />
                  </Link>
               </div>
               <div className="text-center">
                  <h1 className="text-slate-900 text-center text-xl font-semibold mb-2 dark:text-slate-50">Welcome back</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Enter your credentials to access your account.</p>
               </div>

               {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
                     <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
               )}

               <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
                  <div>
                     <label htmlFor="email"
                        className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Email Address</label>
                     <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"
                        required
                        disabled={isLoading}
                     />
                  </div>
                  <div className="relative">
                     <label htmlFor="password"
                        className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Password</label>

                     <button
                        type="button"
                        id="togglePassword"
                        onClick={toggleVisibility}
                        aria-label={isVisible ? "Hide password" : "Show password"}
                        aria-pressed={isVisible}
                        className="absolute top-1 right-2 p-0.5 flex cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg"
                           className="size-[18px] fill-slate-400 text-slate-400 overflow-visible" viewBox="0 0 128 128">
                           <path
                              d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z">
                           </path>
                           {!isVisible && (
                              <path
                                 d="M15 15l98 98"
                                 stroke="currentColor"
                                 strokeWidth="10"
                                 strokeLinecap="round"
                                 className="stroke-slate-400"
                              />
                           )}
                        </svg>
                     </button>

                     <input
                        type={isVisible ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"
                        required
                        disabled={isLoading}
                     />
                  </div>

                  <div className="flex items-start flex-wrap gap-2">
                     <label className="flex items-center group has-[input:checked]:text-slate-900 cursor-pointer">
                        <input id="remember" name="remember" type="checkbox" className="sr-only" />
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded outline-1 outline-slate-300 dark:outline-neutral-600
                              bg-white dark:bg-neutral-700
                              group-has-[input:checked]:bg-blue-600
                              group-has-[input:checked]:outline-blue-600" aria-hidden="true">
                           <svg className="size-3 text-white opacity-0 group-has-[input:checked]:opacity-100" viewBox="0 0 12 10"
                              fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 5l3 3 7-7" />
                           </svg>
                        </span>
                        <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                           Remember me
                        </span>
                      </label>

                     <Link href="/forgetpassword"
                        className="ml-auto text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                        Forgot password?
                     </Link>
                  </div>

                  <button type="submit"
                     disabled={isLoading}
                     className={`w-full py-2.5 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                     {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                           </svg>
                           Signing in...
                        </span>
                     ) : 'Sign in'}
                  </button>
               </form>

               <div className="flex items-center gap-4 my-6">
                  <hr className="w-full border-slate-300 dark:border-neutral-700" />
                  <p className="text-sm text-slate-700 text-center dark:text-slate-300">or</p>
                  <hr className="w-full border-slate-300 dark:border-neutral-700" />
               </div>

               <div className="flex justify-center">
                  <GoogleLogin
                     onSuccess={handleGoogleSuccess}
                     onError={handleGoogleError}
                     useOneTap={false}
                     width="320"
                  />
               </div>

               <div className="mt-6 text-slate-900 text-sm text-center dark:text-slate-50">Don't have an account? <Link href="/signup"
                  className="text-blue-700 hover:underline ml-1 font-medium dark:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Sign up</Link>
               </div>
            </div>
         </div>
      </main>
   );
}