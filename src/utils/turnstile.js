// Cloudflare Turnstile: proves login/checkout requests come from a real browser on vaarria.com.
// Usually invisible; shows a small checkbox only when Cloudflare is unsure.
// ponytail: falls back to Cloudflare's always-pass test key until VITE_TURNSTILE_SITE_KEY is set.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

let script
const load = () =>
  (script ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.onload = resolve
    s.onerror = () => { script = null; reject(new Error('Turnstile failed to load')) }
    document.head.appendChild(s)
  }))

// Tokens are single-use, so each call renders a fresh widget and removes it once done.
// Resolves '' on any failure; the backend decides whether that's allowed.
export async function getTurnstileToken() {
  try {
    await load()
  } catch {
    return ''
  }
  const box = document.createElement('div')
  box.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:10000'
  document.body.appendChild(box)
  return new Promise((resolve) => {
    let id
    const done = (token) => {
      clearTimeout(timer)
      try { window.turnstile.remove(id) } catch { /* already gone */ }
      box.remove()
      resolve(token)
    }
    const timer = setTimeout(() => done(''), 30000)
    id = window.turnstile.render(box, {
      sitekey: SITE_KEY,
      appearance: 'interaction-only',
      callback: done,
      'error-callback': () => done(''),
    })
  })
}
