import React, { useState } from 'react'
import { ShoppingBag, Search, Heart, User, Menu, X } from 'lucide-react'
import { useCartStore } from './store/cartStore'
import { ADMIN_CATEGORIES as CATEGORIES } from './utils/categories'

import logo from './assets/logo.jpg'

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
  display: 'block',
  padding: '10px 0',
  fontSize: '13px',
  color: '#282c3f',
  textDecoration: 'none',
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
    backgroundColor: '#fff',
    borderTop: '1px solid #f0f0f0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    padding: '24px 32px',
    zIndex: 200,
  }}
>
      <style>{`
        @keyframes mmFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mm-link { display: block; font-size: 13px; color: #282c3f; padding: 4px 0; cursor: pointer; text-decoration: none; line-height: 1.5; transition: color 0.1s; }
        .mm-link:hover { color: #ff3f6c; }
        .mm-section-title { font-size: 13px; font-weight: 700; color: #ff3f6c; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; cursor: pointer; }
        .mm-section-title:hover { text-decoration: underline; }
        .mm-divider { border: none; border-top: 0.5px solid #f0f0f0; margin: 8px 0 12px; }
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
                ci < columns.length - 1 ? '0.5px solid #f0f0f0' : 'none',
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

const token = localStorage.getItem('jwt_token')
const customer = localStorage.getItem('customer')
const customerData = customer ? JSON.parse(customer) : null
const isLoggedIn = !!token
  const cart = useCartStore((state) => state.cart)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav
      style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
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
  alt="Logo"
  style={{
    height: '40px',
    width: 'auto',
    objectFit: 'contain'
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
                    color: isActive ? '#ff3f6c' : '#282c3f',
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
                        background: '#ff3f6c',
                        color: '#fff',
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
                        background: '#ff3f6c',
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
            background: '#f5f5f6',
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
          <Search size={16} color='#94969f' />
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
              color: '#282c3f',
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
      color: '#282c3f',
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
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.03em',
      }}
    >
      {isLoggedIn ? customerData?.name || 'Profile' : 'Profile'}
    </span>
  </button>

  {profileOpen && (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '260px',
        background: '#fff',
        border: '1px solid #eaeaec',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderRadius: '4px',
        padding: '16px',
        zIndex: 999,
      }}
    >
      {isLoggedIn ? (
        <>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>
            Hello {customerData?.name}
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#696b79',
              marginBottom: '14px',
            }}
          >
            {customerData?.mobile_no}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0' }} />

          <div style={{ paddingTop: '12px' }}>
            <a href="/orders" style={menuItemStyle}>Orders</a>
            <a href="/wishlist" style={menuItemStyle}>Wishlist</a>
            <a href="/profile" style={menuItemStyle}>Profile</a>

            <button
              onClick={() => {
                localStorage.removeItem('jwt_token')
                localStorage.removeItem('customer')
                window.location.href = '/'
              }}
              style={{
                ...menuItemStyle,
                background: 'none',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>
            Welcome
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#696b79',
              margin: '8px 0 14px',
            }}
          >
            To access account and manage orders
          </div>

          <a
            href="/login"
            style={{
              display: 'inline-block',
              border: '1px solid #ff3f6c',
              color: '#ff3f6c',
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: '4px',
              marginBottom: '14px',
            }}
          >
            LOGIN / SIGNUP
          </a>
        </>
      )}
    </div>
  )}
</div>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#282c3f',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '2px',
            }}
            className='icon-btn'
          >
            <Heart size={20} />
            <span
              style={{
                fontSize: '10px',
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
              color: '#282c3f',
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
                  fontSize: '10px',
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
                  background: '#ff3f6c',
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
              color: '#282c3f',
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
        <div style={{ borderTop: '1px solid #f0f0f0', background: '#fff' }}>
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
              style={{ borderBottom: '0.5px solid #f0f0f0' }}
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
                  color: activeMenu === item.name ? '#ff3f6c' : '#282c3f',
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
                      background: '#ff3f6c',
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
                <div style={{ padding: '0 16px 16px', background: '#fafafa' }}>
                  {item.columns
                    .flatMap((col) => col.sections)
                    .map((section, si) => (
                      <div key={si} style={{ marginBottom: '12px' }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#ff3f6c',
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
                              color: '#282c3f',
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
        .icon-btn:hover svg { color: #ff3f6c !important; stroke: #ff3f6c !important; }
        .icon-btn:hover span { color: #ff3f6c !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

export default Navbar
