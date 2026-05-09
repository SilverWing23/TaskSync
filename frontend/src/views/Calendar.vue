<template>
  <div class="calendar-page">
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <component :is="icons.ArrowLeft" />
          <span>返回</span>
        </el-button>
        <h1>{{ project?.name }} - 日历视图</h1>
      </div>
    </div>
    
    <div class="calendar-container">
      <div class="calendar-nav">
        <el-button @click="prevMonth">
          <component :is="icons.ChevronLeft" />
        </el-button>
        <span class="current-month">{{ currentYear }}年{{ currentMonth }}月</span>
        <el-button @click="nextMonth">
          <component :is="icons.ChevronRight" />
        </el-button>
        <el-button @click="today">今天</el-button>
      </div>
      
      <div class="calendar-grid">
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>
        <div class="days">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="['day', { 
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'selected': day.dateStr === selectedDate
            }]"
            @click="selectDate(day)"
          >
            <span class="day-number">{{ day.date }}</span>
            <div class="day-tasks">
              <div 
                v-for="task in getTasksForDay(day.dateStr)" 
                :key="task.id"
                class="task-dot"
                :class="task.priority"
                :title="task.title"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="task-list-section">
        <h3>{{ selectedDateLabel }}</h3>
        <div v-if="selectedDateTasks.length > 0" class="task-list">
          <div v-for="task in selectedDateTasks" :key="task.id" class="calendar-task">
            <span :class="['priority-tag', task.priority]"></span>
            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-assignee">{{ task.assignee_name || '未指派' }}</span>
            </div>
            <span :class="['status-tag', task.status]">{{ getStatusText(task.status) }}</span>
          </div>
        </div>
        <div v-else class="empty-state">
          <component :is="icons.Calendar" class="empty-icon" />
          <p>当日暂无任务</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed, onMounted, watch } from 'vue';
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
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const selectedDate = ref('');
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
const calendarDays = computed(() => {
 const year = currentYear.value;
 const month = currentMonth.value - 1;
 const firstDay = new Date(year, month, 1);
 const lastDay = new Date(year, month + 1, 0);
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const days = [];
 const startDay = firstDay.getDay();
 const prevMonthLastDay = new Date(year, month, 0).getDate();
 for (let i = startDay - 1; i >= 0; i--) {
 const date = prevMonthLastDay - i;
 const dateObj = new Date(year, month - 1, date);
 days.push({
 date,
 dateStr: formatDate(dateObj),
 isCurrentMonth: false,
 isToday: false
 });
 }
 for (let i = 1; i <= lastDay.getDate(); i++) {
 const dateObj = new Date(year, month, i);
 const isToday = dateObj.getTime() === today.getTime();
 days.push({
 date: i,
 dateStr: formatDate(dateObj),
 isCurrentMonth: true,
 isToday
 });
 }
 const remainingDays = 42 - days.length;
 for (let i = 1; i <= remainingDays; i++) {
 const dateObj = new Date(year, month + 1, i);
 days.push({
 date: i,
 dateStr: formatDate(dateObj),
 isCurrentMonth: false,
 isToday: false
 });
 }
 return days;
});
const selectedDateLabel = computed(() => {
 if (!selectedDate.value) {
 return '选择日期查看任务';
 }
 return `${selectedDate.value} 的任务`;
});
const selectedDateTasks = computed(() => {
 if (!selectedDate.value)
 return [];
 return tasks.value.filter(t => formatTaskDate(t.due_date) === selectedDate.value);
});
function formatDate(date) {
 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2, '0');
 const day = String(date.getDate()).padStart(2, '0');
 return `${year}-${month}-${day}`;
}
function formatTaskDate(dateStr) {
 if (!dateStr) return '';
 if (dateStr.includes('T')) {
 return dateStr.split('T')[0];
 }
 return dateStr;
}
function getTasksForDay(dateStr) {
 return tasks.value.filter(t => formatTaskDate(t.due_date) === dateStr);
}
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
 router.push(`/projects/${projectId.value}`);
}
function prevMonth() {
 if (currentMonth.value === 1) {
 currentMonth.value = 12;
 currentYear.value--;
 }
 else {
 currentMonth.value--;
 }
}
function nextMonth() {
 if (currentMonth.value === 12) {
 currentMonth.value = 1;
 currentYear.value++;
 }
 else {
 currentMonth.value++;
 }
}
function today() {
 const now = new Date();
 currentYear.value = now.getFullYear();
 currentMonth.value = now.getMonth() + 1;
 selectedDate.value = formatDate(now);
}
function selectDate(day) {
 selectedDate.value = day.dateStr;
}
onMounted(async () => {
 const now = new Date();
 selectedDate.value = formatDate(now);
 console.log('[Calendar] selectedDate:', selectedDate.value);
 await projectStore.fetchProject(projectId.value);
 await taskStore.fetchTasks(projectId.value);
 console.log('[Calendar] tasks loaded:', tasks.value);
 console.log('[Calendar] tasks due_date format:', tasks.value.length > 0 ? tasks.value[0].due_date : 'no tasks');
});
</script>

<style scoped>
.calendar-page {
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

.calendar-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.current-month {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.calendar-grid {
  margin-bottom: 24px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  padding: 12px;
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day {
  aspect-ratio: 1;
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.day:hover {
  background: #e5e7eb;
}

.day.other-month {
  opacity: 0.3;
}

.day.today {
  background: #dbeafe;
}

.day.selected {
  background: #667eea;
  color: #fff;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
}

.day.selected .day-number {
  color: #fff;
}

.day-tasks {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: flex-end;
  justify-content: center;
}

.task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.task-dot.high {
  background: #ef4444;
}

.task-dot.medium {
  background: #f59e0b;
}

.task-dot.low {
  background: #10b981;
}

.task-list-section {
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.task-list-section h3 {
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

.calendar-task {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.priority-tag {
  width: 4px;
  height: 32px;
  border-radius: 2px;
}

.priority-tag.high {
  background: #ef4444;
}

.priority-tag.medium {
  background: #f59e0b;
}

.priority-tag.low {
  background: #10b981;
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.task-assignee {
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
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