// components/Footer.jsx
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='bg-gradient-to-b from-pink-50 to-white border-t border-pink-100 mt-16'>
      <div className='max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div>
            <h4 className='text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-4'>
              aarria
            </h4>

            <p className='text-gray-600'>
              Celebrating Indian heritage through timeless fashion
            </p>
          </div>

          <div>
            <h5 className='font-bold text-gray-800 mb-4'>Shop</h5>

            <ul className='space-y-2 text-gray-600'>
              <li>
                <Link to='/products' className='hover:text-pink-600 transition'>
                  Sarees
                </Link>
              </li>

              <li>
                <Link to='/products' className='hover:text-pink-600 transition'>
                  Lehengas
                </Link>
              </li>

              <li>
                <Link to='/products' className='hover:text-pink-600 transition'>
                  Suits
                </Link>
              </li>

              <li>
                <Link to='/products' className='hover:text-pink-600 transition'>
                  Kurtis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className='font-bold text-gray-800 mb-4'>Customer Care</h5>

            <ul className='space-y-2 text-gray-600'>
              <li>
                <Link to='/contact-us' className='hover:text-pink-600 transition'>
                  Contact Us
                </Link>
              </li>

              <li>
                <Link to='/bag' className='hover:text-pink-600 transition'>
                  Track Order
                </Link>
              </li>

              <li>
                <Link
                  to='/refund-policy'
                  className='hover:text-pink-600 transition'
                >
                  Returns
                </Link>
              </li>

              <li>
                <Link to='/terms' className='hover:text-pink-600 transition'>
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className='font-bold text-gray-800 mb-4'>Legal</h5>

            <ul className='space-y-2 text-gray-600 mb-4'>
              <li>
                <Link to='/terms' className='hover:text-pink-600 transition'>
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  to='/refund-policy'
                  className='hover:text-pink-600 transition'
                >
                  Refund Policy
                </Link>
              </li>

              <li>
                <Link to='/login' className='hover:text-pink-600 transition'>
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
<div className='border-t border-pink-100 mt-8 pt-8 text-center text-gray-600'>
  <p className='text-[0.90rem]'>www.aarria.com &trade; crafted with love for Indian fashion.</p>
  <p className='mt-2 text-[0.90rem] leading-7 text-white-100'>
    &copy; 2026 CHATOYANTVORTEX PRIME ENTERPRISES PRIVATE LIMITED
  </p>
</div>
      </div>
    </footer>
  )
}

export default Footer