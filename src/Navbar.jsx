import React, { useState } from 'react'
import { ShoppingBag, Search, Heart, User, Menu, X } from 'lucide-react'
import { useCartStore } from './store/cartStore'

import logo from './assets/logo.png'

// ── Menu Data ─────────────────────────────────────────────────────────────────
const MENU_DATA = [
  {
    name: 'Men',
    columns: [
      {
        sections: [
          {
            title: 'Indian & Fusion Wear',
            links: ['Kurtas & Suits', 'Sherwanis', 'Men Mojaris', 'Nehru Jackets', 'Dhotis'],
          },
          { title: 'Belts, Scarves & More', links: [] },
          { title: 'Watches & Wearables', links: [] },
        ],
      },
      {
        sections: [
          {
            title: 'Western Wear',
            links: ['Tshirts', 'Casual Shirts', 'Formal Shirts', 'Jeans', 'Trousers & Chinos', 'Shorts', 'Sweatshirts & Hoodies', 'Jackets & Coats', 'Suits & Blazers'],
          },
          { title: 'Plus Size', links: [] },
        ],
      },
      {
        sections: [
          { title: 'Sunglasses & Frames', links: [] },
          {
            title: 'Footwear',
            links: ['Casual Shoes', 'Sports Shoes', 'Formal Shoes', 'Sneakers', 'Sandals & Floaters', 'Boots', 'Flip Flops'],
          },
          {
            title: 'Sports & Active Wear',
            links: ['Clothing', 'Footwear', 'Sports Accessories', 'Sports Equipment'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Gadgets',
            links: ['Smart Wearables', 'Fitness Gadgets', 'Headphones', 'Speakers'],
          },
          {
            title: 'Grooming & Bath',
            links: ['Beard Care', 'Skincare', 'Hair Care', 'Fragrances'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Accessories',
            links: ['Wallets', 'Belts', 'Caps & Hats', 'Ties & Pocket Squares'],
          },
          { title: 'Backpacks', links: [] },
          { title: 'Handbags & Bags', links: [] },
          { title: 'Luggages & Trolleys', links: [] },
        ],
      },
    ],
  },
  {
    name: 'Women',
    columns: [
      {
        sections: [
          {
            title: 'Indian & Fusion Wear',
            links: ['Kurtas & Suits', 'Kurtis, Tunics & Tops', 'Sarees', 'Ethnic Wear', 'Leggings, Salwars & Churidars', 'Skirts & Palazzos', 'Dress Materials', 'Lehenga Cholis', 'Dupattas & Shawls', 'Jackets'],
          },
          { title: 'Belts, Scarves & More', links: [] },
          { title: 'Watches & Wearables', links: [] },
        ],
      },
      {
        sections: [
          {
            title: 'Western Wear',
            links: ['Dresses', 'Tops', 'Tshirts', 'Jeans', 'Trousers & Capris', 'Shorts & Skirts', 'Co-ords', 'Playsuits', 'Jumpsuits', 'Shrugs', 'Sweaters & Sweatshirts', 'Jackets & Coats', 'Blazers & Waistcoats'],
          },
          { title: 'Plus Size', links: [] },
        ],
      },
      {
        sections: [
          { title: 'Maternity', links: [] },
          { title: 'Sunglasses & Frames', links: [] },
          {
            title: 'Footwear',
            links: ['Flats', 'Casual Shoes', 'Heels', 'Boots', 'Sports Shoes & Floaters'],
          },
          {
            title: 'Sports & Active Wear',
            links: ['Clothing', 'Footwear', 'Sports Accessories', 'Sports Equipment'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Lingerie & Sleepwear',
            links: ['Bra', 'Briefs', 'Shapewear', 'Sleepwear & Loungewear', 'Swimwear', 'Camisoles & Thermals'],
          },
          {
            title: 'Beauty & Personal Care',
            links: ['Makeup', 'Skincare', 'Premium Beauty', 'Lipsticks', 'Fragrances'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Gadgets',
            links: ['Smart Wearables', 'Fitness Gadgets', 'Headphones', 'Speakers'],
          },
          {
            title: 'Jewellery',
            links: ['Fashion Jewellery', 'Fine Jewellery', 'Earrings'],
          },
          { title: 'Backpacks', links: [] },
          { title: 'Handbags, Bags & Wallets', links: [] },
          { title: 'Luggages & Trolleys', links: [] },
        ],
      },
    ],
  },
  {
    name: 'Kids',
    columns: [
      {
        sections: [
          {
            title: "Boys' Clothing",
            links: ['Tshirts', 'Shirts', 'Jeans & Trousers', 'Ethnic Wear', 'Party Wear', 'Shorts & 3/4ths'],
          },
        ],
      },
      {
        sections: [
          {
            title: "Girls' Clothing",
            links: ['Dresses & Frocks', 'Tops', 'Jeans, Jeggings & Trousers', 'Ethnic Wear', 'Party Wear'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Footwear',
            links: ['Boys Footwear', 'Girls Footwear'],
          },
          {
            title: 'Toys & Games',
            links: ['Action Figures', 'Board Games', 'Soft Toys'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Accessories',
            links: ['Bags', 'Watches', 'Jewellery'],
          },
        ],
      },
    ],
  },
  {
    name: 'Home',
    columns: [
      {
        sections: [
          {
            title: 'Bed & Bath',
            links: ['Bedsheets', 'Blankets & Quilts', 'Pillows & Cushions', 'Towels'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Furnishing',
            links: ['Curtains', 'Carpets', 'Sofa Covers', 'Table Covers'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Kitchen & Dining',
            links: ['Kitchen Accessories', 'Cookware', 'Dinnerware'],
          },
        ],
      },
      {
        sections: [
          {
            title: 'Decor & Festive',
            links: ['Wall Decor', 'Candles & Diffusers', 'Festive Decor'],
          },
        ],
      },
    ],
  },
  // {
  //   name: 'Beauty',
  //   columns: [
  //     {
  //       sections: [
  //         {
  //           title: 'Makeup',
  //           links: ['Lipstick', 'Foundation', 'Mascara', 'Eyeshadow', 'Blush & Highlighter'],
  //         },
  //       ],
  //     },
  //     {
  //       sections: [
  //         {
  //           title: 'Skincare',
  //           links: ['Moisturiser', 'Serum', 'Sunscreen', 'Face Wash', 'Toner'],
  //         },
  //       ],
  //     },
  //     {
  //       sections: [
  //         {
  //           title: 'Hair Care',
  //           links: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Masks'],
  //         },
  //       ],
  //     },
  //     {
  //       sections: [
  //         {
  //           title: 'Fragrances',
  //           links: ['Perfume', 'Body Mist', 'Deodorant'],
  //         },
  //         { title: 'Premium Beauty', links: [] },
  //       ],
  //     },
  //   ],
  // },
  { name: 'GenZ', columns: [] },
  { name: 'Studio', isNew: true, columns: [] },
]

// ── MegaMenu Component ────────────────────────────────────────────────────────
const MegaMenu = ({ columns }) => {
  if (!columns || columns.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #f0f0f0',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        padding: '24px 32px',
        zIndex: 200,
        animation: 'mmFadeIn 0.15s ease',
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
          <div key={ci} style={{ borderRight: ci < columns.length - 1 ? '0.5px solid #f0f0f0' : 'none', paddingRight: ci < columns.length - 1 ? '32px' : 0 }}>
            {col.sections.map((section, si) => (
              <div key={si} style={{ marginBottom: '16px' }}>
                <div className="mm-section-title">{section.title}</div>
                {section.links.map((link) => (
                  <a key={link} href="#" className="mm-link">{link}</a>
                ))}
                {si < col.sections.length - 1 && <hr className="mm-divider" />}
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
  const cart = useCartStore((state) => state.cart)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav
      style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 0, zIndex: 100 }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      {/* ── Desktop Nav ── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
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
                alt='Logo'
                className='min-h-[60px] h-16 sm:h-20 md:h-24 w-auto object-contain'
              />
            </a>

        {/* Nav Items */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }} className="hidden-mobile">
          {MENU_DATA.map((item) => {
            const isActive = activeMenu === item.name
            return (
              <div
                key={item.name}
                style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
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
                  <div style={{ position: 'fixed', top: '60px', left: 0, right: 0 }}>
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
          className="hidden-mobile"
        >
          <Search size={16} color="#94969f" />
          <input
            type="text"
            placeholder="Search for products"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '20px' }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#282c3f', display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '2px' }}
            className="icon-btn"
          >
            <User size={20} />
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.03em' }}>Profile</span>
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#282c3f', display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '2px' }}
            className="icon-btn"
          >
            <Heart size={20} />
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.03em' }}>Wishlist</span>
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#282c3f', position: 'relative', display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '2px' }}
            className="icon-btn"
          >
            <ShoppingBag size={20} />
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.03em' }}>Bag</span>
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
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#282c3f', display: 'none' }}
            className="show-mobile"
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
            <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f6', borderRadius: '4px', padding: '8px 14px', gap: '8px' }}>
              <Search size={16} color="#94969f" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'inherit' }}
              />
            </div>
          </div>
          {MENU_DATA.map((item) => (
            <div key={item.name} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
              <button
                onClick={() => setActiveMenu(activeMenu === item.name ? null : item.name)}
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
                  <span style={{ fontSize: '9px', background: '#ff3f6c', color: '#fff', borderRadius: '3px', padding: '1px 5px', fontWeight: 700 }}>NEW</span>
                )}
              </button>

              {activeMenu === item.name && item.columns.length > 0 && (
                <div style={{ padding: '0 16px 16px', background: '#fafafa' }}>
                  {item.columns.flatMap((col) => col.sections).map((section, si) => (
                    <div key={si} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff3f6c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        {section.title}
                      </div>
                      {section.links.map((link) => (
                        <a key={link} href="#" style={{ display: 'block', fontSize: '13px', color: '#282c3f', padding: '3px 0', textDecoration: 'none' }}>
                          {link}
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
