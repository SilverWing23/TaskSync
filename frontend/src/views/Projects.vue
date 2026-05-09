<template>
  <div class="projects-page">
    <div class="page-header">
      <div class="header-left">
        <h1>项目管理</h1>
        <p>管理您的所有项目</p>
      </div>
      <el-button type="primary" @click="openCreateModal" class="create-btn">
        <component :is="icons.Plus" />
        <span>创建项目</span>
      </el-button>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="筛选状态" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="进行中" value="active" />
        <el-option label="已归档" value="archived" />
      </el-select>
      <el-select v-model="filterPriority" placeholder="筛选优先级" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="高优先级" value="high" />
        <el-option label="中优先级" value="medium" />
        <el-option label="低优先级" value="low" />
      </el-select>
    </div>
    
    <div class="project-list">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card" @click="goToProject(project.id)">
        <div class="project-header">
          <div class="project-name">{{ project.name }}</div>
          <span :class="['priority-tag', project.priority]">{{ getPriorityText(project.priority) }}</span>
        </div>
        
        <p class="project-desc">{{ project.description }}</p>
        
        <div class="project-meta">
          <div class="meta-item">
            <component :is="icons.Calendar" />
            <span>{{ formatDate(project.start_date) }} - {{ formatDate(project.end_date) }}</span>
          </div>
          <div class="meta-item">
            <component :is="icons.User" />
            <span>{{ project.owner_name }}</span>
          </div>
          <div v-if="project.team_name" class="meta-item">
            <component :is="icons.Users" />
            <span>{{ project.team_name }}</span>
          </div>
        </div>
        
        <div class="project-footer">
          <div class="status-badge" :class="project.status">{{ getStatusText(project.status) }}</div>
          <div class="actions">
            <el-button type="text" @click.stop="editProject(project)">编辑</el-button>
            <el-button type="text" @click.stop="archiveProject(project)" v-if="project.status === 'active'">归档</el-button>
            <el-button type="text" @click.stop="deleteProject(project)" class="delete-btn">删除</el-button>
          </div>
        </div>
      </div>
      
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <component :is="icons.FolderKanban" class="empty-icon" />
        <p>暂无项目</p>
        <el-button type="primary" @click="showCreateModal = true">创建第一个项目</el-button>
      </div>
    </div>
    
    <el-dialog title="创建项目" v-model="showCreateModal" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="项目名称" :rules="[{ required: true, message: '请输入项目名称' }]">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目简介">
          <el-textarea v-model="form.description" placeholder="请输入项目简介" rows="3" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="form.start_date" type="date" placeholder="选择开始日期" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="form.end_date" type="date" placeholder="选择截止日期" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="form.priority" placeholder="选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属团队">
          <el-select v-model="form.team_id" placeholder="选择团队（可选）">
            <el-option label="无" :value="null" />
            <el-option v-for="team in teams" :key="team.id" :label="team.name" :value="team.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目标签">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateModal = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="编辑项目" v-model="showEditModal" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="项目名称" :rules="[{ required: true, message: '请输入项目名称' }]">
          <el-input v-model="editForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目简介">
          <el-textarea v-model="editForm.description" placeholder="请输入项目简介" rows="3" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="editForm.start_date" type="date" placeholder="选择开始日期" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="editForm.end_date" type="date" placeholder="选择截止日期" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editForm.priority" placeholder="选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属团队">
          <el-select v-model="editForm.team_id" placeholder="选择团队（可选）">
            <el-option label="无" :value="null" />
            <el-option v-for="team in teams" :key="team.id" :label="team.name" :value="team.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目标签">
          <el-input v-model="editForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';
import { useTeamStore } from '../stores/team';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as icons from 'lucide-vue-next';
const router = useRouter();
const projectStore = useProjectStore();
const teamStore = useTeamStore();
const showCreateModal = ref(false);
const showEditModal = ref(false);
const filterStatus = ref('');
const filterPriority = ref('');
const editingProject = ref(null);
const teams = ref([]);
const form = reactive({
 name: '',
 description: '',
 start_date: '',
 end_date: '',
 priority: 'medium',
 team_id: null,
 tags: ''
});
const editForm = reactive({
 name: '',
 description: '',
 start_date: '',
 end_date: '',
 priority: 'medium',
 team_id: null,
 tags: ''
});
const filteredProjects = computed(() => {
 return projectStore.projects.filter(p => {
 if (filterStatus.value && p.status !== filterStatus.value)
 return false;
 if (filterPriority.value && p.priority !== filterPriority.value)
 return false;
 return true;
 });
});
function getPriorityText(priority) {
 const map = { high: '高优先级', medium: '中优先级', low: '低优先级' };
 return map[priority] || priority;
}
function getStatusText(status) {
 const map = { active: '进行中', archived: '已归档', deleted: '已删除' };
 return map[status] || status;
}
function formatDate(dateStr) {
 if (!dateStr)
 return '-';
 const date = new Date(dateStr);
 return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}
function goToProject(id) {
 router.push(`/projects/${id}`);
}
function openCreateModal() {
 console.log('Opening create modal, current value:', showCreateModal.value);
 showCreateModal.value = true;
 console.log('After setting, value:', showCreateModal.value);
}
function editProject(project) {
 editingProject.value = project;
 Object.assign(editForm, {
 name: project.name,
 description: project.description || '',
 start_date: project.start_date,
 end_date: project.end_date,
 priority: project.priority,
 team_id: project.team_id || null,
 tags: project.tags || ''
 });
 showEditModal.value = true;
}
async function handleCreate() {
 if (!form.name) {
 ElMessage.error('请输入项目名称');
 return;
 }
 try {
 const result = await projectStore.createProject(form);
 console.log('Create project result:', result);
 if (result.success) {
 ElMessage.success('项目创建成功');
 showCreateModal.value = false;
 Object.assign(form, {
 name: '',
 description: '',
 start_date: '',
 end_date: '',
 priority: 'medium',
 team_id: null,
 tags: ''
 });
 }
 else {
 ElMessage.error(result.message);
 }
 } catch (error) {
 console.error('Create project error:', error);
 ElMessage.error('创建项目失败: ' + (error.message || '未知错误'));
 }
}
async function handleEdit() {
 if (!editForm.name) {
 ElMessage.error('请输入项目名称');
 return;
 }
 const result = await projectStore.updateProject(editingProject.value.id, editForm);
 if (result.success) {
 ElMessage.success('项目更新成功');
 showEditModal.value = false;
 }
 else {
 ElMessage.error(result.message);
 }
}
async function archiveProject(project) {
 ElMessageBox.confirm('确定要归档这个项目吗？', '确认归档', {
 confirmButtonText: '确定',
 cancelButtonText: '取消'
 }).then(async () => {
 const result = await projectStore.updateProject(project.id, { status: 'archived' });
 if (result.success) {
 ElMessage.success('项目已归档');
 }
 });
}
async function deleteProject(project) {
 ElMessageBox.confirm('确定要删除这个项目吗？此操作不可恢复。', '确认删除', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 }).then(async () => {
 const result = await projectStore.deleteProject(project.id);
 if (result.success) {
 ElMessage.success('项目已删除');
 }
 });
}
onMounted(async () => {
 await projectStore.fetchProjects();
 await teamStore.fetchTeams();
 teams.value = teamStore.teams;
});
</script>

<style scoped>
.projects-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.header-left p {
  color: #6b7280;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.filter-select {
  width: 160px;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.project-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.priority-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.priority-tag.high {
  background: #fee2e2;
  color: #dc2626;
}

.priority-tag.medium {
  background: #dbeafe;
  color: #2563eb;
}

.priority-tag.low {
  background: #d1fae5;
  color: #059669;
}

.project-desc {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
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

.actions {
  display: flex;
  gap: 16px;
}

.actions .el-button {
  padding: 0;
  font-size: 13px;
  color: #667eea;
}

.delete-btn {
  color: #ef4444 !important;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0 0 20px;
}
</style>