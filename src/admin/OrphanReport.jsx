import React, { useState, useEffect } from 'react'
import {
  RefreshCw,
  AlertTriangle,
  Database,
  Image as ImageIcon,
  Loader2,
  Trash2,
  ShieldAlert,
} from 'lucide-react'

import AdminNav from './AdminNav'
import { INVENTORY_URL } from '../config'
import { useAuthStore } from '../store/authStore'
import { authHeaders } from '../utils/authHeaders'

const CDN = 'https://cdn.vaarria.com/'
const API = `${INVENTORY_URL}/products/orphans`

const formatBytes = (n) => {
  if (!n) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(1)} ${units[i]}`
}

const REASON_LABEL = {
  no_image_reference: 'No image reference (no stock)',
  image_missing_in_r2: 'Image missing in R2',
}

// ── Main Component ────────────────────────────────────────────────────────────
const OrphanReport = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyKv, setBusyKv] = useState(() => new Set())
  const [busyImg, setBusyImg] = useState(() => new Set())
  const [bulkBusy, setBulkBusy] = useState('')

  useEffect(() => {
    fetchOrphans()
  }, [])

  const fetchOrphans = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API, { headers: authHeaders() })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setData(await res.json())
    } catch {
      setError('Failed to load orphan report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteKvKeys = async (keys) => {
    const res = await fetch(`${INVENTORY_URL}/products/orphans/kv`, {
      method: 'DELETE',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
  }

  const deleteImageKeys = async (keys) => {
    const res = await fetch(`${INVENTORY_URL}/products/orphans/images`, {
      method: 'DELETE',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
  }

  const handleDeleteOneKv = async (key) => {
    setBusyKv((s) => new Set(s).add(key))
    try {
      await deleteKvKeys([key])
      setData((d) => ({ ...d, orphan_kv: d.orphan_kv.filter((o) => o.key !== key) }))
    } catch {
      setError('Failed to delete that KV key.')
    } finally {
      setBusyKv((s) => {
        const next = new Set(s)
        next.delete(key)
        return next
      })
    }
  }

  const handleDeleteAllKv = async () => {
    if (!window.confirm(`Delete all ${data.orphan_kv.length} orphan KV keys?`)) return
    setBulkBusy('kv')
    try {
      await deleteKvKeys(data.orphan_kv.map((o) => o.key))
      setData((d) => ({ ...d, orphan_kv: [] }))
    } catch {
      setError('Failed to delete orphan KV keys.')
    } finally {
      setBulkBusy('')
    }
  }

  const handleDeleteOneImage = async (key) => {
    setBusyImg((s) => new Set(s).add(key))
    try {
      await deleteImageKeys([key])
      setData((d) => ({ ...d, orphan_images: d.orphan_images.filter((o) => o.key !== key) }))
    } catch {
      setError('Failed to delete that image.')
    } finally {
      setBusyImg((s) => {
        const next = new Set(s)
        next.delete(key)
        return next
      })
    }
  }

  const handleDeleteAllImages = async () => {
    if (!window.confirm(`Delete all ${data.orphan_images.length} orphan images?`)) return
    setBulkBusy('img')
    try {
      await deleteImageKeys(data.orphan_images.map((o) => o.key))
      setData((d) => ({ ...d, orphan_images: [] }))
    } catch {
      setError('Failed to delete orphan images.')
    } finally {
      setBulkBusy('')
    }
  }

  return (
    <div
      className='min-h-screen bg-stone-950 text-stone-100'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'
        rel='stylesheet'
      />

      <AdminNav />

      <div className='max-w-7xl mx-auto px-6 py-8 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-bold text-stone-100'>Orphan Report</h1>
            <p className='text-xs text-stone-500'>
              Cloudflare KV keys and R2 images with no matching DynamoDB product.
            </p>
          </div>
          <button
            onClick={fetchOrphans}
            disabled={loading}
            className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors disabled:opacity-40'
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className='flex items-center justify-center gap-3 py-20 text-stone-500'>
            <Loader2 size={18} className='animate-spin' /> Scanning DynamoDB, KV and R2…
          </div>
        ) : error ? (
          <div className='flex flex-col items-center justify-center gap-3 py-20 text-stone-500'>
            <AlertTriangle size={24} className='text-rose-400' />
            <p className='text-sm'>{error}</p>
            <button
              onClick={fetchOrphans}
              className='px-4 py-2 rounded-xl text-sm border border-stone-700 text-stone-300 hover:border-stone-500 transition-colors'
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-3 gap-4'>
              <div className='bg-stone-950 border border-stone-800 rounded-2xl px-5 py-4'>
                <p className='text-xs text-stone-500'>DynamoDB products</p>
                <p className='text-2xl font-bold text-stone-100'>{data.dynamo_product_count}</p>
                <p className='text-xs text-stone-600 mt-1'>{data.kv_product_key_count} KV product keys</p>
              </div>
              <div className='bg-stone-950 border border-stone-800 rounded-2xl px-5 py-4'>
                <p className='text-xs text-stone-500'>R2 images</p>
                <p className='text-2xl font-bold text-stone-100'>{data.r2_image_count}</p>
                <p className='text-xs text-stone-600 mt-1'>referenced by DynamoDB</p>
              </div>
              <div className='bg-stone-950 border border-stone-800 rounded-2xl px-5 py-4'>
                <p className='text-xs text-stone-500'>Broken inventory rows</p>
                <p className='text-2xl font-bold text-stone-100'>{data.dynamo_broken.length}</p>
                <p className='text-xs text-stone-600 mt-1'>missing or dead image reference</p>
              </div>
            </div>

            <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
              <div className='flex items-center justify-between gap-2 px-5 py-4 border-b border-stone-800 bg-stone-900/40'>
                <div className='flex items-center gap-2'>
                  <Database size={14} className='text-rose-400' />
                  <h2 className='text-sm font-bold text-stone-100'>
                    Orphan KV keys ({data.orphan_kv.length})
                  </h2>
                </div>
                {data.orphan_kv.length > 0 && (
                  <button
                    onClick={handleDeleteAllKv}
                    disabled={bulkBusy === 'kv'}
                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-800/60 text-rose-400 hover:bg-rose-950/40 transition-colors disabled:opacity-40'
                  >
                    {bulkBusy === 'kv' ? <Loader2 size={12} className='animate-spin' /> : <Trash2 size={12} />}
                    Delete all
                  </button>
                )}
              </div>
              <div className='overflow-x-auto'>
                {data.orphan_kv.length === 0 ? (
                  <p className='py-10 text-center text-sm text-stone-500'>No orphan KV keys found</p>
                ) : (
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-stone-900/60'>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Key
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Title (from value)
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orphan_kv.map((o, i) => (
                        <tr
                          key={o.key}
                          className={`border-t border-stone-800/60 hover:bg-stone-900/40 transition-colors ${i % 2 === 0 ? '' : 'bg-stone-900/10'}`}
                        >
                          <td className='px-4 py-3 text-sm font-mono text-stone-300'>{o.key}</td>
                          <td className='px-4 py-3 text-sm text-stone-400'>{o.title || '—'}</td>
                          <td className='px-4 py-3 text-right'>
                            <button
                              onClick={() => handleDeleteOneKv(o.key)}
                              disabled={busyKv.has(o.key)}
                              className='p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors disabled:opacity-40'
                              title='Delete this KV key'
                            >
                              {busyKv.has(o.key) ? (
                                <Loader2 size={14} className='animate-spin' />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
              <div className='flex items-center justify-between gap-2 px-5 py-4 border-b border-stone-800 bg-stone-900/40'>
                <div className='flex items-center gap-2'>
                  <ImageIcon size={14} className='text-rose-400' />
                  <h2 className='text-sm font-bold text-stone-100'>
                    Orphan images ({data.orphan_images.length})
                  </h2>
                </div>
                {data.orphan_images.length > 0 && (
                  <button
                    onClick={handleDeleteAllImages}
                    disabled={bulkBusy === 'img'}
                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-800/60 text-rose-400 hover:bg-rose-950/40 transition-colors disabled:opacity-40'
                  >
                    {bulkBusy === 'img' ? <Loader2 size={12} className='animate-spin' /> : <Trash2 size={12} />}
                    Delete all
                  </button>
                )}
              </div>
              <div className='overflow-x-auto'>
                {data.orphan_images.length === 0 ? (
                  <p className='py-10 text-center text-sm text-stone-500'>No orphan images found</p>
                ) : (
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-stone-900/60'>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Preview
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Key
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Size
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Last modified
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orphan_images.map((o, i) => (
                        <tr
                          key={o.key}
                          className={`border-t border-stone-800/60 hover:bg-stone-900/40 transition-colors ${i % 2 === 0 ? '' : 'bg-stone-900/10'}`}
                        >
                          <td className='px-4 py-3'>
                            <img
                              src={`${CDN}${o.key}`}
                              alt=''
                              className='w-10 h-10 rounded-lg object-cover border border-stone-700'
                              onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                            />
                          </td>
                          <td className='px-4 py-3 text-sm font-mono text-stone-300 max-w-[360px] truncate'>
                            {o.key}
                          </td>
                          <td className='px-4 py-3 text-sm text-stone-400'>{formatBytes(o.size)}</td>
                          <td className='px-4 py-3 text-sm text-stone-500'>
                            {new Date(o.last_modified).toLocaleString()}
                          </td>
                          <td className='px-4 py-3 text-right'>
                            <button
                              onClick={() => handleDeleteOneImage(o.key)}
                              disabled={busyImg.has(o.key)}
                              className='p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors disabled:opacity-40'
                              title='Delete this image'
                            >
                              {busyImg.has(o.key) ? (
                                <Loader2 size={14} className='animate-spin' />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
              <div className='flex items-center gap-2 px-5 py-4 border-b border-stone-800 bg-stone-900/40'>
                <ShieldAlert size={14} className='text-rose-400' />
                <h2 className='text-sm font-bold text-stone-100'>
                  Broken inventory rows ({data.dynamo_broken.length})
                </h2>
              </div>
              <p className='px-5 pt-3 text-xs text-stone-600'>
                DynamoDB inventory rows with no usable image — fix by editing the product.
              </p>
              <div className='overflow-x-auto'>
                {data.dynamo_broken.length === 0 ? (
                  <p className='py-10 text-center text-sm text-stone-500'>No broken inventory rows found</p>
                ) : (
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-stone-900/60'>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Product ID
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Color
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Size
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Stock
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dynamo_broken.map((o, i) => (
                        <tr
                          key={`${o.product_id}-${o.color}-${o.size}`}
                          className={`border-t border-stone-800/60 hover:bg-stone-900/40 transition-colors ${i % 2 === 0 ? '' : 'bg-stone-900/10'}`}
                        >
                          <td className='px-4 py-3 text-sm font-mono text-stone-300'>{o.product_id}</td>
                          <td className='px-4 py-3 text-sm text-stone-400'>{o.color || '—'}</td>
                          <td className='px-4 py-3 text-sm text-stone-400'>{o.size || '—'}</td>
                          <td className='px-4 py-3 text-sm text-stone-400'>{o.quantity}</td>
                          <td className='px-4 py-3 text-sm text-stone-400'>
                            {REASON_LABEL[o.reason] || o.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrphanReport
