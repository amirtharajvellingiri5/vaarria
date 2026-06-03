export const generateSlug = (name) => 
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const PRODUCT_CATEGORY_NAMES = [
  'Sarees',
  'Kurtas & Suits',
  'Kurtis & Tops',
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
    name: 'Kurtas & Suits',
    slug: 'kurtas-suits',
    count: '350+',
    bg: 'bg-gradient-to-br from-purple-100 to-pink-200',
    icon: '🎀',
  },
  {
    name: 'Kurtis & Tops',
    slug: 'kurtis-tops',
    count: '600+',
    bg: 'bg-gradient-to-br from-amber-100 to-orange-200',
    icon: '👘',
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
  { category_id: 5, name: 'Kurtas & Suits', slug: 'kurtas-suits' },
  { category_id: 6, name: 'Kurtis & Tops', slug: 'kurtis-tops' },
  { category_id: 7, name: 'Sarees', slug: 'sarees' },
  { category_id: 8, name: 'Dress Materials', slug: 'dress-materials' },
  { category_id: 9, name: 'Dupattas & Shawls', slug: 'dupattas-shawls' },
  { category_id: 10, name: 'Dresses', slug: 'dresses' },
  { category_id: 11, name: 'Tunics', slug: 'tunics' },
  { category_id: 12, name: 'Leggings', slug: 'leggings' },
  { category_id: 13, name: 'Straight Pants', slug: 'straight-pants' },
]