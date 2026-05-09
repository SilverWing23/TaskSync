<template>
  <div class="app-container" v-if="isAuthenticated">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <component :is="icons.Briefcase" class="logo-icon" />
          <span class="logo-text">任务管理</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <el-menu :default-active="activeMenu" mode="vertical" class="sidebar-menu">
          <el-menu-item index="/" @click="navigate('/')">
            <template #icon>
              <component :is="icons.LayoutDashboard" />
            </template>
            <span>数据大盘</span>
          </el-menu-item>
          
          <el-menu-item index="/projects" @click="navigate('/projects')">
            <template #icon>
              <component :is="icons.FolderKanban" />
            </template>
            <span>项目管理</span>
          </el-menu-item>
          
          <el-menu-item index="/teams" @click="navigate('/teams')">
            <template #icon>
              <component :is="icons.Users" />
            </template>
            <span>团队管理</span>
          </el-menu-item>
          
          <el-menu-item index="/users" v-if="userStore.user?.role === 'super_admin'" @click="navigate('/users')">
            <template #icon>
              <component :is="icons.UserCheck" />
            </template>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info" @click="navigate('/profile')">
          <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" class="avatar" />
          <div v-else class="avatar-placeholder">
            <component :is="icons.User" />
          </div>
          <span class="user-name">{{ userStore.user?.nickname || userStore.user?.username }}</span>
        </div>
        <el-button type="text" class="logout-btn" @click="handleLogout">
          <component :is="icons.LogOut" />
          <span>退出登录</span>
        </el-button>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="top-bar">
        <div class="top-bar-left">
          <slot name="header-left"></slot>
        </div>
        
        <div class="top-bar-center">
          <div class="search-box">
            <component :is="icons.Search" class="search-icon" />
            <input type="text" v-model="searchKeyword" placeholder="搜索项目、任务、成员..." class="search-input" @keyup.enter="handleSearch" />
          </div>
        </div>
        
        <div class="top-bar-right">
          <div class="notification-badge" @click="navigate('/notifications')">
            <component :is="icons.Bell" class="notification-icon" />
            <span v-if="notificationStore.unreadCount > 0" class="badge">{{ notificationStore.unreadCount }}</span>
          </div>
        </div>
      </header>
      
      <div class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
  
  <router-view v-else />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import { useNotificationStore } from './stores/notification'
import { ElMessage } from 'element-plus'
import * as icons from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const searchKeyword = ref('')
const isAuthenticated = computed(() => userStore.isLoggedIn)

const activeMenu = computed(() => route.path)

function navigate(path) {
  router.push(path)
}

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchKeyword.value)}`)
  }
}

onMounted(async () => {
  if (userStore.token) {
    try {
      userStore.initAuth()
      await userStore.getProfile()
      await notificationStore.fetchUnreadCount()
    } catch (error) {
      console.error('Initialization error:', error)
      userStore.logout()
    }
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 240px;
  background: #1f2937;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #374151;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #667eea;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
}

.sidebar-menu {
  background: transparent;
  border: none;
}

.sidebar-menu .el-menu-item {
  color: #d1d5db;
  height: 44px;
  line-height: 44px;
  margin-bottom: 4px;
  border-radius: 8px;
}

.sidebar-menu .el-menu-item:hover {
  background: #374151;
  color: #fff;
}

.sidebar-menu .el-menu-item.is-active {
  background: #667eea;
  color: #fff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #374151;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: #374151;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder svg {
  width: 18px;
  height: 18px;
  color: #9ca3af;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  margin-top: 8px;
  color: #9ca3af;
  justify-content: flex-start;
  padding: 12px;
}

.logout-btn:hover {
  color: #fff;
  background: #dc2626;
  border-radius: 8px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.top-bar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.top-bar-left {
  flex: 1;
}

.top-bar-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.search-box {
  position: relative;
  width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 12px 0 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #667eea;
}

.top-bar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.notification-badge {
  position: relative;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.notification-badge:hover {
  background: #f3f4f6;
}

.notification-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  background: #dc2626;
  color: #fff;
  border-radius: 8px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>