export const generateSlug = (name) => 
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const PRODUCT_CATEGORY_NAMES = [
  'Sarees',
  'Dresses',
]

export const HOME_CATEGORIES = [
  {
    name: 'Sarees',
    slug: 'sarees',
    count: '500+',
    bg: 'bg-gradient-to-br from-pink-100 to-rose-200',
    icon: '🥻',
  },
  {
    name: 'Dresses',
    slug: 'dresses',
    count: '250+',
    bg: 'bg-gradient-to-br from-red-100 to-pink-200',
    icon: '👗',
  },
]

export const ADMIN_CATEGORIES = [
  { category_id: 7, name: 'Sarees', slug: 'sarees' },
  { category_id: 8, name: 'Dress Materials', slug: 'dress-materials' },
  { category_id: 9, name: 'Dupattas & Shawls', slug: 'dupattas-shawls' },
  { category_id: 10, name: 'Dresses', slug: 'dresses' },
  { category_id: 11, name: 'Tunics', slug: 'tunics' },
  { category_id: 12, name: 'Leggings', slug: 'leggings' },
  { category_id: 13, name: 'Straight Pants', slug: 'straight-pants' },
  { category_id: 14, name: 'Suit Set (3 Piece)', slug: 'suit-set-3pc' },
  { category_id: 15, name: 'Suit Set (Top & Dupatta)', slug: 'suit-set-top-dupatta' },
  { category_id: 16, name: 'Suit Set (Top & Kurti)', slug: 'suit-set-top-kurti' },
]