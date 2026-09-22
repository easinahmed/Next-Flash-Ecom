// app/business-information/page.jsx
// Next.js App Router · Tailwind CSS · JavaScript
//
// A trust / legal-information page for FLASH COMFORT, presenting the
// registered business details a customer or payment partner might look for
// (trade license, TIN, BIN, DBID) in a clear, ledger-style layout.

export const metadata = {
  title: "Business Information — Flash",
  description:
    "Registered business and legal information for Flash, including trade license, TIN, BIN, and DBID details.",
};

const registrationDetails = [
  {
    label: "Company Name",
    value: "Flash Comfort",
  },
  {
    label: "Trade License No.",
    value: "TRAD/DSCC/031599/2021",
  },
  {
    label: "TIN Number",
    value: "798433536146",
  },
  {
    label: "BIN Number",
    value: "004688135-0202",
  },
  {
    label: "DBID No.",
    value: "437361334",
  },
];

export default function BusinessInformationPage() {
  return (
    <main className="min-h-screen  text-[#1C2A20]">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        {/* Header */}
        <header className="mb-14 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#B8892B]/40 bg-[#1C2A20]">
            <svg
              viewBox="0 0 24 24"
              fill="#F44336"
              className="h-8 w-8 text-red-500"
              aria-hidden="true"
            >
              <path
                d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="font-serif font-bold text-2xl italic text-orange-500 sm:text-3xl">
            FLASH COMFORT
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight text-black dark:text-white sm:text-4xl">
            Business &amp; legal information
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#1C2A20] font-bold dark:text-gray-300">
            FLASH COMFORT is a registered business operating under the laws of
            Bangladesh. The details below are provided for customers,
            partners, and payment providers who wish to verify our
            registration.
          </p>
        </header>

        {/* Ledger card */}
        <section className="rounded-3xl border border-[#1C2A20]/12 dark:border-gray-400 bg-white dark:bg-gray-800 shadow-[0_1px_0_rgba(28,42,32,0.06)]">
          <div className="border-b border-[#1C2A20]/10 dark:border-gray-400 px-7 py-5 sm:px-9">
            <h2 className="font-serif text-lg text-black font-extrabold dark:text-white">
              Registration details
            </h2>
          </div>

          <dl>
            {registrationDetails.map((item, index) => (
              <div
                key={item.label}
                className={`flex flex-col gap-1 px-7 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:px-9 ${
                  index !== registrationDetails.length - 1
                    ? "border-b border-[#1C2A20]/8 dark:border-gray-400"
                    : ""
                }`}
              >
                <dt className="text-sm text-black font-bold dark:text-white">{item.label}</dt>
                <dd className="font-mono text-[15px] tracking-tight text-[#1C2A20]  dark:text-white sm:text-right">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Footer note */}
        <p className="mt-8 text-center text-sm leading-relaxed text-black font-bold dark:text-gray-200">
          For any question about this registration, or to request supporting
          documents, please{" "}
          <a
            href="/contact"
            className="text-green-500 underline decoration-[#B8892B]/50 underline-offset-2 hover:decoration-[#B8892B]"
          >
            contact us
          </a>
          .
        </p>
      </div>
    </main>
  );
}