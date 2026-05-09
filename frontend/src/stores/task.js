import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '../utils/axios'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])
  const currentTask = ref(null)
  const comments = ref([])
  const changes = ref([])
  const attachments = ref([])

  async function fetchTasks(projectId) {
    const response = await axios.get(`/tasks/project/${projectId}`)
    if (response.data.success) {
      tasks.value = response.data.data
    }
    return response.data
  }

  async function fetchTask(id) {
    const response = await axios.get(`/tasks/${id}`)
    if (response.data.success) {
      currentTask.value = response.data.data
    }
    return response.data
  }

  async function createTask(data) {
    const response = await axios.post('/tasks', data)
    if (response.data.success) {
      tasks.value.unshift(response.data.data)
    }
    return response.data
  }

  async function updateTask(id, data) {
    const response = await axios.put(`/tasks/${id}`, data)
    if (response.data.success) {
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data.data
      }
      if (currentTask.value?.id === id) {
        currentTask.value = response.data.data
      }
    }
    return response.data
  }

  async function deleteTask(id) {
    const response = await axios.delete(`/tasks/${id}`)
    if (response.data.success) {
      tasks.value = tasks.value.filter(t => t.id !== id)
    }
    return response.data
  }

  async function batchUpdateTasks(taskIds, updates) {
    const response = await axios.post('/tasks/batch', { taskIds, updates })
    return response.data
  }

  async function fetchComments(taskId) {
    const response = await axios.get(`/tasks/${taskId}/comments`)
    if (response.data.success) {
      comments.value = response.data.data
    }
    return response.data
  }

  async function addComment(taskId, content) {
    const response = await axios.post(`/tasks/${taskId}/comments`, { task_id: taskId, content })
    if (response.data.success) {
      comments.value = response.data.data
    }
    return response.data
  }

  async function fetchChanges(taskId) {
    const response = await axios.get(`/tasks/${taskId}/changes`)
    if (response.data.success) {
      changes.value = response.data.data
    }
    return response.data
  }

  async function fetchAttachments(taskId) {
    const response = await axios.get(`/tasks/${taskId}/attachments`)
    if (response.data.success) {
      attachments.value = response.data.data
    }
    return response.data
  }

  async function addAttachment(taskId, file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (response.data.success) {
      attachments.value = response.data.data
    }
    return response.data
  }

  async function deleteAttachment(id) {
    const response = await axios.delete(`/tasks/attachments/${id}`)
    if (response.data.success) {
      attachments.value = attachments.value.filter(a => a.id !== id)
    }
    return response.data
  }

  async function fetchTodayTasks() {
    const response = await axios.get('/tasks/today')
    return response.data
  }

  async function fetchOverdueTasks() {
    const response = await axios.get('/tasks/overdue')
    return response.data
  }

  async function searchTasks(keyword) {
    const response = await axios.get('/tasks/search', { params: { keyword } })
    return response.data
  }

  return {
    tasks,
    currentTask,
    comments,
    changes,
    attachments,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    batchUpdateTasks,
    fetchComments,
    addComment,
    fetchChanges,
    fetchAttachments,
    addAttachment,
    deleteAttachment,
    fetchTodayTasks,
    fetchOverdueTasks,
    searchTasks
  }
})