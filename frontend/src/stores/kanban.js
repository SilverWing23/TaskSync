import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '../utils/axios'

export const useKanbanStore = defineStore('kanban', () => {
  const columns = ref([])

  async function fetchColumns(projectId) {
    const response = await axios.get(`/kanban/project/${projectId}`)
    if (response.data.success) {
      columns.value = response.data.data
    }
    return response.data
  }

  async function createColumn(projectId, name, statusMapping) {
    const response = await axios.post('/kanban/columns', {
      project_id: projectId,
      name,
      sort_order: columns.value.length,
      status_mapping: statusMapping
    })
    if (response.data.success) {
      columns.value = response.data.data
    }
    return response.data
  }

  async function updateColumn(id, data) {
    const response = await axios.put(`/kanban/columns/${id}`, data)
    if (response.data.success) {
      columns.value = response.data.data
    }
    return response.data
  }

  async function deleteColumn(id, projectId) {
    const response = await axios.delete(`/kanban/columns/${id}?projectId=${projectId}`)
    if (response.data.success) {
      columns.value = response.data.data
    }
    return response.data
  }

  async function moveTask(taskId, newStatus) {
    const response = await axios.put('/kanban/move-task', { taskId, newStatus })
    return response.data
  }

  return {
    columns,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    moveTask
  }
})