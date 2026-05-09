import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '../utils/axios'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const dashboardStats = ref(null)

  async function fetchProjects() {
    const response = await axios.get('/projects')
    if (response.data.success) {
      projects.value = response.data.data
    }
    return response.data
  }

  async function fetchProject(id) {
    const response = await axios.get(`/projects/${id}`)
    if (response.data.success) {
      currentProject.value = response.data.data
    }
    return response.data
  }

  async function createProject(data) {
    const response = await axios.post('/projects', data)
    if (response.data.success) {
      projects.value.push(response.data.data)
    }
    return response.data
  }

  async function updateProject(id, data) {
    const response = await axios.put(`/projects/${id}`, data)
    if (response.data.success) {
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = response.data.data
      }
      if (currentProject.value?.id === id) {
        currentProject.value = response.data.data
      }
    }
    return response.data
  }

  async function deleteProject(id) {
    const response = await axios.delete(`/projects/${id}`)
    if (response.data.success) {
      projects.value = projects.value.filter(p => p.id !== id)
    }
    return response.data
  }

  async function fetchDashboardStats() {
    const response = await axios.get('/projects/dashboard')
    if (response.data.success) {
      dashboardStats.value = response.data.data
    }
    return response.data
  }

  async function fetchProjectStats(id) {
    const response = await axios.get(`/projects/${id}/stats`)
    return response.data
  }

  return {
    projects,
    currentProject,
    dashboardStats,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchDashboardStats,
    fetchProjectStats
  }
})