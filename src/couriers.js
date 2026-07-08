// Courier partners and their tracking URL templates — {id} is replaced with the AWB/tracking number.
// Shared between the admin tracking form and the customer-facing order tracking link.
export const COURIERS = [
  { name: 'Shiprocket', url: 'https://shiprocket.co/tracking/{id}' },
  { name: 'Delhivery', url: 'https://www.delhivery.com/track/package/{id}' },
  { name: 'Blue Dart', url: 'https://www.bluedart.com/trackdartresultthirdparty?trackFor=0&trackNo={id}' },
  { name: 'DTDC', url: 'https://www.dtdc.in/tracking.asp?strCnno={id}' },
  { name: 'FedEx', url: 'https://www.fedex.com/fedextrack/?trknbr={id}' },
  { name: 'Ekart', url: 'https://ekartlogistics.com/shipmenttrack/{id}' },
  { name: 'XpressBees', url: 'https://www.xpressbees.com/shipment/tracking?awbNo={id}' },
  { name: 'India Post', url: 'https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx' },
  { name: 'Other', url: '' },
]

export const courierUrl = (provider, trackingId) => {
  const courier = COURIERS.find((c) => c.name === provider)
  if (!courier?.url) return ''
  return courier.url.replace('{id}', encodeURIComponent(trackingId || ''))
}
