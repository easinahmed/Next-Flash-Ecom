"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setErrorMsg("Enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setStatus("error");
      setErrorMsg("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Something went wrong. Try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
          {status === "success" ? (
            <SuccessState email={email} onBack={() => setStatus("idle")} />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Forgot your password?
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the email linked to your account and we&apos;ll send you a
                  link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-offset-0 ${
                      status === "error"
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-300 focus:border-gray-900 focus:ring-gray-100"
                    }`}
                    aria-invalid={status === "error"}
                    aria-describedby={status === "error" ? "email-error" : undefined}
                  />
                  {status === "error" && (
                    <p id="email-error" className="mt-1.5 text-sm text-red-600">
                      {errorMsg}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" && (
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  {status === "loading" ? "Sending link..." : "Send reset link"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Remembered your password?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessState({ email, onBack }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-gray-900">Check your email</h1>
      <p className="mt-2 text-sm text-gray-500">
        We&apos;ve sent a password reset link to{" "}
        <span className="font-medium text-gray-700">{email}</span>. The link
        expires in 15 minutes.
      </p>

      <button
        onClick={onBack}
        className="mt-6 text-sm font-medium text-gray-900 hover:underline"
      >
        Use a different email
      </button>

      <p className="mt-4 text-sm text-gray-500">
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}