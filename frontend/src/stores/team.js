import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '../utils/axios'

export const useTeamStore = defineStore('team', () => {
  const teams = ref([])
  const currentTeam = ref(null)
  const members = ref([])

  async function fetchTeams() {
    const response = await axios.get('/teams')
    if (response.data.success) {
      teams.value = response.data.data
    }
    return response.data
  }

  async function fetchTeam(id) {
    const response = await axios.get(`/teams/${id}`)
    if (response.data.success) {
      currentTeam.value = response.data.data
    }
    return response.data
  }

  async function createTeam(data) {
    const response = await axios.post('/teams', data)
    if (response.data.success) {
      teams.value.push(response.data.data)
    }
    return response.data
  }

  async function updateTeam(id, data) {
    const response = await axios.put(`/teams/${id}`, data)
    if (response.data.success) {
      const index = teams.value.findIndex(t => t.id === id)
      if (index !== -1) {
        teams.value[index] = response.data.data
      }
      if (currentTeam.value?.id === id) {
        currentTeam.value = response.data.data
      }
    }
    return response.data
  }

  async function deleteTeam(id) {
    const response = await axios.delete(`/teams/${id}`)
    if (response.data.success) {
      teams.value = teams.value.filter(t => t.id !== id)
    }
    return response.data
  }

  async function fetchMembers(teamId) {
    const response = await axios.get(`/teams/${teamId}/members`)
    if (response.data.success) {
      members.value = response.data.data
    }
    return response.data
  }

  async function addMember(teamId, userId, role) {
    const response = await axios.post(`/teams/${teamId}/members`, { user_id: userId, role })
    if (response.data.success) {
      members.value = response.data.data
    }
    return response.data
  }

  async function removeMember(teamId, userId) {
    const response = await axios.delete(`/teams/${teamId}/members/${userId}`)
    if (response.data.success) {
      members.value = response.data.data
    }
    return response.data
  }

  return {
    teams,
    currentTeam,
    members,
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    fetchMembers,
    addMember,
    removeMember
  }
})