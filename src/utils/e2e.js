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
  stubMsg91()
}

// ponytail: e2e OTP bypass. Swap in fake MSG91 widget methods so no real OTP is
// sent; verify hands the e2e code to /msg91-login as the access token, and the
// auth Lambda accepts it only for numbers in its TEST_MOBILES env. Any 4 digits work.
function stubMsg91() {
  const code = getE2eAuth()
  if (!code) return
  window.initSendOTP = () => {}
  window.sendOtp = (_mobile, ok) => ok({ message: 'e2e' })
  window.retryOtp = (_channel, ok) => ok({ message: 'e2e' })
  window.verifyOtp = (_otp, ok) => ok({ message: code })
}

export function getE2eAuth() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
