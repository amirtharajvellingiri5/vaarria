// ponytail: e2e auth bypass, single source of truth for the 3 consumers below.
// Playwright enters the app at `?e2e=<code>`; we stash the code and authFetch
// replays it as the X-E2E-Auth header, so admin/order APIs skip auth for this
// browser session only. Backend still requires the exact code (see auth.py).
// No code present => zero behaviour change for real users.
const KEY = 'e2e_auth'

export function seedE2eAuth() {
  try {
    const code = new URLSearchParams(window.location.search).get('e2e')
    if (code) localStorage.setItem(KEY, code)
  } catch {
    /* private-mode / SSR: nothing to seed */
  }
}

export function getE2eAuth() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
