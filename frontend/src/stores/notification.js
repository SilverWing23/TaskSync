import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '../utils/axios'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)

  async function fetchNotifications() {
    const response = await axios.get('/notifications')
    if (response.data.success) {
      notifications.value = response.data.data
    }
    return response.data
  }

  async function fetchUnreadCount() {
    const response = await axios.get('/notifications/unread')
    if (response.data.success) {
      unreadCount.value = response.data.data.count
    }
    return response.data
  }

  async function markAsRead(id) {
    const response = await axios.put(`/notifications/${id}/read`)
    if (response.data.success) {
      notifications.value = response.data.data
      unreadCount.value = notifications.value.filter(n => !n.read).length
    }
    return response.data
  }

  async function markAllAsRead() {
    const response = await axios.put('/notifications/read-all')
    if (response.data.success) {
      unreadCount.value = 0
    }
    return response.data
  }

  async function deleteNotification(id) {
    const response = await axios.delete(`/notifications/${id}`)
    if (response.data.success) {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }
    return response.data
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
})