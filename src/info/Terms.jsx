export default function TermsAndConditionsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content:
        'By accessing, browsing, or purchasing from our women’s fashion ecommerce platform, you agree to these Terms and Conditions.'
    },
    {
      title: 'Account Registration',
      content:
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.'
    },
    {
      title: 'Products & Pricing',
      content:
        'We strive to ensure product descriptions, sizing, images, and pricing are accurate. Minor variations in color or appearance may occur due to display settings. Prices may change without prior notice.'
    },
    {
      title: 'Orders & Payments',
      content:
        'Orders are confirmed only after successful payment authorization or confirmation of cash-on-delivery eligibility. We reserve the right to cancel suspicious or unavailable orders.'
    },
    {
      title: 'Shipping & Delivery',
      content:
        'Delivery timelines are estimates and may vary based on location, courier operations, weather, or unforeseen circumstances.'
    },
    {
      title: 'Returns, Exchanges & Refunds',
      content:
        'Eligible products may be returned or exchanged according to the store return policy. Items must be unused, with original tags and packaging unless otherwise stated.'
    },
    {
      title: 'Sizing Disclaimer',
      content:
        'Customers should review size charts before purchase. Fit may vary depending on style, fabric, and design.'
    },
    {
      title: 'Promotions & Discount Codes',
      content:
        'Promotional offers may be time-limited, non-transferable, and subject to exclusions. Misuse may result in cancellation.'
    },
    {
      title: 'Intellectual Property',
      content:
        'All designs, logos, product images, branding, and site content are protected intellectual property and may not be reused without permission.'
    },
    {
      title: 'Limitation of Liability',
      content:
        'We are not liable for indirect, incidental, or consequential damages arising from use of the platform or purchased products, to the extent permitted by law.'
    },
    {
      title: 'Privacy',
      content:
        'Use of customer information is governed by our Privacy Policy.'
    },
    {
      title: 'Changes to Terms',
      content:
        'We may update these terms at any time. Continued use of the platform constitutes acceptance of revised terms.'
    }
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-8 py-12 border-b border-stone-100 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-stone-500 mb-3">Legal</p>
            <h1 className="text-4xl md:text-5xl font-light text-stone-900">Terms & Conditions</h1>
            <p className="mt-4 text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Please review the terms governing purchases, usage, and services on our women’s fashion store.
            </p>
          </div>

          <div className="px-8 py-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="pb-6 border-b border-stone-100 last:border-b-0">
                <h2 className="text-xl font-medium text-stone-900 mb-3">{section.title}</h2>
                <p className="text-stone-600 leading-7">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
