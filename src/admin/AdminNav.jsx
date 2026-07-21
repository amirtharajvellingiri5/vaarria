import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Package,
  PlusCircle,
  Truck,
  ExternalLink,
  Moon,
  Sun,
  Waves,
  Sunset,
  Check,
} from 'lucide-react'

import './admin-themes.css'

const LINKS = [
  {
    label: 'Products',
    href: '/admin',
    icon: Package,
    isActive: (path) =>
      path === '/admin' ||
      path === '/admin/' ||
      path.startsWith('/admin/products/edit'),
  },
  {
    label: 'Add Product',
    href: '/admin/products/new',
    icon: PlusCircle,
    isActive: (path) => path.startsWith('/admin/products/new'),
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: Truck,
    isActive: (path) => path.startsWith('/admin/orders'),
  },
]

const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'ocean', label: 'Ocean', icon: Waves },
  { id: 'sand', label: 'Sand', icon: Sunset },
]

const THEME_KEY = 'admin_theme'

function ThemeSwitcher() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || 'dark',
  )
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // don't leak admin theming onto the storefront
  useEffect(
    () => () => document.documentElement.removeAttribute('data-admin-theme'),
    [],
  )

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const current = THEMES.find((t) => t.id === theme) || THEMES[0]
  const CurrentIcon = current.icon

  return (
    <div className='relative' ref={rootRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        title={`Theme: ${current.label}`}
        className='flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors'
      >
        <CurrentIcon size={14} />
        {current.label}
      </button>

      {open && (
        <div className='absolute right-0 mt-1 w-36 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden z-50'>
          {THEMES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTheme(id)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                theme === id
                  ? 'text-rose-400 bg-stone-800'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
              }`}
            >
              <Icon size={13} /> {label}
              {theme === id && <Check size={12} className='ml-auto' />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Common sticky navbar for all admin pages.
 * Page-specific action buttons go in `children` (right side).
 */
export default function AdminNav({ children }) {
  const { pathname } = useLocation()

  return (
    <div className='sticky top-0 z-50 bg-stone-950/95 backdrop-blur border-b border-stone-800'>
      <div className='max-w-7xl mx-auto px-6 h-16 flex items-center gap-6'>
        {/* Brand */}
        <a href='/admin' className='flex items-center gap-1.5 flex-shrink-0 no-underline'>
          <img src='/vlogo.png' alt='VAARRIA' style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
          <span className='text-[10px] uppercase tracking-widest text-stone-500 font-semibold'>
            Admin
          </span>
        </a>

        {/* Links */}
        <nav className='flex items-center gap-1 overflow-x-auto'>
          {LINKS.map(({ label, href, icon: Icon, isActive }) => {
            const active = isActive(pathname)
            return (
              <a
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors no-underline ${
                  active
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800 border border-transparent'
                }`}
              >
                <Icon size={13} /> {label}
              </a>
            )
          })}
          <a
            href='/products'
            target='_blank'
            rel='noreferrer'
            className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors no-underline border border-transparent'
          >
            <ExternalLink size={13} /> View Store
          </a>
        </nav>

        {/* Theme + page actions */}
        <div className='ml-auto flex items-center gap-3 flex-shrink-0'>
          <ThemeSwitcher />
          {children}
        </div>
      </div>
    </div>
  )
}
