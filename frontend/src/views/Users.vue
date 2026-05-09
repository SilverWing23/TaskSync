<template>
  <div class="users-page">
    <div class="page-header">
      <h1>用户管理</h1>
    </div>
    
    <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索用户..." @keyup.enter="searchUsers">
        <template #prefix>
          <component :is="icons.Search" />
        </template>
      </el-input>
    </div>
    
    <el-table :data="users" border class="user-table">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="role" label="角色">
        <template #default="scope">
          <span :class="['role-tag', scope.row.role]">{{ getRoleText(scope.row.role) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="editRole(scope.row)">编辑角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="编辑角色" v-model="showEditModal" width="400px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="用户">
          <el-input :model-value="editingUser?.nickname" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="roleForm.role" placeholder="选择角色">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="项目管理员" value="project_admin" />
            <el-option label="普通成员" value="member" />
            <el-option label="只读成员" value="readonly" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleEditRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from '../utils/axios';
import * as icons from 'lucide-vue-next';
const users = ref([]);
const searchKeyword = ref('');
const showEditModal = ref(false);
const editingUser = ref(null);
const roleForm = reactive({
 role: ''
});
function getRoleText(role) {
 const map = {
 super_admin: '超级管理员',
 project_admin: '项目管理员',
 member: '普通成员',
 readonly: '只读成员'
 };
 return map[role] || role;
}
function formatDate(dateStr) {
 if (!dateStr)
 return '-';
 const date = new Date(dateStr);
 return date.toLocaleString('zh-CN');
}
function editRole(user) {
 editingUser.value = user;
 roleForm.role = user.role;
 showEditModal.value = true;
}
async function handleEditRole() {
 if (!roleForm.role) {
 ElMessage.error('请选择角色');
 return;
 }
 const result = await axios.put(`/users/${editingUser.value.id}/role`, { role: roleForm.role });
 if (result.data.success) {
 ElMessage.success('角色修改成功');
 const index = users.value.findIndex(u => u.id === editingUser.value.id);
 if (index !== -1) {
 users.value[index].role = roleForm.role;
 }
 showEditModal.value = false;
 }
 else {
 ElMessage.error(result.data.message);
 }
}
async function searchUsers() {
 if (!searchKeyword.value.trim()) {
 await loadUsers();
 return;
 }
 const result = await axios.get(`/users/search?keyword=${searchKeyword.value}`);
 if (result.data.success) {
 users.value = result.data.data;
 }
}
async function loadUsers() {
 const result = await axios.get('/users');
 if (result.data.success) {
 users.value = result.data.data;
 }
}
onMounted(async () => {
 await loadUsers();
});
</script>

<style scoped>
.users-page {
  padding: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 400px;
}

.user-table {
  border-radius: 12px;
}

.role-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.role-tag.super_admin {
  background: #fee2e2;
  color: #dc2626;
}

.role-tag.project_admin {
  background: #dbeafe;
  color: #2563eb;
}

.role-tag.member {
  background: #d1fae5;
  color: #059669;
}

.role-tag.readonly {
  background: #f3f4f6;
  color: #6b7280;
}
</style>