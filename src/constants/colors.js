export const COLOR_MAP = {
  'black':        '#1a1a1a',
  'white':        '#ffffff',
  'off white':    '#f5f0e8',
  'beige':        '#d4b896',
  'grey':         '#9e9e9e',
  'navy blue':    '#1a237e',
  'brown':        '#6d4c41',
  'red':          '#e53935',
  'maroon':       '#7b1a1a',
  'wine':         '#6a1a2e',
  'pink':         '#f48fb1',
  'fuchsia':      '#e040fb',
  'peach':        '#ffcba4',
  'rose':         '#f06292',
  'sky blue':     '#81d4fa',
  'royal blue':   '#1565c0',
  'teal':         '#00897b',
  'turquoise':    '#26c6da',
  'denim blue':   '#3a6186',
  'green':        '#43a047',
  'olive':        '#827717',
  'mint':         '#a5d6a7',
  'emerald':      '#00897b',
  'bottle green': '#1b5e20',
  'yellow':       '#fdd835',
  'mustard':      '#f9a825',
  'golden':       '#ffc107',
  'orange':       '#fb8c00',
  'rust':         '#bf360c',
  'purple':       '#8e24aa',
  'lavender':     '#ce93d8',
  'lilac':        '#b39ddb',
  'plum':         '#6a1b9a',
  'violet':       '#5e35b1',
  'pastel pink':  '#f8bbd0',
  'baby blue':    '#bbdefb',
  'blue':         '#2196f3',
  'gold':         '#d4af37',
  'multicolor':   null,
  'printed':      null,
  'floral':       null,
  'striped':      null,
  'checked':      null,
}

// shared formatter
export const formatColorLabel = (key) =>
  key.replace(/\b\w/g, (c) => c.toUpperCase())
// Shade → primary family, so the filter shows one swatch per family.
const FAMILY_OF = {
  black: 'Black', white: 'White', cream: 'White', ivory: 'White', off: 'White',
  grey: 'Grey', gray: 'Grey', silver: 'Grey',
  brown: 'Brown', beige: 'Brown', coffee: 'Brown', khaki: 'Brown', tan: 'Brown',
  red: 'Red', maroon: 'Red', wine: 'Red', burgundy: 'Red',
  pink: 'Pink', rose: 'Pink', fuchsia: 'Pink', magenta: 'Pink', mauve: 'Pink',
  orange: 'Orange', rust: 'Orange', peach: 'Orange', coral: 'Orange',
  yellow: 'Yellow', mustard: 'Yellow', gold: 'Yellow', golden: 'Yellow', lemon: 'Yellow',
  green: 'Green', olive: 'Green', mint: 'Green', emerald: 'Green', pista: 'Green', sage: 'Green',
  blue: 'Blue', navy: 'Blue', teal: 'Blue', turquoise: 'Blue', aqua: 'Blue', indigo: 'Blue', denim: 'Blue',
  purple: 'Purple', lavender: 'Purple', lilac: 'Purple', plum: 'Purple', violet: 'Purple',
}

export const FAMILY_HEX = {
  Black: '#1a1a1a', White: '#ffffff', Grey: '#9e9e9e', Brown: '#6d4c41',
  Red: '#e53935', Pink: '#f48fb1', Orange: '#fb8c00', Yellow: '#fdd835',
  Green: '#43a047', Blue: '#1e63c4', Purple: '#8e24aa', Multicolor: null,
}

// Base colour is usually the last word ("Mustard Yellow", "Rust Red"); combos like "Black & Red" → Multicolor.
export const colorFamily = (name) => {
  const s = (name || '').toLowerCase()
  if (/[&,/+]| and /.test(s)) return 'Multicolor'
  const words = s.split(/[\s-]+/).reverse()
  for (const w of words) if (FAMILY_OF[w]) return FAMILY_OF[w]
  return 'Multicolor'
}
