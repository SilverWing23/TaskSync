<template>
  <div class="kanban-page">
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <component :is="icons.ArrowLeft" />
          <span>返回</span>
        </el-button>
        <h1>{{ project?.name }} - 看板视图</h1>
      </div>
      <el-button type="primary" @click="showAddColumnModal = true">
        <component :is="icons.Plus" />
        <span>添加列</span>
      </el-button>
    </div>
    
    <div class="kanban-container">
      <div class="kanban-board">
        <div 
          v-for="column in columns" 
          :key="column.id" 
          class="kanban-column"
        >
          <div class="column-header">
            <div class="column-title">
              <span>{{ column.name }}</span>
              <span class="task-count">{{ getColumnTasks(column).length }}</span>
            </div>
            <div class="column-actions">
              <el-button type="text" @click="editColumn(column)" class="action-btn">
                <component :is="icons.Pencil" />
              </el-button>
              <el-button type="text" @click="deleteColumn(column)" class="action-btn">
                <component :is="icons.Trash2" />
              </el-button>
            </div>
          </div>
          
          <div 
            class="column-content"
            @dragover.prevent
            @drop="handleDrop($event, column)"
          >
            <div
              v-for="task in getColumnTasks(column)"
              :key="task.id"
              class="kanban-task"
              draggable="true"
              @dragstart="handleDragStart($event, task)"
              @click="showTaskDetail(task)"
            >
              <div class="task-priority" :class="task.priority"></div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <span v-if="task.assignee_name" class="task-assignee">{{ task.assignee_name }}</span>
                  <span v-if="task.due_date" :class="['task-due', { overdue: isOverdue(task.due_date) }]">
                    {{ formatDate(task.due_date) }}
                  </span>
                </div>
              </div>
              <div class="task-actions">
                <el-button type="text" @click.stop="quickEditTask(task)">
                  <component :is="icons.MoreHorizontal" />
                </el-button>
              </div>
            </div>
            
            <div class="add-task-btn" @click="addTaskToColumn(column)">
              <component :is="icons.Plus" />
              <span>添加任务</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog title="添加列" v-model="showAddColumnModal" width="400px">
      <el-form :model="columnForm" label-width="80px">
        <el-form-item label="列名称" :rules="[{ required: true, message: '请输入列名称' }]">
          <el-input v-model="columnForm.name" placeholder="请输入列名称" />
        </el-form-item>
        <el-form-item label="状态映射">
          <el-select v-model="columnForm.status_mapping" placeholder="选择状态">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已逾期" value="overdue" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddColumnModal = false">取消</el-button>
        <el-button type="primary" @click="handleAddColumn">添加</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="编辑列" v-model="showEditColumnModal" width="400px">
      <el-form :model="editColumnForm" label-width="80px">
        <el-form-item label="列名称" :rules="[{ required: true, message: '请输入列名称' }]">
          <el-input v-model="editColumnForm.name" placeholder="请输入列名称" />
        </el-form-item>
        <el-form-item label="状态映射">
          <el-select v-model="editColumnForm.status_mapping" placeholder="选择状态">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已逾期" value="overdue" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditColumnModal = false">取消</el-button>
        <el-button type="primary" @click="handleEditColumn">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="添加任务" v-model="showAddTaskModal" width="500px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务标题" :rules="[{ required: true, message: '请输入任务标题' }]">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="taskForm.description" type="textarea" placeholder="请输入任务描述" :rows="3" />
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
        <el-form-item label="截止日期">
          <el-date-picker v-model="taskForm.due_date" type="date" placeholder="选择截止日期" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddTaskModal = false">取消</el-button>
        <el-button type="primary" @click="handleAddTask">添加</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="任务详情" v-model="showTaskDetailModal" width="600px">
      <div v-if="selectedTask" class="task-detail-content">
        <div class="detail-header">
          <h3>{{ selectedTask.title }}</h3>
          <span :class="['status-tag', selectedTask.status]">{{ getStatusText(selectedTask.status) }}</span>
        </div>
        
        <div class="detail-body">
          <div class="detail-row">
            <span class="detail-label">描述</span>
            <span class="detail-value">{{ selectedTask.description || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">负责人</span>
            <span class="detail-value">{{ selectedTask.assignee_name || '未指派' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">优先级</span>
            <span :class="['priority-badge', selectedTask.priority]">{{ getPriorityText(selectedTask.priority) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">截止日期</span>
            <span :class="{ overdue: isOverdue(selectedTask.due_date) }">{{ formatDate(selectedTask.due_date) || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">工时预估</span>
            <span class="detail-value">{{ selectedTask.estimated_hours || '-' }} 小时</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">实际工时</span>
            <span class="detail-value">{{ selectedTask.actual_hours || '-' }} 小时</span>
          </div>
        </div>
        
        <div class="comments-section">
          <h4>评论</h4>
          <div class="comments-list">
            <div v-for="comment in taskComments" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <component :is="icons.User" />
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.nickname }}</span>
                  <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                </div>
                <p>{{ comment.content }}</p>
              </div>
            </div>
          </div>
          <div class="add-comment">
            <el-input 
              v-model="newComment" 
              placeholder="添加评论..." 
              @keyup.enter="addComment"
            />
            <el-button type="primary" @click="addComment">发送</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { useKanbanStore } from '../stores/kanban';
import { useTaskStore } from '../stores/task';
import { useUserStore } from '../stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../utils/axios';
import * as icons from 'lucide-vue-next';
const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const kanbanStore = useKanbanStore();
const taskStore = useTaskStore();
const userStore = useUserStore();
const projectId = computed(() => parseInt(route.params.id));
const project = computed(() => projectStore.currentProject);
const columns = computed(() => kanbanStore.columns);
const users = ref([]);
const showAddColumnModal = ref(false);
const showEditColumnModal = ref(false);
const showAddTaskModal = ref(false);
const showTaskDetailModal = ref(false);
const editingColumn = ref(null);
const selectedTask = ref(null);
const taskComments = ref([]);
const newComment = ref('');
const draggedTask = ref(null);
const currentColumn = ref(null);
const columnForm = reactive({
 name: '',
 status_mapping: 'pending'
});
const editColumnForm = reactive({
 name: '',
 status_mapping: 'pending'
});
const taskForm = reactive({
 title: '',
 description: '',
 assignee_id: null,
 priority: 'medium',
 due_date: ''
});
function getColumnTasks(column) {
 return column.tasks || [];
}
function formatDate(dateStr) {
 if (!dateStr)
 return '-';
 const date = new Date(dateStr);
 return `${date.getMonth() + 1}/${date.getDate()}`;
}
function formatTime(timeStr) {
 if (!timeStr)
 return '';
 const date = new Date(timeStr);
 return date.toLocaleString('zh-CN');
}
function isOverdue(dateStr) {
 if (!dateStr)
 return false;
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const dueDate = new Date(dateStr);
 return dueDate < today;
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
function getPriorityText(priority) {
 const map = { high: '高优先级', medium: '中优先级', low: '低优先级' };
 return map[priority] || priority;
}
function goBack() {
 router.push(`/projects/${projectId.value}`);
}
function handleDragStart(event, task) {
 draggedTask.value = task;
 event.dataTransfer.effectAllowed = 'move';
}
function handleDrop(event, column) {
 if (draggedTask.value) {
 const oldStatus = draggedTask.value.status;
 const newStatus = column.status_mapping;
 if (oldStatus !== newStatus) {
 taskStore.updateTask(draggedTask.value.id, { status: newStatus });
 kanbanStore.fetchColumns(projectId.value);
 ElMessage.success('任务状态已更新');
 }
 draggedTask.value = null;
 }
}
function editColumn(column) {
 editingColumn.value = column;
 editColumnForm.name = column.name;
 editColumnForm.status_mapping = column.status_mapping;
 showEditColumnModal.value = true;
}
async function deleteColumn(column) {
 ElMessageBox.confirm('确定要删除这个列吗？', '确认删除', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 }).then(async () => {
 await kanbanStore.deleteColumn(column.id, projectId.value);
 });
}
function addTaskToColumn(column) {
 currentColumn.value = column;
 taskForm.status = column.status_mapping;
 showAddTaskModal.value = true;
}
async function handleAddColumn() {
 if (!columnForm.name) {
 ElMessage.error('请输入列名称');
 return;
 }
 await kanbanStore.createColumn(projectId.value, columnForm.name, columnForm.status_mapping);
 showAddColumnModal.value = false;
 columnForm.name = '';
 columnForm.status_mapping = 'pending';
}
async function handleEditColumn() {
 if (!editColumnForm.name) {
 ElMessage.error('请输入列名称');
 return;
 }
 await kanbanStore.updateColumn(editingColumn.value.id, editColumnForm);
 showEditColumnModal.value = false;
}
async function handleAddTask() {
 if (!taskForm.title) {
 ElMessage.error('请输入任务标题');
 return;
 }
 await taskStore.createTask({
 ...taskForm,
 project_id: projectId.value,
 status: currentColumn.value.status_mapping,
 created_by: userStore.user.id
 });
 await kanbanStore.fetchColumns(projectId.value);
 showAddTaskModal.value = false;
 taskForm.title = '';
 taskForm.description = '';
 taskForm.assignee_id = null;
 taskForm.priority = 'medium';
 taskForm.due_date = '';
}
function showTaskDetail(task) {
 selectedTask.value = task;
 taskStore.fetchComments(task.id).then(result => {
 if (result.success) {
 taskComments.value = result.data;
 }
 });
 showTaskDetailModal.value = true;
}
function quickEditTask(task) {
 showTaskDetail(task);
}
async function addComment() {
 if (!newComment.value.trim())
 return;
 await taskStore.addComment(selectedTask.value.id, newComment.value);
 taskComments.value = await taskStore.fetchComments(selectedTask.value.id).then(r => r.data);
 newComment.value = '';
}
async function loadData() {
 await projectStore.fetchProject(projectId.value);
 await kanbanStore.fetchColumns(projectId.value);
 const usersResult = await axios.get('/users');
 if (usersResult.data.success) {
 users.value = usersResult.data.data;
 }
}
onMounted(async () => {
 await loadData();
});
</script>

<style scoped>
.kanban-page {
  padding: 20px;
  height: calc(100vh - 160px);
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

.kanban-container {
  height: calc(100% - 80px);
  overflow-x: auto;
}

.kanban-board {
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
}

.kanban-column {
  min-width: 320px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.task-count {
  background: #e5e7eb;
  color: #6b7280;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.column-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px;
  color: #9ca3af;
}

.action-btn:hover {
  color: #6b7280;
}

.column-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.kanban-task {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kanban-task:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kanban-task:active {
  opacity: 0.8;
}

.task-priority {
  width: 4px;
  border-radius: 2px;
}

.task-priority.high {
  background: #ef4444;
}

.task-priority.medium {
  background: #f59e0b;
}

.task-priority.low {
  background: #10b981;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.task-assignee {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-due {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-due.overdue {
  color: #ef4444;
}

.task-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.kanban-task:hover .task-actions {
  opacity: 1;
}

.add-task-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.add-task-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
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

.detail-body {
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  color: #1f2937;
  font-weight: 500;
}

.priority-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.priority-badge.high {
  background: #fee2e2;
  color: #dc2626;
}

.priority-badge.medium {
  background: #dbeafe;
  color: #2563eb;
}

.priority-badge.low {
  background: #d1fae5;
  color: #059669;
}

.comments-section {
  border-top: 1px solid #f3f4f6;
  padding-top: 20px;
}

.comments-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px;
}

.comments-list {
  margin-bottom: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-avatar svg {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 500;
  color: #1f2937;
}

.comment-time {
  font-size: 12px;
  color: #9ca3af;
}

.add-comment {
  display: flex;
  gap: 12px;
}

.add-comment .el-input {
  flex: 1;
}
</style>