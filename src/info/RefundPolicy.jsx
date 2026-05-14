export default function RefundPolicyPage() {
  const policies = [
    {
      title: '7-Day Return Policy',
      content:
        'Customers may request a return within 7 days from the date of delivery for eligible products. No questions asked.'
    },
    {
      title: 'Eligibility for Returns',
      content:
        'Returned items must be unused, unwashed, undamaged, and in original condition with tags, labels, and packaging intact.'
    },
    {
      title: 'Non-Returnable Items',
      content:
        'Items marked as final sale, intimate wear, accessories with hygiene restrictions, gift cards, and customized products are not eligible for return unless damaged or incorrect.'
    },
    {
      title: 'Damaged / Incorrect Items',
      content:
        'If you receive a damaged, defective, or incorrect item, please report it within 48 hours of delivery with supporting photos for faster resolution.'
    },
    {
      title: 'Refund Process',
      content:
        'Once the returned product passes quality inspection, the refund will be initiated to the original payment method. Processing timelines may vary depending on your payment provider.'
    },
    {
      title: 'Exchange Option',
      content:
        'Eligible products may be exchanged for a different size or replacement, subject to stock availability.'
    },
    {
      title: 'Return Pickup',
      content:
        'Return pickup availability depends on your delivery location. If pickup is unavailable, customers may be asked to self-ship the item as instructed by support.'
    },
    {
      title: 'Refund Exceptions',
      content:
        'Refunds may be declined if returned items fail quality checks, show signs of use, are missing original tags, or are returned outside the eligible period.'
    }
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-8 py-12 border-b border-stone-100 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-stone-500 mb-3">Customer Support</p>
            <h1 className="text-4xl md:text-5xl font-light text-stone-900">Refund & Return Policy</h1>
            <p className="mt-4 text-stone-600 max-w-2xl mx-auto leading-relaxed">
              We offer a simple 7-day return policy for eligible purchases to ensure a smooth shopping experience.
            </p>
          </div>

          <div className="px-8 py-10 space-y-8">
            {policies.map((policy) => (
              <section key={policy.title} className="pb-6 border-b border-stone-100 last:border-b-0">
                <h2 className="text-xl font-medium text-stone-900 mb-3">{policy.title}</h2>
                <p className="text-stone-600 leading-7">{policy.content}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
