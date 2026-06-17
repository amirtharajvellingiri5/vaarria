import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

// Orders handler (DynamoDB-backed) — all address APIs go here
const ORDERS_API_BASE =
  'https://zq0dbjycx6.execute-api.ap-south-1.amazonaws.com/prod'

export default function AddressModal({
  open,
  onClose,
  addresses = [],
  selectedAddress = null,
  onSelectAddress,
onDeleteSuccess,
}){
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDeleteAddress = async (addressId) => {
  try {
    setDeletingId(addressId)

    const response = await fetch(
      `${ORDERS_API_BASE}/addresses/${addressId}?customer_id=1`,
      {
        method: 'DELETE',
      },
    )

    if (!response.ok) {
      throw new Error('Failed to delete address')
    }

    if (selectedAddress?.address_id === addressId) {
      onClose()
    } else {
      onDeleteSuccess?.()
    }
  } catch (error) {
    alert(error.message)
  } finally {
    setDeletingId(null)
  }
}

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
    is_default: false,
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

      const response = await fetch(`${ORDERS_API_BASE}/addresses`, {
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
      setShowAddAddressPopup(false)

      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1500)

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
        is_default: false,
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
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3'>
        <div className='flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-2xl'>
          <div className='flex items-center justify-between border-b border-gray-200 px-5 py-4'>
            <h2 className='text-lg font-bold text-[#1d2433]'>
              Select Delivery Address
            </h2>

            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100'
            >
              <X className='h-5 w-5 text-black' />
            </button>
          </div>

          <div className='flex items-center justify-between border-b border-gray-200 bg-[#f5f5f6] px-5 py-3'>
            <h3 className='text-sm font-bold uppercase tracking-wide text-gray-600'>
              Saved Addresses ({addresses.length})
            </h3>

            <button
              onClick={openAddPopup}
              className='text-xs font-semibold text-pink-500'
            >
              + Add New Address
            </button>
          </div>

          <div className='flex-1 overflow-y-auto px-5 py-4'>
            {addresses.length === 0 ? (
              <div className='py-10 text-center text-sm text-gray-500'>
                No saved addresses
              </div>
            ) : (
              <div className='space-y-4'>
                {addresses.map((address) => {
                  const isSelected =
                    selectedAddress?.address_id === address.address_id

                  return (
                    <div
                      key={address.address_id}
                      className={`rounded-lg border p-4 ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className='flex gap-3'>
                        <div className='mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-pink-500'>
                          {isSelected && (
                            <div className='h-2 w-2 rounded-full bg-pink-500'></div>
                          )}
                        </div>

                        <div className='flex-1'>
                          <div className='flex items-start justify-between gap-3'>
                            <div>
                              <div className='flex items-center gap-2'>
                                <h4 className='text-base font-bold text-[#1d2433]'>
                                  {address.full_name}
                                </h4>

                                {address.is_default && (
                                  <span className='text-xs text-gray-400'>
                                    (Default)
                                  </span>
                                )}
                              </div>

                              <div className='mt-3 space-y-1 text-sm leading-6 text-[#1d2433]'>
                                <p>{address.address_line_1}</p>

                                {address.address_line_2 && (
                                  <p>{address.address_line_2}</p>
                                )}

                                {address.landmark && (
                                  <p>{address.landmark}</p>
                                )}

                                <p>
                                  {address.city}, {address.state} -{' '}
                                  {address.pincode}
                                </p>
                              </div>

                              <p className='mt-4 text-sm text-[#1d2433]'>
                                Mobile:{' '}
                                <span className='font-bold'>
                                  {address.mobile_no}
                                </span>
                              </p>
                            </div>

                            <span className='rounded-full border border-emerald-500 px-3 py-1 text-[10px] font-bold text-emerald-600'>
                              {address.address_type}
                            </span>
                          </div>

                          <div className='mt-5 flex items-center justify-between'>
                           <button
  onClick={async () => {
    if (isSelected || !onSelectAddress) return

    try {
      const customer = JSON.parse(
        localStorage.getItem('customer') || 'null',
      )

      const response = await fetch(
        `${ORDERS_API_BASE}/addresses/${address.address_id}/select?customer_id=${customer.customer_id}`,
        {
          method: 'PUT',
        },
      )

      if (!response.ok) {
        throw new Error('Failed to select address')
      }

      onSelectAddress(address)
    } catch (error) {
      alert(error.message)
    }
  }}
  className={`rounded-md px-4 py-2 text-[10px] font-bold uppercase ${
    isSelected
      ? 'bg-pink-500 text-white cursor-default'
      : 'bg-gray-200 text-[#1d2433] hover:bg-gray-300'
  }`}
>
  {isSelected ? 'Delivering Here' : 'Deliver Here'}
</button>
                           <button
  onClick={() => setDeleteTarget(address)}
  disabled={deletingId === address.address_id}
  className='flex h-9 w-9 items-center justify-center rounded-md border border-[#1d2433] bg-white transition hover:bg-gray-50 disabled:opacity-50'
>
  {deletingId === address.address_id ? (
    <span className='text-[10px] font-bold'>...</span>
  ) : (
    <Trash2 className='h-4 w-4 text-black' />
  )}
</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className='border-t border-gray-200 p-4'>
            <button
              onClick={openAddPopup}
              className='w-full rounded-md border border-[#1d2433] bg-white py-3 text-sm font-bold uppercase text-[#1d2433]'
            >
              Add New Address
            </button>
          </div>
        </div>
      </div>

      {showAddAddressPopup && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-3'>
          <div className='w-full max-w-md rounded-lg bg-white p-5 shadow-2xl'>
            <div className='mb-5 flex items-center justify-between'>
              <h2 className='text-lg font-bold'>Add Address</h2>

              <button onClick={() => setShowAddAddressPopup(false)}>
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='space-y-3'>
              {[
                'full_name',
                'mobile_no',
                'address_line_1',
                'address_line_2',
                'landmark',
                'city',
                'state',
                'pincode',
              ].map((field) => (
                <input
                  key={field}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={field.replaceAll('_', ' ')}
                  className='h-10 w-full rounded-md border border-gray-300 px-3 text-sm'
                />
              ))}

              <button
                onClick={handleSaveAddress}
                disabled={loading}
                className='h-10 w-full rounded-md bg-pink-500 text-xs font-bold uppercase text-white'
              >
                {loading ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className='fixed top-5 left-1/2 z-[100] -translate-x-1/2'>
          <div className='rounded-md bg-[#1d2433] px-5 py-3 text-sm font-semibold text-white shadow-xl'>
            Address added successfully
          </div>
        </div>
      )}

      {deleteTarget && (
  <div className='fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-3'>
    <div className='w-full max-w-sm rounded-lg bg-white shadow-2xl'>
      <div className='flex items-center justify-between border-b border-gray-200 px-5 py-4'>
        <h3 className='text-lg font-bold text-[#1d2433]'>
          Delete Address
        </h3>

        <button
          onClick={() => setDeleteTarget(null)}
          className='flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100'
        >
          <X className='h-5 w-5 text-black' />
        </button>
      </div>

      <div className='px-5 py-5'>
        <p className='text-sm leading-6 text-gray-600'>
          Are you sure you want to delete this address?
        </p>

        <div className='mt-3 rounded-md border border-gray-200 bg-[#f9f9fa] p-3'>
          <div className='text-sm font-semibold text-[#1d2433]'>
            {deleteTarget.full_name}
          </div>

          <div className='mt-2 text-xs leading-5 text-gray-600'>
            {deleteTarget.address_line_1}
            {deleteTarget.address_line_2 && (
              <> , {deleteTarget.address_line_2}</>
            )}
            <br />
            {deleteTarget.city}, {deleteTarget.state} - {deleteTarget.pincode}
          </div>
        </div>
      </div>

      <div className='flex gap-3 border-t border-gray-200 p-4'>
        <button
          onClick={() => setDeleteTarget(null)}
          className='flex-1 rounded-md border border-gray-300 bg-white py-3 text-sm font-bold uppercase tracking-wide text-[#1d2433]'
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await handleDeleteAddress(deleteTarget.address_id)
            setDeleteTarget(null)
          }}
          disabled={deletingId === deleteTarget.address_id}
          className='flex-1 rounded-md bg-pink-500 py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50'
        >
          {deletingId === deleteTarget.address_id
            ? 'Deleting...'
            : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)}
    </>
  )
}