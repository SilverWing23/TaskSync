<template>
  <div class="project-detail">
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <component :is="icons.ArrowLeft" />
          <span>返回</span>
        </el-button>
        <div class="project-title-section">
          <h1>{{ project?.name }}</h1>
          <span :class="['status-badge', project?.status]">{{ getStatusText(project?.status) }}</span>
        </div>
      </div>
    </div>
    
    <div class="tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="任务列表" name="list">
          <div class="task-list-container">
            <div class="list-header">
              <el-button type="primary" @click="handleOpenCreateModal">
                <component :is="icons.Plus" />
                <span>新建任务</span>
              </el-button>
              <el-button type="text" @click="showBatchCreateModal = true">
                <component :is="icons.ListPlus" />
                <span>批量新建</span>
              </el-button>
            </div>
            
            <div class="task-filters">
              <el-select v-model="taskFilter.status" placeholder="状态" class="filter-item">
                <el-option label="全部" value="" />
                <el-option label="待处理" value="pending" />
                <el-option label="进行中" value="in_progress" />
                <el-option label="已完成" value="completed" />
                <el-option label="已逾期" value="overdue" />
              </el-select>
              <el-select v-model="taskFilter.priority" placeholder="优先级" class="filter-item">
                <el-option label="全部" value="" />
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
              <el-select v-model="taskFilter.assignee" placeholder="负责人" class="filter-item">
                <el-option label="全部" value="" />
                <el-option v-for="user in users" :key="user.id" :label="user.nickname" :value="user.id" />
              </el-select>
            </div>
            
            <el-table :data="filteredTasks" border class="task-table">
              <el-table-column prop="title" label="任务名称" min-width="200">
                <template #default="scope">
                  <div class="task-title-cell">
                    <span :class="['priority-dot', scope.row.priority]"></span>
                    <span>{{ scope.row.title }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="group_name" label="任务分组" />
              <el-table-column prop="assignee_name" label="负责人" />
              <el-table-column prop="due_date" label="截止日期">
                <template #default="scope">
                  <span :class="{ 'overdue': isOverdue(scope.row.due_date) }">
                    {{ formatDate(scope.row.due_date) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <span :class="['status-tag', scope.row.status]">{{ getTaskStatusText(scope.row.status) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="text" @click="editTask(scope.row)">编辑</el-button>
                  <el-button type="text" @click="copyTask(scope.row)">复制</el-button>
                  <el-button type="text" @click="deleteTask(scope.row)" class="delete-btn">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="看板视图" name="kanban">
          <el-button type="primary" @click="goToKanban">
            <component :is="icons.LayoutGrid" />
            <span>查看完整看板</span>
          </el-button>
        </el-tab-pane>
        
        <el-tab-pane label="日历视图" name="calendar">
          <el-button type="primary" @click="goToCalendar">
            <component :is="icons.Calendar" />
            <span>查看日历视图</span>
          </el-button>
        </el-tab-pane>
        
        <el-tab-pane label="甘特图" name="gantt">
          <el-button type="primary" @click="goToGantt">
            <component :is="icons.Clock" />
            <span>查看甘特图</span>
          </el-button>
        </el-tab-pane>
        
        <el-tab-pane label="项目统计" name="stats">
          <div class="stats-container">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ taskStats.total }}</div>
                <div class="stat-label">总任务数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ taskStats.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ taskStats.inProgress }}</div>
                <div class="stat-label">进行中</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ taskStats.overdue }}</div>
                <div class="stat-label">已逾期</div>
              </div>
            </div>
            
            <div class="progress-section">
              <div class="progress-header">
                <span>项目进度</span>
                <span class="progress-percent">{{ progressPercent }}%</span>
              </div>
              <el-progress :percentage="progressPercent" :show-text="false" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <el-dialog title="新建任务" v-model="showCreateTaskModal" width="600px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务标题" :rules="[{ required: true, message: '请输入任务标题' }]">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="taskForm.description" type="textarea" placeholder="请输入任务描述" :rows="3" />
        </el-form-item>
        <el-form-item label="任务分组">
          <el-select v-model="taskForm.group_id" placeholder="选择任务分组">
            <el-option label="无" :value="null" />
            <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="taskForm.assignee_id" placeholder="选择负责人">
            <el-option label="未指派" :value="null" />
            <el-option v-for="user in users" :key="user.id" :label="user.nickname" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="taskForm.priority" placeholder="选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="taskForm.start_date" type="date" placeholder="选择开始日期" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="taskForm.due_date" type="date" placeholder="选择截止日期" />
        </el-form-item>
        <el-form-item label="工时预估">
          <el-input v-model="taskForm.estimated_hours" type="number" placeholder="预估工时（小时）" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="taskForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateTaskModal = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTask">创建</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="编辑任务" v-model="showEditTaskModal" width="600px">
      <el-form :model="editTaskForm" label-width="100px">
        <el-form-item label="任务标题" :rules="[{ required: true, message: '请输入任务标题' }]">
          <el-input v-model="editTaskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="editTaskForm.description" type="textarea" placeholder="请输入任务描述" :rows="3" />
        </el-form-item>
        <el-form-item label="任务分组">
          <el-select v-model="editTaskForm.group_id" placeholder="选择任务分组">
            <el-option label="无" :value="null" />
            <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="editTaskForm.assignee_id" placeholder="选择负责人">
            <el-option label="未指派" :value="null" />
            <el-option v-for="user in users" :key="user.id" :label="user.nickname" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editTaskForm.priority" placeholder="选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="editTaskForm.status" placeholder="选择状态">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已逾期" value="overdue" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="editTaskForm.start_date" type="date" placeholder="选择开始日期" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="editTaskForm.due_date" type="date" placeholder="选择截止日期" />
        </el-form-item>
        <el-form-item label="工时预估">
          <el-input v-model="editTaskForm.estimated_hours" type="number" placeholder="预估工时（小时）" />
        </el-form-item>
        <el-form-item label="实际工时">
          <el-input v-model="editTaskForm.actual_hours" type="number" placeholder="实际工时（小时）" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="editTaskForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditTaskModal = false">取消</el-button>
        <el-button type="primary" @click="handleEditTask">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="批量新建任务" v-model="showBatchCreateModal" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="任务列表（每行一个）">
          <el-input v-model="batchForm.tasks" type="textarea" placeholder="每行输入一个任务标题" :rows="8" />
        </el-form-item>
        <el-form-item label="任务分组">
          <el-select v-model="batchForm.group_id" placeholder="选择任务分组">
            <el-option label="无" :value="null" />
            <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="batchForm.assignee_id" placeholder="选择负责人">
            <el-option label="未指派" :value="null" />
            <el-option v-for="user in users" :key="user.id" :label="user.nickname" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="batchForm.priority" placeholder="选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showBatchCreateModal = false">取消</el-button>
        <el-button type="primary" @click="handleBatchCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { useTaskStore } from '../stores/task';
import { useUserStore } from '../stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../utils/axios';
import * as icons from 'lucide-vue-next';
const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const userStore = useUserStore();
const activeTab = ref('list');
const projectId = computed(() => parseInt(route.params.id));
const project = computed(() => projectStore.currentProject);
const tasks = computed(() => taskStore.tasks);
const groups = ref([]);
const users = ref([]);
const showCreateTaskModal = ref(false);
const showEditTaskModal = ref(false);
const showBatchCreateModal = ref(false);
const editingTask = ref(null);
const taskFilter = reactive({
 status: '',
 priority: '',
 assignee: ''
});
const taskForm = reactive({
 title: '',
 description: '',
 group_id: null,
 assignee_id: null,
 priority: 'medium',
 status: 'pending',
 start_date: '',
 due_date: '',
 estimated_hours: null,
 tags: ''
});
const editTaskForm = reactive({
 title: '',
 description: '',
 group_id: null,
 assignee_id: null,
 priority: 'medium',
 status: 'pending',
 start_date: '',
 due_date: '',
 estimated_hours: null,
 actual_hours: null,
 tags: ''
});
const batchForm = reactive({
 tasks: '',
 group_id: null,
 assignee_id: null,
 priority: 'medium'
});
const filteredTasks = computed(() => {
 return tasks.value.filter(t => {
 if (taskFilter.status && t.status !== taskFilter.status)
 return false;
 if (taskFilter.priority && t.priority !== taskFilter.priority)
 return false;
 if (taskFilter.assignee && String(t.assignee_id) !== String(taskFilter.assignee))
 return false;
 return true;
 });
});
const taskStats = computed(() => {
 const total = tasks.value.length;
 const completed = tasks.value.filter(t => t.status === 'completed').length;
 const inProgress = tasks.value.filter(t => t.status === 'in_progress').length;
 const overdue = tasks.value.filter(t => t.status === 'overdue' || (t.due_date && isOverdue(t.due_date) && t.status !== 'completed' && t.status !== 'closed')).length;
 return { total, completed, inProgress, overdue };
});
const progressPercent = computed(() => {
 if (taskStats.value.total === 0)
 return 0;
 return Math.round((taskStats.value.completed / taskStats.value.total) * 100);
});
function getStatusText(status) {
 const map = { active: '进行中', archived: '已归档', deleted: '已删除' };
 return map[status] || status;
}
function getTaskStatusText(status) {
 const map = {
 pending: '待处理',
 in_progress: '进行中',
 completed: '已完成',
 overdue: '已逾期',
 closed: '已关闭'
 };
 return map[status] || status;
}
function formatDate(dateStr) {
 if (!dateStr)
 return '-';
 const date = new Date(dateStr);
 return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}
function isOverdue(dateStr) {
 if (!dateStr)
 return false;
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const dueDate = new Date(dateStr);
 return dueDate < today;
}
function goBack() {
 router.push('/projects');
}
function handleOpenCreateModal() {
 console.log('[debug] Open create task modal clicked');
 console.log('[debug] Current showCreateTaskModal value:', showCreateTaskModal.value);
 showCreateTaskModal.value = true;
 console.log('[debug] After setting, showCreateTaskModal value:', showCreateTaskModal.value);
}
function goToKanban() {
 router.push(`/projects/${projectId.value}/kanban`);
}
function goToCalendar() {
 router.push(`/projects/${projectId.value}/calendar`);
}
function goToGantt() {
 router.push(`/projects/${projectId.value}/gantt`);
}
function handleTabChange() {
}
function editTask(task) {
 editingTask.value = task;
 Object.assign(editTaskForm, {
 title: task.title,
 description: task.description || '',
 group_id: task.group_id || null,
 assignee_id: task.assignee_id || null,
 priority: task.priority,
 status: task.status,
 start_date: task.start_date,
 due_date: task.due_date,
 estimated_hours: task.estimated_hours || null,
 actual_hours: task.actual_hours || null,
 tags: task.tags || ''
 });
 showEditTaskModal.value = true;
}
async function handleCreateTask() {
 if (!taskForm.title) {
 ElMessage.error('请输入任务标题');
 return;
 }
 const result = await taskStore.createTask({
 ...taskForm,
 project_id: projectId.value,
 created_by: userStore.user.id
 });
 if (result.success) {
 ElMessage.success('任务创建成功');
 showCreateTaskModal.value = false;
 Object.assign(taskForm, {
 title: '',
 description: '',
 group_id: null,
 assignee_id: null,
 priority: 'medium',
 status: 'pending',
 start_date: '',
 due_date: '',
 estimated_hours: null,
 tags: ''
 });
 }
 else {
 ElMessage.error(result.message);
 }
}
async function handleEditTask() {
 if (!editTaskForm.title) {
 ElMessage.error('请输入任务标题');
 return;
 }
 const result = await taskStore.updateTask(editingTask.value.id, editTaskForm);
 if (result.success) {
 ElMessage.success('任务更新成功');
 showEditTaskModal.value = false;
 }
 else {
 ElMessage.error(result.message);
 }
}
async function copyTask(task) {
 const result = await taskStore.createTask({
 title: `${task.title} (复制)`,
 description: task.description,
 project_id: projectId.value,
 group_id: task.group_id,
 assignee_id: task.assignee_id,
 priority: task.priority,
 status: 'pending',
 start_date: task.start_date,
 due_date: task.due_date,
 estimated_hours: task.estimated_hours,
 tags: task.tags,
 created_by: userStore.user.id
 });
 if (result.success) {
 ElMessage.success('任务复制成功');
 }
}
async function deleteTask(task) {
 ElMessageBox.confirm('确定要删除这个任务吗？', '确认删除', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 }).then(async () => {
 const result = await taskStore.deleteTask(task.id);
 if (result.success) {
 ElMessage.success('任务已删除');
 }
 });
}
async function handleBatchCreate() {
 if (!batchForm.tasks.trim()) {
 ElMessage.error('请输入任务列表');
 return;
 }
 const taskTitles = batchForm.tasks.split('\n').filter(t => t.trim());
 for (const title of taskTitles) {
 await taskStore.createTask({
 title: title.trim(),
 project_id: projectId.value,
 group_id: batchForm.group_id,
 assignee_id: batchForm.assignee_id,
 priority: batchForm.priority,
 status: 'pending',
 created_by: userStore.user.id
 });
 }
 ElMessage.success(`成功创建 ${taskTitles.length} 个任务`);
 showBatchCreateModal.value = false;
 batchForm.tasks = '';
}
async function loadData() {
 await projectStore.fetchProject(projectId.value);
 await taskStore.fetchTasks(projectId.value);
 const [groupsResult, usersResult] = await Promise.all([
 axios.get(`/task-groups/project/${projectId.value}`),
 axios.get('/users')
 ]);
 if (groupsResult.data.success) {
 groups.value = groupsResult.data.data;
 }
 if (usersResult.data.success) {
 users.value = usersResult.data.data;
 }
}
onMounted(async () => {
 await loadData();
});
watch(() => route.params.id, async () => {
 await loadData();
});
</script>

<style scoped>
.project-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.project-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-title-section h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.status-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #059669;
}

.status-badge.archived {
  background: #f3f4f6;
  color: #6b7280;
}

.tabs {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-list-container {
  padding: 20px;
}

.list-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.list-header .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-item {
  width: 140px;
}

.task-table {
  border-radius: 8px;
}

.task-title-cell {
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

.status-tag.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.delete-btn {
  color: #ef4444 !important;
}

.overdue {
  color: #ef4444;
}

.stats-container {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

.progress-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
}

.progress-percent {
  font-weight: 600;
  color: #667eea;
}
</style>