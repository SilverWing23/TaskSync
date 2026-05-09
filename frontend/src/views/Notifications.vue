<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1>消息通知</h1>
      <div class="header-actions">
        <el-button type="text" @click="markAllAsRead">
          <component :is="icons.CheckCircle" />
          <span>全部标为已读</span>
        </el-button>
      </div>
    </div>
    
    <div v-if="notifications.length > 0" class="notification-list">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification-item', { read: notification.read }]"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-icon" :class="notification.type">
          <component :is="getNotificationIcon(notification.type)" />
        </div>
        <div class="notification-content">
          <h3>{{ notification.title }}</h3>
          <p>{{ notification.content }}</p>
          <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
        </div>
        <div class="notification-action">
          <el-button type="text" @click.stop="deleteNotification(notification.id)">
            <component :is="icons.Trash2" />
          </el-button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <component :is="icons.Bell" class="empty-icon" />
      <p>暂无通知</p>
    </div>
  </div>
</template>

<script setup>import { ref, computed, onMounted } from 'vue';
import { useNotificationStore } from '../stores/notification';
import * as icons from 'lucide-vue-next';
const notificationStore = useNotificationStore();
const notifications = computed(() => notificationStore.notifications);
function getNotificationIcon(type) {
 const iconsMap = {
 task_assigned: icons.UserPlus,
 task_due: icons.Clock,
 task_comment: icons.MessageSquare,
 task_status: icons.CheckSquare,
 system: icons.Info
 };
 return iconsMap[type] || icons.Bell;
}
function formatTime(timeStr) {
 if (!timeStr)
 return '';
 const date = new Date(timeStr);
 const now = new Date();
 const diff = now - date;
 const minutes = Math.floor(diff / (1000 * 60));
 const hours = Math.floor(diff / (1000 * 60 * 60));
 const days = Math.floor(diff / (1000 * 60 * 60 * 24));
 if (minutes < 60)
 return `${minutes}分钟前`;
 if (hours < 24)
 return `${hours}小时前`;
 return `${days}天前`;
}
async function markAsRead(id) {
 await notificationStore.markAsRead(id);
}
async function markAllAsRead() {
 await notificationStore.markAllAsRead();
 await notificationStore.fetchNotifications();
}
async function deleteNotification(id) {
 await notificationStore.deleteNotification(id);
}
onMounted(async () => {
 await notificationStore.fetchNotifications();
});
</script>

<style scoped>
.notifications-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-actions .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #667eea;
}

.notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-item.read {
  opacity: 0.6;
  border-left-color: #d1d5db;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon svg {
  width: 24px;
  height: 24px;
  color: #fff;
}

.notification-icon.task_assigned {
  background: #667eea;
}

.notification-icon.task_due {
  background: #f59e0b;
}

.notification-icon.task_comment {
  background: #10b981;
}

.notification-icon.task_status {
  background: #8b5cf6;
}

.notification-icon.system {
  background: #6b7280;
}

.notification-content {
  flex: 1;
}

.notification-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.notification-content p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px;
}

.notification-time {
  font-size: 12px;
  color: #9ca3af;
}

.notification-action .el-button {
  color: #9ca3af;
}

.notification-action .el-button:hover {
  color: #ef4444;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
}
</style>