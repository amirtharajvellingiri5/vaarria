import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function NotFound() {
  return (
    <div className='min-h-screen' style={{ background: '#F9F6F0' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '96px 16px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', fontFamily: "'Playfair Display', Georgia, serif" }}>Page not found</h1>
        <p style={{ color: '#666', margin: '12px 0 24px' }}>The page you're looking for doesn't exist.</p>
        <Link to='/products' style={{ background: '#C9A84C', color: '#0a1628', padding: '10px 22px', borderRadius: 4, fontWeight: 700, textDecoration: 'none' }}>Shop all products</Link>
      </div>
      <Footer />
    </div>
  )
}
