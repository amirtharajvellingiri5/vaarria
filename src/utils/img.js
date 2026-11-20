// ponytail: Cloudflare Image Transformations on the cdn zone resizes + picks AVIF/WebP per browser.
// onerror=redirect falls back to the original file if a transform ever fails.
const CDN = 'https://cdn.vaarria.com'

// Accepts a bare filename, a /path on the CDN, or a full (possibly already transformed) CDN URL.
export function img(src, width) {
  if (!src) return ''
  let path
  if (src.startsWith(CDN + '/')) path = src.slice(CDN.length)
  else if (/^(https?:|data:|blob:)/.test(src)) return src // other hosts / local previews: leave alone
  else path = src.startsWith('/') ? src : `/app/images/${src}`
  path = path.replace(/^\/cdn-cgi\/image\/[^/]+/, '') // strip an earlier transform
  return `${CDN}/cdn-cgi/image/width=${width},fit=scale-down,format=auto,quality=80,onerror=redirect${path}`
}

export const srcSet = (src, widths) => widths.map((w) => `${img(src, w)} ${w}w`).join(', ')

// Product cards in a grid: 2 columns on phones, ~4 on desktop.
export const cardImg = (src) => ({
  src: img(src, 400),
  srcSet: srcSet(src, [300, 400, 600, 800]),
  sizes: '(min-width: 1024px) 25vw, 50vw',
})
