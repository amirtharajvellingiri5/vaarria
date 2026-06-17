// components/Footer.jsx
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='mt-16' style={{ background: '#050C1C', borderTop: '1px solid #1a2d4a' }}>
      <div className='max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div>
            <h4 className='text-2xl font-bold mb-4' style={{ color: '#E8C060' }}>
              vaarria
            </h4>

            <p style={{ color: '#C9A84C' }}>
              Celebrating Indian heritage through timeless fashion
            </p>
          </div>

          <div>
            <h5 className='font-bold mb-4' style={{ color: '#E8C060' }}>Shop</h5>

            <ul className='space-y-2' style={{ color: '#C9A84C' }}>
              <li>
                <Link to='/products' className='transition hover:text-pink-300'>
                  Sarees
                </Link>
              </li>

              <li>
                <Link to='/products' className='transition hover:text-pink-300'>
                  Lehengas
                </Link>
              </li>

              <li>
                <Link to='/products' className='transition hover:text-pink-300'>
                  Suits
                </Link>
              </li>

              <li>
                <Link to='/products' className='transition hover:text-pink-300'>
                  Kurtis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className='font-bold mb-4' style={{ color: '#E8C060' }}>Customer Care</h5>

            <ul className='space-y-2' style={{ color: '#C9A84C' }}>
              <li>
                <Link to='/contact-us' className='transition hover:text-pink-300'>
                  Contact Us
                </Link>
              </li>

              <li>
                <Link to='/bag' className='transition hover:text-pink-300'>
                  Track Order
                </Link>
              </li>

              <li>
                <Link
                  to='/refund-policy'
                  className='transition hover:text-pink-300'
                >
                  Returns
                </Link>
              </li>

              <li>
                <Link to='/terms' className='transition hover:text-pink-300'>
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className='font-bold mb-4' style={{ color: '#E8C060' }}>Legal</h5>

            <ul className='space-y-2 mb-4' style={{ color: '#C9A84C' }}>
              <li>
                <Link to='/terms' className='transition hover:text-pink-300'>
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  to='/refund-policy'
                  className='transition hover:text-pink-300'
                >
                  Refund Policy
                </Link>
              </li>

              <li>
                <Link to='/login' className='transition hover:text-pink-300'>
                  Login
                </Link>
              </li>
            </ul>

            {/* <p className='text-gray-600 mb-4'>
              Subscribe for exclusive offers
            </p>

            <input
              type='email'
              placeholder='Your email'
              className='w-full px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:border-pink-400'
            /> */}
          </div>
        </div>
<div className='mt-8 pt-8 text-center' style={{ borderTop: '1px solid #1a2d4a', color: '#8A9BB5' }}>
  <p className='text-[0.90rem]'>www.vaarria.com &trade; crafted with love for Indian fashion.</p>
  <p className='mt-2 text-[0.90rem] leading-7'>
    &copy; 2026 CHATOYANTVORTEX PRIME ENTERPRISES PRIVATE LIMITED
  </p>
</div>
      </div>
    </footer>
  )
}

export default Footer