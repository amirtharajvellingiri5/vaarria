import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle, Clock, Loader2 } from 'lucide-react'

import AdminNav from './AdminNav'
import { INVENTORY_URL } from '../config'
import { useAuthStore } from '../store/authStore'
import { authHeaders } from '../utils/authHeaders'

const STATUS_API = `${INVENTORY_URL}/products/category-cache-status`

// ── Main Component ────────────────────────────────────────────────────────────
const CategorySync = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(() => new Set())
  const [syncAllBusy, setSyncAllBusy] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(STATUS_API, { headers: authHeaders() })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json = await res.json()
      setCategories(json.categories || [])
    } catch {
      setError('Failed to load categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const syncOne = async (categoryId) => {
    setBusy((prev) => new Set(prev).add(categoryId))
    try {
      const res = await fetch(`${INVENTORY_URL}/products/sync-category/${categoryId}`, {
        method: 'POST',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await fetchStatus()
    } catch {
      setError(`Sync failed for category ${categoryId}. Please try again.`)
    } finally {
      setBusy((prev) => {
        const next = new Set(prev)
        next.delete(categoryId)
        return next
      })
    }
  }

  const syncAll = async () => {
    setSyncAllBusy(true)
    setError('')
    try {
      await Promise.all(categories.map((c) => syncOne(c.category_id)))
    } finally {
      setSyncAllBusy(false)
    }
  }

  return (
    <div className='min-h-screen bg-stone-950'>
      <AdminNav />

      <div className='max-w-5xl mx-auto px-6 py-8 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-bold text-stone-100'>Category Sync</h1>
            <p className='text-xs text-stone-500'>
              Rebuild the storefront's Cloudflare KV cache for a category from DynamoDB.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={syncAll}
              disabled={syncAllBusy || loading || categories.length === 0}
              className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-800/60 text-rose-400 hover:bg-rose-950/40 transition-colors disabled:opacity-40'
            >
              {syncAllBusy ? <Loader2 size={13} className='animate-spin' /> : <RefreshCw size={13} />}
              Sync all
            </button>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors disabled:opacity-40'
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className='flex items-center justify-center gap-3 py-20 text-stone-500'>
            <Loader2 size={18} className='animate-spin' /> Loading categories…
          </div>
        ) : (
          <>
            {error && (
              <div className='flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-800/60 bg-rose-950/20 text-rose-400 text-xs'>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
              <div className='flex items-center gap-2 px-5 py-4 border-b border-stone-800 bg-stone-900/40'>
                <Clock size={14} className='text-amber-400' />
                <h2 className='text-sm font-bold text-stone-100'>Categories ({categories.length})</h2>
              </div>
              <table className='w-full text-xs'>
                <thead>
                  <tr className='text-stone-500 border-b border-stone-800'>
                    <th className='text-left px-5 py-2 font-medium'>Category</th>
                    <th className='text-left px-5 py-2 font-medium'>Products cached</th>
                    <th className='text-left px-5 py-2 font-medium'>Last synced</th>
                    <th className='text-right px-5 py-2 font-medium'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.category_id} className='border-b border-stone-900 last:border-0'>
                      <td className='px-5 py-2.5 text-stone-300'>{c.category_name}</td>
                      <td className='px-5 py-2.5 text-stone-300'>{c.product_count ?? '—'}</td>
                      <td className='px-5 py-2.5'>
                        {c.synced_at ? (
                          <span className='text-stone-400'>{new Date(c.synced_at).toLocaleString()}</span>
                        ) : (
                          <span className='text-rose-400'>Never synced</span>
                        )}
                      </td>
                      <td className='px-5 py-2.5 text-right'>
                        <button
                          onClick={() => syncOne(c.category_id)}
                          disabled={busy.has(c.category_id)}
                          className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors disabled:opacity-40'
                        >
                          {busy.has(c.category_id) ? (
                            <Loader2 size={12} className='animate-spin' />
                          ) : (
                            <RefreshCw size={12} />
                          )}
                          Sync
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CategorySync
