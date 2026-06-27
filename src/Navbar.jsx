import React, { useState, useEffect } from 'react'
import { ShoppingBag, Search, Heart, User, Menu, X } from 'lucide-react'
import { useBagStore, getGuestBag } from './store/bagStore'
import { useAuthStore } from './store/authStore'
import { useWishlistStore } from './store/wishlistStore'
import { useNavigate } from 'react-router-dom'
import { ADMIN_CATEGORIES as CATEGORIES } from './utils/categories'
import { ORDERS_URL } from './config'

const logo = '/vlogo.png'

// Keep in sync with the page content rail (max-w-screen-2xl + lg:px-8)
// so the logo and content left edges align
const PAGE_CONTAINER = {
  maxWidth: '1536px',
  margin: '0 auto',
  padding: '0 32px',
  width: '100%',
}

const getCategoryBySlug = (slug) => CATEGORIES.find((cat) => cat.slug === slug)

const getCategoryNameBySlug = (slug) => {
  const match = getCategoryBySlug(slug)
  return match ? match.name : slug.replace(/-/g, ' ')
}

const getCategoryUrl = (slug) => `/${slug}`

const MENU_DATA = [
  {
  name: 'ALL',
  url: '/',
  columns: [
    {
      sections: [
        {
          title: 'Indian & Fusion Wear',
          links: [
            { slug: 'kurtas-suits', url: getCategoryUrl('kurtas-suits') },
            { slug: 'kurtis-tops', url: getCategoryUrl('kurtis-tops') },
            { slug: 'sarees', url: getCategoryUrl('sarees') },
            { slug: 'dress-materials', url: getCategoryUrl('dress-materials') },
            { slug: 'dupattas-shawls', url: getCategoryUrl('dupattas-shawls') },
          ],
        },
      ],
    },
    {
      sections: [
        {
          title: 'Western Wear',
          links: [
            { slug: 'dresses', url: getCategoryUrl('dresses') },
            { slug: 'tunics', url: getCategoryUrl('tunics') },
          ],
        },
      ],
    },
    {
      sections: [
        {
          title: 'Bottom Wear',
          links: [
            { slug: 'leggings', url: getCategoryUrl('leggings') },
            { slug: 'straight-pants', url: getCategoryUrl('straight-pants') },
          ],
        },
      ],
    },
    ,
    {
      sections: [
        {
          title: 'Nightwear',
          links: [
            { slug: 'leggings', url: getCategoryUrl('leggings') },
            { slug: 'straight-pants', url: getCategoryUrl('straight-pants') },
          ],
        },
      ],
    },
  ],
},

  {
    name: 'ETHNIC WEAR',
    url: '/women',
    columns: [
      {
        sections: [
          {
            title: 'Indian & Fusion Wear',
            links: [
              { slug: 'kurtas-suits', url: getCategoryUrl('kurtas-suits') },
              { slug: 'kurtis-tops', url: getCategoryUrl('kurtis-tops') },
              { slug: 'sarees', url: getCategoryUrl('sarees') },
              { slug: 'dress-materials', url: getCategoryUrl('dress-materials') },
              { slug: 'dupattas-shawls', url: getCategoryUrl('dupattas-shawls') },
            ],
          },
        ],
      },
    ],
  },

  {
    name: 'WESTERN',
    url: '/kids',
    columns: [
      {
        sections: [
          {
            title: "Western Wear",
            links: [
              { slug: 'dresses', url: getCategoryUrl('dresses') },
              { slug: 'tunics', url: getCategoryUrl('tunics') }
            ],
          },
        ],
      },
    ],
  },

  {
    name: 'BOTTOMS',
    url: '/home',
    columns: [
      {
        sections: [
          {
            title: 'Bottom Wear',
            links: [
              { slug: 'leggings', url: getCategoryUrl('leggings') },
              { slug: 'straight-pants', url: getCategoryUrl('straight-pants') },
            ],
          },
        ],
      },
    ],
  },

  {
    name: 'NIGHTWEAR',
    url: '/genz',
    columns: [],
  },

  {
    name: 'SALE',
    url: '/studio',
    isNew: true,
    columns: [],
  },
]

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 14px',
  fontSize: '13px',
  color: '#F9F6F0',
  textDecoration: 'none',
  borderRadius: '4px',
  transition: 'background 0.15s, color 0.15s',
  letterSpacing: '0.02em',
}

// ── MegaMenu Component ────────────────────────────────────────────────────────
const MegaMenu = ({ columns }) => {
  if (!columns || columns.length === 0) return null

  return (
    <div
  style={{
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(90vw, 1200px)',
    backgroundColor: '#0a1628',
    borderTop: '1px solid #1a2d4a',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    padding: '24px 32px',
    zIndex: 200,
  }}
>
      <style>{`
        @keyframes mmFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mm-link { display: block; font-size: 13px; color: #C9A84C; padding: 4px 0; cursor: pointer; text-decoration: none; line-height: 1.5; transition: color 0.1s; }
        .mm-link:hover { color: #E8C060; }
        .mm-section-title { font-size: 13px; font-weight: 800; color: #E8C060; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; cursor: pointer; }
        .mm-section-title:hover { text-decoration: underline; }
        .mm-divider { border: none; border-top: 0.5px solid #1a2d4a; margin: 8px 0 12px; }
      `}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          gap: '0 32px',
        }}
      >
        {columns.map((col, ci) => (
          <div
            key={ci}
            style={{
              borderRight:
                ci < columns.length - 1 ? '0.5px solid #1a2d4a' : 'none',
              paddingRight: ci < columns.length - 1 ? '32px' : 0,
            }}
          >
            {col.sections.map((section, si) => (
              <div key={si} style={{ marginBottom: '16px' }}>
                <div className='mm-section-title'>{section.title}</div>
                {section.links.map((link) => (
                  <a key={link.slug} href={link.url} className='mm-link'>
                    {getCategoryNameBySlug(link.slug)}
                  </a>
                ))}
                {si < col.sections.length - 1 && <hr className='mm-divider' />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Navbar Component ──────────────────────────────────────────────────────────
const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)

  const navigate = useNavigate()
  const { token, customer: customerData, logout } = useAuthStore()
  const isLoggedIn = !!token
  const bagItems = useBagStore((state) => state.items)
  const setItems = useBagStore((state) => state.setItems)
  const cartCount = bagItems.reduce((sum, item) => sum + (item.qty || 0), 0)
  const { load: loadWishlist, productIds: wishlistIds } = useWishlistStore()
  const wishlistCount = wishlistIds.size

  useEffect(() => {
    if (customerData?.customer_id) loadWishlist(customerData.customer_id)
  }, [customerData?.customer_id])

  useEffect(() => {
    if (!customerData?.customer_id) {
      setItems(getGuestBag())
      return
    }
    fetch(`${ORDERS_URL}/bags/customers/${customerData.customer_id}/bag`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.items)) {
          setItems(data.items.map(item => ({ id: item.bag_id, qty: item.quantity })))
        }
      })
      .catch(() => {})
  }, [customerData?.customer_id, setItems])

  return (
    <nav
      style={{
        background: '#050C1C',
        borderBottom: '1px solid #0d1e3a',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      {/* ── Desktop Nav ── */}
      <div
        style={{
          ...PAGE_CONTAINER,
          display: 'flex',
          alignItems: 'center',
          height: '60px',
          gap: '0',
        }}
      >
        {/* Logo */}
        <a href='/' style={{ marginRight: '5%' }}>
          <img
  src={logo}
  alt="VAARRIA — Adorn Your Aura"
  style={{
    height: '48px',
    width: 'auto',
    objectFit: 'contain',
  }}
/>
        </a>

        {/* Nav Items */}
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%' }}
          className='hidden-mobile'
        >
          {MENU_DATA.map((item) => {
            const isActive = activeMenu === item.name
            return (
              <div
                key={item.name}
                style={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={() => setActiveMenu(item.name)}
              >
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 14px',
                    height: '100%',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isActive ? '#E8C060' : '#C9A84C',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    position: 'relative',
                    transition: 'color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                  {item.isNew && (
                    <span
                      style={{
                        fontSize: '9px',
                        background: '#C9A84C',
                        color: '#050C1C',
                        borderRadius: '3px',
                        padding: '1px 4px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        marginTop: '-10px',
                      }}
                    >
                      NEW
                    </span>
                  )}
                  {/* Active underline */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '14px',
                        right: '14px',
                        height: '2px',
                        background: '#16a34a',
                        borderRadius: '1px 1px 0 0',
                      }}
                    />
                  )}
                </button>

                {/* Mega Menu Portal — full-width relative to nav */}
                {isActive && item.columns.length > 0 && (
                  <div
                    style={{
                      position: 'fixed',
                      top: '60px',
                      left: 0,
                      right: 0,
                    }}
                  >
                    <MegaMenu columns={item.columns} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Search Box */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '4px',
            padding: '0 14px',
            gap: '8px',
            height: '36px',
            minWidth: '260px',
            maxWidth: '360px',
            flex: '1 1 260px',
          }}
          className='hidden-mobile'
        >
          <Search size={16} color='#C9A84C' />
          <input
            type='text'
            placeholder='Search for products'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#F0E6D3',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Right Icons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginLeft: '20px',
          }}
        >
          <div
  style={{ position: 'relative' }}
  onMouseEnter={() => setProfileOpen(true)}
  onMouseLeave={() => setProfileOpen(false)}
>
  <button
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#C9A84C',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      gap: '2px',
    }}
    className='icon-btn'
  >
    <User size={20} />
    <span
      style={{
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.03em',
      }}
    >
      {isLoggedIn ? customerData?.mobile_no || 'Account' : 'Login'}
    </span>
  </button>

  {profileOpen && (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '180px',
        background: '#0a1628',
        border: '1px solid #1a2d4a',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        borderRadius: '4px',
        paddingTop: '8px',
        zIndex: 999,
      }}
    >
      {/* invisible bridge so mouse can travel from button to panel */}
      <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, height: '8px' }} />
      {isLoggedIn ? (
        <div style={{ padding: '10px 14px 6px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#E8C060', marginBottom: '2px' }}>
            Hello {customerData?.mobile_no || customerData?.name}
          </div>
          {customerData?.name && (
            <div style={{ fontSize: '11px', color: '#C9A84C', marginBottom: '4px', opacity: 0.7 }}>
              {customerData.name}
            </div>
          )}
          <hr style={{ border: 'none', borderTop: '1px solid #1a2d4a', marginBottom: '6px' }} />
          <a href="/orders" style={{ ...menuItemStyle, color: '#C9A84C', fontSize: '12px' }}>Orders</a>
          <a href="/wishlist" style={{ ...menuItemStyle, color: '#C9A84C', fontSize: '12px' }}>Wishlist</a>
          <a href="/profile" style={{ ...menuItemStyle, color: '#C9A84C', fontSize: '12px' }}>Profile</a>
          <button
            onClick={() => {
              logout()
              window.location.href = '/'
            }}
            style={{ ...menuItemStyle, color: '#C9A84C', fontSize: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ padding: '10px 14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#E8C060', marginBottom: '4px' }}>
            Welcome
          </div>
          <div style={{ fontSize: '11px', color: '#C9A84C', marginBottom: '10px', opacity: 0.7, lineHeight: 1.4 }}>
            Sign in to manage orders
          </div>
          <a
            href="/login"
            style={{
              display: 'block',
              border: '1px solid #C9A84C',
              color: '#C9A84C',
              padding: '7px 12px',
              fontSize: '11px',
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            LOGIN / SIGNUP
          </a>
        </div>
      )}
    </div>
  )}
</div>
          <button
            onClick={() => navigate('/wishlist')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#C9A84C',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '2px',
              position: 'relative',
            }}
            className='icon-btn'
          >
            <Heart size={20} fill={wishlistCount > 0 ? '#C9A84C' : 'none'} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#050C1C', color: '#C9A84C',
                fontSize: 9, fontWeight: 700, borderRadius: '50%',
                width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #C9A84C',
              }}>{wishlistCount > 9 ? '9+' : wishlistCount}</span>
            )}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              Wishlist
            </span>
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#C9A84C',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '2px',
            }}
            className='icon-btn'
          >
            <a href='/bag'>
              <ShoppingBag size={20} />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                }}
              >
                Bag
              </span>
            </a>
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: '#16a34a',
                  color: '#fff',
                  fontSize: '10px',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#C9A84C',
              display: 'none',
            }}
            className='show-mobile'
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Nav ── */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid #1a2d4a', background: '#050C1C' }}>
          {/* Mobile search */}
          <div style={{ padding: '12px 16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f5f5f6',
                borderRadius: '4px',
                padding: '8px 14px',
                gap: '8px',
              }}
            >
              <Search size={16} color='#94969f' />
              <input
                type='text'
                placeholder='Search for products, brands and more'
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
          {MENU_DATA.map((item) => (
            <div
              key={item.name}
              style={{ borderBottom: '0.5px solid #1a2d4a' }}
            >
              <button
                onClick={() =>
                  setActiveMenu(activeMenu === item.name ? null : item.name)
                }
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: activeMenu === item.name ? '#E8C060' : '#C9A84C',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'inherit',
                }}
              >
                {item.name}
                {item.isNew && (
                  <span
                    style={{
                      fontSize: '9px',
                      background: '#16a34a',
                      color: '#fff',
                      borderRadius: '3px',
                      padding: '1px 5px',
                      fontWeight: 700,
                    }}
                  >
                    NEW
                  </span>
                )}
              </button>

              {activeMenu === item.name && item.columns.length > 0 && (
                <div style={{ padding: '0 16px 16px', background: '#0a1628' }}>
                  {item.columns
                    .flatMap((col) => col.sections)
                    .map((section, si) => (
                      <div key={si} style={{ marginBottom: '12px' }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#E8C060',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '6px',
                          }}
                        >
                          {section.title}
                        </div>
                        {section.links.map((link) => (
                          <a
                            key={link.slug}
                            href={link.url}
                            style={{
                              display: 'block',
                              fontSize: '13px',
                              color: '#C9A84C',
                              padding: '3px 0',
                              textDecoration: 'none',
                            }}
                          >
                            {getCategoryNameBySlug(link.slug)}
                          </a>
                        ))}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile   { display: none !important; }
        .icon-btn:hover svg { color: #E8C060 !important; stroke: #E8C060 !important; }
        .icon-btn:hover span { color: #E8C060 !important; }
        input::placeholder { color: rgba(240,230,211,0.45) !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

export default Navbar
