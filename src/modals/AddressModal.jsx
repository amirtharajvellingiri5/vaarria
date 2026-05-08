import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

export default function AddressModal({ open, onClose }) {
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    mobile_no: '',
    address_line_1: '',
    address_line_2: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    address_type: 'HOME',
    is_default: true,
  })

  const openAddPopup = () => {
    setShowAddAddressPopup(true)
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSaveAddress = async () => {
    try {
      setLoading(true)

      const response = await fetch('https://api.aarria.com/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: 1,
          ...form,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add address')
      }

      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)

      setShowAddAddressPopup(false)

      setForm({
        full_name: '',
        mobile_no: '',
        address_line_1: '',
        address_line_2: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        address_type: 'HOME',
        is_default: true,
      })
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Main Modal */}
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3'>
        <div className='w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-200 px-5 py-4'>
            <h2 className='text-lg font-bold text-[#1d2433]'>
              Select Delivery Address
            </h2>

            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100'
            >
              <X className='h-5 w-5 text-black' strokeWidth={2} />
            </button>
          </div>

          {/* Pincode */}
          <div className='border-b border-gray-200 bg-[#f5f5f6] px-5 py-4'>
            <div className='flex h-10 items-center rounded-md border border-gray-300 bg-white px-3'>
              <input
                type='text'
                placeholder='Enter Pincode'
                className='flex-1 border-none bg-transparent text-sm text-[#1d2433] outline-none placeholder:text-gray-400'
              />

              <button
                onClick={openAddPopup}
                className='text-[11px] font-bold uppercase tracking-wide text-pink-500'
              >
                Add Address
              </button>
            </div>
          </div>

          {/* Saved Address Header */}
          <div className='flex items-center justify-between border-b border-gray-200 bg-[#f5f5f6] px-5 py-3'>
            <h3 className='text-sm font-bold uppercase tracking-wide text-gray-600'>
              Saved Address
            </h3>

            <button
              onClick={openAddPopup}
              className='text-xs font-semibold text-pink-500'
            >
              + Add New Address
            </button>
          </div>

          {/* Address Card */}
          <div className='px-5 py-5'>
            <div className='flex gap-3'>
              <div className='mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-pink-500'>
                <div className='h-2 w-2 rounded-full bg-pink-500'></div>
              </div>

              <div className='flex-1'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h4 className='text-lg font-bold text-[#1d2433]'>
                        Velmani
                      </h4>

                      <span className='text-sm text-gray-400'>(Default)</span>
                    </div>

                    <div className='mt-3 space-y-1 text-sm leading-6 text-[#1d2433]'>
                      <p>#839, First Floor, 7th Main, AECS B Block</p>

                      <p>Near Fit And Fit Gym</p>

                      <p>Singasandra</p>

                      <p>Bengaluru, Karnataka - 560068</p>
                    </div>

                    <p className='mt-4 text-sm text-[#1d2433]'>
                      Mobile: <span className='font-bold'>9901411006</span>
                    </p>
                  </div>

                  <span className='rounded-full border border-emerald-500 px-3 py-1 text-[10px] font-bold text-emerald-600'>
                    HOME
                  </span>
                </div>

                <div className='mt-5 flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <button className='rounded-md bg-gray-200 px-4 py-2 text-[10px] font-bold uppercase text-[#1d2433]'>
                      Delivering Here
                    </button>

                    <button className='rounded-md border border-[#1d2433] bg-white px-4 py-2 text-[10px] font-bold uppercase text-[#1d2433]'>
                      Edit
                    </button>
                  </div>

                  <button className='flex h-9 w-9 items-center justify-center rounded-md border border-[#1d2433] bg-white'>
                    <Trash2 className='h-4 w-4 text-black' strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='border-t border-gray-200 p-4'>
            <button
              onClick={openAddPopup}
              className='w-full rounded-md border border-[#1d2433] bg-white py-3 text-sm font-bold uppercase text-[#1d2433] hover:bg-gray-50'
            >
              Add New Address
            </button>
          </div>
        </div>
      </div>

      {/* Add Address Popup */}
      {showAddAddressPopup && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-3'>
          <div className='w-full max-w-md rounded-lg bg-white p-5 shadow-2xl'>
            {/* Header */}
            <div className='mb-5 flex items-center justify-between'>
              <h2 className='text-lg font-bold text-[#1d2433]'>Add Address</h2>

              <button
                onClick={() => setShowAddAddressPopup(false)}
                className='rounded-full p-1 hover:bg-gray-100'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Form */}
            <div className='space-y-3'>
              <input
                type='text'
                placeholder='Full Name'
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className='h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-pink-500'
              />

              <input
                type='text'
                placeholder='Mobile Number'
                value={form.mobile_no}
                onChange={(e) => handleChange('mobile_no', e.target.value)}
                className='h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-pink-500'
              />

              <textarea
                rows={3}
                placeholder='Address Line 1'
                value={form.address_line_1}
                onChange={(e) => handleChange('address_line_1', e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-pink-500'
              />

              <input
                type='text'
                placeholder='Address Line 2'
                value={form.address_line_2}
                onChange={(e) => handleChange('address_line_2', e.target.value)}
                className='h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-pink-500'
              />

              <input
                type='text'
                placeholder='Landmark'
                value={form.landmark}
                onChange={(e) => handleChange('landmark', e.target.value)}
                className='h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-pink-500'
              />

              <input
                type='text'
                placeholder='City'
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className='h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-pink-500'
              />

              <input
                type='text'
                placeholder='State'
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className='h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-pink-500'
              />

              <input
                type='text'
                placeholder='Pincode'
                value={form.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className='h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-pink-500'
              />

              <button
                onClick={handleSaveAddress}
                disabled={loading}
                className='h-10 w-full rounded-md bg-pink-500 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50'
              >
                {loading ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className='fixed top-5 left-1/2 z-[100] -translate-x-1/2'>
          <div className='rounded-md bg-[#1d2433] px-5 py-3 text-sm font-semibold text-white shadow-xl'>
            Address added successfully
          </div>
        </div>
      )}
    </>
  )
}
