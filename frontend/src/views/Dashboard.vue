<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>数据大盘</h1>
      <p>欢迎回来，{{ userStore.user?.nickname || userStore.user?.username }}</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon project-icon">
          <component :is="icons.FolderKanban" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalProjects || 0 }}</div>
          <div class="stat-label">项目总数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon active-icon">
          <component :is="icons.Timer" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeProjects || 0 }}</div>
          <div class="stat-label">进行中项目</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon overdue-icon">
          <component :is="icons.AlertTriangle" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.overdueTasks || 0 }}</div>
          <div class="stat-label">逾期任务</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon today-icon">
          <component :is="icons.CalendarDays" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.todayTasks || 0 }}</div>
          <div class="stat-label">今日待办</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon task-icon">
          <component :is="icons.CheckSquare" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalTasks || 0 }}</div>
          <div class="stat-label">任务总数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon complete-icon">
          <component :is="icons.CheckCircle" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.completedTasks || 0 }}</div>
          <div class="stat-label">已完成任务</div>
        </div>
      </div>
    </div>
    
    <div class="chart-section">
      <div class="chart-card">
        <div class="chart-header">
          <h3>任务状态分布</h3>
        </div>
        <div ref="statusChart" class="chart-container"></div>
      </div>
      
      <div class="chart-card">
        <div class="chart-header">
          <h3>项目进度趋势</h3>
        </div>
        <div ref="progressChart" class="chart-container"></div>
      </div>
    </div>
    
    <div class="bottom-section">
      <div class="task-list-card">
        <div class="card-header">
          <h3>今日待办</h3>
          <el-button type="text" @click="goToProjects">查看全部</el-button>
        </div>
        <el-list>
          <el-list-item v-for="task in todayTasks" :key="task.id" class="task-item">
            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-project">{{ task.project_name }}</span>
            </div>
            <span :class="['task-status', task.status]">{{ getStatusText(task.status) }}</span>
          </el-list-item>
          <div v-if="todayTasks.length === 0" class="empty-state">
            <component :is="icons.CheckCircle" class="empty-icon" />
            <p>今日暂无待办任务</p>
          </div>
        </el-list>
      </div>
      
      <div class="task-list-card">
        <div class="card-header">
          <h3>逾期任务</h3>
          <el-button type="text" @click="goToProjects">立即处理</el-button>
        </div>
        <el-list>
          <el-list-item v-for="task in overdueTasks" :key="task.id" class="task-item overdue">
            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-project">{{ task.project_name }}</span>
            </div>
            <span class="task-due">截止: {{ formatDate(task.due_date) }}</span>
          </el-list-item>
          <div v-if="overdueTasks.length === 0" class="empty-state">
            <component :is="icons.Smile" class="empty-icon" />
            <p>暂无逾期任务</p>
          </div>
        </el-list>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useProjectStore } from '../stores/project';
import { useTaskStore } from '../stores/task';
import * as icons from 'lucide-vue-next';
import * as echarts from 'echarts';
const router = useRouter();
const userStore = useUserStore();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const statusChart = ref(null);
const progressChart = ref(null);
const stats = reactive({
 totalProjects: 0,
 activeProjects: 0,
 totalTasks: 0,
 todayTasks: 0,
 completedTasks: 0,
 overdueTasks: 0
});
const todayTasks = ref([]);
const overdueTasks = ref([]);
function getStatusText(status) {
 const statusMap = {
 pending: '待处理',
 in_progress: '进行中',
 completed: '已完成',
 overdue: '已逾期',
 closed: '已关闭'
 };
 return statusMap[status] || status;
}
function formatDate(dateStr) {
 if (!dateStr)
 return '';
 const date = new Date(dateStr);
 return `${date.getMonth() + 1}/${date.getDate()}`;
}
function goToProjects() {
 router.push('/projects');
}
async function loadStats() {
 const [statsResult, todayResult, overdueResult] = await Promise.all([
 projectStore.fetchDashboardStats(),
 taskStore.fetchTodayTasks(),
 taskStore.fetchOverdueTasks()
 ]);
 if (statsResult.success) {
 Object.assign(stats, statsResult.data);
 }
 if (todayResult.success) {
 todayTasks.value = todayResult.data;
 }
 if (overdueResult.success) {
 overdueTasks.value = overdueResult.data;
 }
}
function initCharts() {
 if (statusChart.value) {
 const chart = echarts.init(statusChart.value);
 chart.setOption({
 tooltip: { trigger: 'item' },
 legend: { bottom: 0, left: 'center' },
 series: [{
 name: '任务状态',
 type: 'pie',
 radius: ['40%', '70%'],
 avoidLabelOverlap: false,
 itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
 label: { show: false },
 emphasis: {
 label: { show: true, fontSize: 14, fontWeight: 'bold' }
 },
 data: [
 { value: stats.completedTasks || 25, name: '已完成', itemStyle: { color: '#10b981' } },
 { value: Math.max(0, (stats.totalTasks || 80) - stats.completedTasks - (stats.overdueTasks || 5)), name: '进行中', itemStyle: { color: '#667eea' } },
 { value: stats.overdueTasks || 5, name: '已逾期', itemStyle: { color: '#ef4444' } },
 { value: Math.max(0, (stats.totalTasks || 80) - stats.completedTasks - (stats.overdueTasks || 5) - 30), name: '待处理', itemStyle: { color: '#f59e0b' } }
 ]
 }]
 });
 window.addEventListener('resize', () => chart.resize());
 }
 if (progressChart.value) {
 const chart = echarts.init(progressChart.value);
 chart.setOption({
 tooltip: { trigger: 'axis' },
 grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
 xAxis: {
 type: 'category',
 data: ['1月', '2月', '3月', '4月', '5月', '6月'],
 axisLine: { lineStyle: { color: '#e5e7eb' } },
 axisLabel: { color: '#6b7280' }
 },
 yAxis: {
 type: 'value',
 axisLine: { show: false },
 axisTick: { show: false },
 splitLine: { lineStyle: { color: '#f3f4f6' } },
 axisLabel: { color: '#6b7280' }
 },
 series: [{
 name: '完成率',
 type: 'line',
 smooth: true,
 data: [45, 52, 68, 75, 82, 88],
 lineStyle: { width: 3, color: '#667eea' },
 areaStyle: {
 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
 { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
 { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
 ])
 },
 itemStyle: { color: '#667eea' },
 symbol: 'circle',
 symbolSize: 8,
 emphasis: {
 itemStyle: { color: '#667eea', borderColor: '#fff', borderWidth: 2 }
 }
 }]
 });
 window.addEventListener('resize', () => chart.resize());
 }
}
onMounted(async () => {
 await loadStats();
 setTimeout(() => {
 initCharts();
 }, 100);
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.page-header p {
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.project-icon {
  background: #e0e7ff;
}

.project-icon svg {
  color: #667eea;
}

.active-icon {
  background: #dbeafe;
}

.active-icon svg {
  color: #3b82f6;
}

.overdue-icon {
  background: #fee2e2;
}

.overdue-icon svg {
  color: #ef4444;
}

.today-icon {
  background: #fef3c7;
}

.today-icon svg {
  color: #f59e0b;
}

.task-icon {
  background: #d1fae5;
}

.task-icon svg {
  color: #10b981;
}

.complete-icon {
  background: #e0e7ff;
}

.complete-icon svg {
  color: #8b5cf6;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.chart-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-header {
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-container {
  height: 250px;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.task-list-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-header .el-button {
  color: #667eea;
  padding: 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item.overdue {
  background: #fef2f2;
  margin: 0 -20px;
  padding: 12px 20px;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.task-project {
  font-size: 12px;
  color: #9ca3af;
}

.task-status {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.task-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.task-status.in_progress {
  background: #dbeafe;
  color: #2563eb;
}

.task-status.completed {
  background: #d1fae5;
  color: #059669;
}

.task-status.overdue {
  background: #fee2e2;
  color: #dc2626;
}

.task-status.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.task-due {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
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