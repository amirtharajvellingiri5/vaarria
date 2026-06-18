import { create } from 'zustand'

const readStorage = () => {
  const token = localStorage.getItem('jwt_token')
  const raw = localStorage.getItem('customer')
  const customer = raw && raw !== 'undefined' ? JSON.parse(raw) : null
  return { token, customer }
}

export const useAuthStore = create((set) => ({
  ...readStorage(),

  login(token, customer) {
    localStorage.setItem('jwt_token', token)
    localStorage.setItem('customer', JSON.stringify(customer))
    set({ token, customer })
  },

  logout() {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('customer')
    set({ token: null, customer: null })
  },
}))
