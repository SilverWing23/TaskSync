import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '../utils/axios'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  async function login(email, password) {
    const response = await axios.post('/auth/login', { email, password })
    if (response.data.success) {
      token.value = response.data.data.token
      user.value = response.data.data.user
      localStorage.setItem('token', token.value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
    return response.data
  }

  async function register(username, email, password, nickname) {
    const response = await axios.post('/auth/register', { username, email, password, nickname })
    return response.data
  }

  async function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  async function getProfile() {
    const response = await axios.get('/auth/profile')
    if (response.data.success) {
      user.value = response.data.data
    }
    return response.data
  }

  async function updateProfile(data) {
    const response = await axios.put('/auth/profile', data)
    if (response.data.success) {
      user.value = response.data.data
    }
    return response.data
  }

  function initAuth() {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    initAuth
  }
})