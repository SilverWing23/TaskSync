<template>
  <div class="gantt-page">
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <component :is="icons.ArrowLeft" />
          <span>返回</span>
        </el-button>
        <h1>{{ project?.name }} - 甘特图</h1>
      </div>
    </div>
    
    <div class="gantt-container">
      <div class="gantt-header">
        <div class="task-list-header">
          <span>任务列表</span>
        </div>
        <div class="timeline-header">
          <div class="time-labels">
            <span v-for="month in visibleMonths" :key="month">{{ month }}</span>
          </div>
          <div class="day-grid">
            <div 
              v-for="day in visibleDays" 
              :key="day.dateStr"
              :class="['day-cell', { today: day.isToday }]"
            >
              <span class="day-num">{{ day.day }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="gantt-body">
        <div class="task-list">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="task-row"
          >
            <div class="task-info">
              <span :class="['priority-dot', task.priority]"></span>
              <span class="task-name">{{ task.title }}</span>
              <span class="task-assignee">{{ task.assignee_name }}</span>
            </div>
          </div>
        </div>
        
        <div class="timeline-body">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="task-timeline-row"
          >
            <div 
              v-if="getTaskPosition(task)"
              class="task-bar"
              :class="[task.priority, task.status]"
              :style="getTaskBarStyle(task)"
              :title="task.title"
            >
              <span class="bar-label">{{ task.title }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="legend">
        <span class="legend-title">图例</span>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-dot high"></span>
            <span>高优先级</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot medium"></span>
            <span>中优先级</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot low"></span>
            <span>低优先级</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { useTaskStore } from '../stores/task';
import * as icons from 'lucide-vue-next';
const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const projectId = computed(() => parseInt(route.params.id));
const project = computed(() => projectStore.currentProject);
const tasks = computed(() => taskStore.tasks);
const startDate = ref(null);
const endDate = ref(null);
const visibleDays = computed(() => {
 if (!startDate.value || !endDate.value)
 return [];
 const days = [];
 const start = new Date(startDate.value);
 const end = new Date(endDate.value);
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 while (start <= end) {
 days.push({
 dateStr: formatDate(start),
 day: start.getDate(),
 isToday: start.getTime() === today.getTime(),
 date: new Date(start)
 });
 start.setDate(start.getDate() + 1);
 }
 return days;
});
const visibleMonths = computed(() => {
 const months = [];
 let currentMonth = null;
 visibleDays.value.forEach(day => {
 const month = `${day.date.getFullYear()}年${day.date.getMonth() + 1}月`;
 if (month !== currentMonth) {
 currentMonth = month;
 months.push(month);
 }
 });
 return months;
});
function formatDate(date) {
 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2, '0');
 const day = String(date.getDate()).padStart(2, '0');
 return `${year}-${month}-${day}`;
}
function getTaskPosition(task) {
 if (!task.start_date && !task.due_date)
 return null;
 const taskStart = task.start_date ? new Date(task.start_date) : new Date(task.due_date);
 const taskEnd = task.due_date ? new Date(task.due_date) : new Date(task.start_date);
 return { start: taskStart, end: taskEnd };
}
function getTaskBarStyle(task) {
 const position = getTaskPosition(task);
 if (!position)
 return { display: 'none' };
 const dayWidth = 30;
 const startIndex = visibleDays.value.findIndex(d => d.dateStr === formatDate(position.start));
 const endIndex = visibleDays.value.findIndex(d => d.dateStr === formatDate(position.end));
 if (startIndex === -1 || endIndex === -1)
 return { display: 'none' };
 return {
 left: `${startIndex * dayWidth}px`,
 width: `${(endIndex - startIndex + 1) * dayWidth - 4}px`
 };
}
function goBack() {
 router.push(`/projects/${projectId.value}`);
}
function calculateDateRange() {
 if (!tasks.value.length) {
 const now = new Date();
 startDate.value = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
 endDate.value = formatDate(new Date(now.getFullYear(), now.getMonth() + 2, 0));
 return;
 }
 let minDate = null;
 let maxDate = null;
 tasks.value.forEach(task => {
 if (task.start_date) {
 const date = new Date(task.start_date);
 if (!minDate || date < minDate)
 minDate = date;
 }
 if (task.due_date) {
 const date = new Date(task.due_date);
 if (!maxDate || date > maxDate)
 maxDate = date;
 }
 });
 if (!minDate)
 minDate = new Date();
 if (!maxDate)
 maxDate = new Date(minDate.getTime() + 30 * 24 * 60 * 60 * 1000);
 const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
 const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
 startDate.value = formatDate(start);
 endDate.value = formatDate(end);
}
onMounted(async () => {
 await projectStore.fetchProject(projectId.value);
 await taskStore.fetchTasks(projectId.value);
 calculateDateRange();
});
</script>

<style scoped>
.gantt-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  padding: 8px 12px;
  color: #6b7280;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.gantt-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.gantt-header {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
}

.task-list-header {
  width: 250px;
  min-width: 250px;
  padding: 12px;
  font-weight: 600;
  color: #6b7280;
  border-right: 1px solid #e5e7eb;
}

.timeline-header {
  flex: 1;
  min-width: 800px;
}

.time-labels {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.time-labels span {
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.day-grid {
  display: flex;
}

.day-cell {
  width: 30px;
  min-width: 30px;
  height: 36px;
  border-right: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell.today {
  background: #dbeafe;
}

.day-num {
  font-size: 12px;
  color: #6b7280;
}

.gantt-body {
  display: flex;
  max-height: 500px;
  overflow-y: auto;
}

.task-list {
  width: 250px;
  min-width: 250px;
  border-right: 1px solid #e5e7eb;
}

.task-row {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-dot.high {
  background: #ef4444;
}

.priority-dot.medium {
  background: #f59e0b;
}

.priority-dot.low {
  background: #10b981;
}

.task-name {
  flex: 1;
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-assignee {
  font-size: 12px;
  color: #6b7280;
}

.timeline-body {
  flex: 1;
  min-width: 800px;
}

.task-timeline-row {
  position: relative;
  height: 52px;
  border-bottom: 1px solid #f3f4f6;
}

.task-bar {
  position: absolute;
  top: 10px;
  height: 32px;
  border-radius: 6px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.task-bar:hover {
  transform: scaleY(1.1);
}

.task-bar.high {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.task-bar.medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.task-bar.low {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.task-bar.completed {
  opacity: 0.5;
}

.bar-label {
  font-size: 12px;
  color: #fff;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  margin-top: 16px;
}

.legend-title {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.legend-items {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.high {
  background: #ef4444;
}

.legend-dot.medium {
  background: #f59e0b;
}

.legend-dot.low {
  background: #10b981;
}
</style>