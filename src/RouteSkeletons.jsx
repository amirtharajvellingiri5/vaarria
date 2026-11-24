// ponytail: Suspense fallbacks shaped like each page, shown while a lazy route
// chunk downloads. Navbar is already in the main bundle (Home is eager), so
// rendering it here costs nothing and stops the nav from flashing.
import Navbar from './Navbar'

const Bone = ({ className = '' }) => <div className={`animate-pulse bg-pink-100 rounded ${className}`} />

const Shell = ({ nav, children }) => (
  <div aria-hidden='true' className='min-h-screen bg-[#FAF8F4]'>
    {nav && <Navbar />}
    <div className='max-w-7xl mx-auto px-4 sm:px-6 py-6'>{children}</div>
  </div>
)

export const GridSkeleton = ({ nav = true }) => (
  <Shell nav={nav}>
    <Bone className='h-7 w-48 mb-5' />
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className='bg-white rounded-2xl shadow-md overflow-hidden'>
          <Bone className='aspect-[3/4] w-full rounded-none' />
          <div className='p-3 space-y-2'>
            <Bone className='h-4 w-full' />
            <Bone className='h-4 w-2/3' />
          </div>
        </div>
      ))}
    </div>
  </Shell>
)

export const DetailSkeleton = () => (
  <Shell nav>
    <div className='grid md:grid-cols-2 gap-8'>
      <Bone className='aspect-[3/4] w-full' />
      <div className='space-y-4'>
        <Bone className='h-8 w-3/4' />
        <Bone className='h-6 w-1/3' />
        <Bone className='h-4 w-full' />
        <Bone className='h-4 w-5/6' />
        <Bone className='h-12 w-full mt-6' />
      </div>
    </div>
  </Shell>
)

export const ListSkeleton = ({ nav = true }) => (
  <Shell nav={nav}>
    <Bone className='h-7 w-40 mb-5' />
    <div className='space-y-3'>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className='flex gap-4 bg-white rounded-xl p-4 shadow-sm'>
          <Bone className='w-20 h-24 flex-shrink-0' />
          <div className='flex-1 space-y-2'>
            <Bone className='h-4 w-3/4' />
            <Bone className='h-4 w-1/2' />
            <Bone className='h-4 w-1/4' />
          </div>
        </div>
      ))}
    </div>
  </Shell>
)

export const FormSkeleton = ({ nav = true }) => (
  <Shell nav={nav}>
    <div className='max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6 space-y-4'>
      <Bone className='h-7 w-1/2' />
      <Bone className='h-11 w-full' />
      <Bone className='h-11 w-full' />
      <Bone className='h-11 w-full' />
    </div>
  </Shell>
)

export const TextSkeleton = ({ nav = false }) => (
  <Shell nav={nav}>
    <div className='max-w-3xl mx-auto space-y-3'>
      <Bone className='h-8 w-1/2 mb-4' />
      {Array.from({ length: 8 }, (_, i) => <Bone key={i} className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />)}
    </div>
  </Shell>
)
