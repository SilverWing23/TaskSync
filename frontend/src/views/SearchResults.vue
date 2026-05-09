<template>
  <div class="search-results">
    <div class="page-header">
      <el-button type="text" @click="goBack" class="back-btn">
        <component :is="icons.ArrowLeft" />
        <span>返回</span>
      </el-button>
      <div class="search-info">
        <h1>搜索结果</h1>
        <p>搜索关键词: "{{ keyword }}"</p>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <component :is="icons.Spinner" class="loading-icon" />
      <p>搜索中...</p>
    </div>
    
    <div v-else-if="results.length > 0" class="results-container">
      <div class="results-section">
        <h3>任务</h3>
        <div class="task-list">
          <div v-for="task in taskResults" :key="task.id" class="search-task">
            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-project">{{ task.project_name }}</span>
            </div>
            <span :class="['status-tag', task.status]">{{ getStatusText(task.status) }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="results.length > taskResults.length" class="results-section">
        <h3>其他结果</h3>
        <div class="other-list">
          <div v-for="(result, index) in otherResults" :key="index" class="other-item">
            <span>{{ result.title }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <component :is="icons.SearchX" class="empty-icon" />
      <p>未找到相关结果</p>
    </div>
  </div>
</template>

<script setup>import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTaskStore } from '../stores/task';
import * as icons from 'lucide-vue-next';
const router = useRouter();
const route = useRoute();
const taskStore = useTaskStore();
const keyword = ref('');
const results = ref([]);
const loading = ref(false);
const taskResults = computed(() => {
 return results.value.filter(r => r.project_name);
});
const otherResults = computed(() => {
 return results.value.filter(r => !r.project_name);
});
function getStatusText(status) {
 const map = {
 pending: '待处理',
 in_progress: '进行中',
 completed: '已完成',
 overdue: '已逾期',
 closed: '已关闭'
 };
 return map[status] || status;
}
function goBack() {
 router.push('/');
}
async function search() {
 if (!keyword.value.trim())
 return;
 loading.value = true;
 const result = await taskStore.searchTasks(keyword.value);
 if (result.success) {
 results.value = result.data;
 }
 loading.value = false;
}
onMounted(() => {
 keyword.value = route.query.q || '';
 search();
});
</script>

<style scoped>
.search-results {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  padding: 8px 12px;
  color: #6b7280;
}

.search-info h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px;
}

.search-info p {
  color: #6b7280;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  color: #6b7280;
}

.loading-icon {
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.results-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.task-project {
  font-size: 12px;
  color: #6b7280;
}

.status-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.status-tag.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-tag.in_progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-tag.completed {
  background: #d1fae5;
  color: #059669;
}

.status-tag.overdue {
  background: #fee2e2;
  color: #dc2626;
}

.other-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.other-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  color: #9ca3af;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
}
</style>