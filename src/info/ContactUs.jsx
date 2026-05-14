export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
              Contact Us
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              We’d love to hear from you
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              For product inquiries, support, collaborations, or business-related
              communication, feel free to get in touch with our team.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Send us a message</h2>
            <p className="mt-2 text-sm text-gray-500">
              Fill out the form below and our team will get back to you shortly.
            </p>

            <form className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Write your message"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Submit Message
              </button>
            </form>
          </div>

          {/* Company Info */}
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Company Information</h2>
            <p className="mt-2 text-sm text-gray-600">
              Reach out to us through the following details.
            </p>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Company Name
                </h3>
                <p className="mt-2 text-base font-medium leading-7 text-gray-900">
                  CHATOYANTVORTEX PRIME ENTERPRISES PRIVATE LIMITED
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Registered Office Address
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-700">
                  No.385/A, 3rd Floor Office area, AECS Layout B Block,
                  7th Main Road, Bengaluru, Bengaluru Urban,
                  Karnataka - 560068
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  CIN
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-700">
                  U74995TZ2016PTC027468
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Customer Care
                </h3>
                <a
                  href="tel:9731580157"
                  className="mt-2 inline-block text-base font-medium text-black underline underline-offset-4"
                >
                  +91 9731580157
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
