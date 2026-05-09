<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>个人资料</h1>
    </div>
    
    <div class="profile-container">
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-container">
            <img v-if="user?.avatar" :src="user.avatar" class="avatar" />
            <div v-else class="avatar-placeholder">
              <component :is="icons.User" />
            </div>
          </div>
          <el-button type="text" @click="uploadAvatar">
            <component :is="icons.Camera" />
            <span>更换头像</span>
          </el-button>
          <input type="file" ref="avatarInput" class="avatar-input" accept="image/*" @change="handleAvatarUpload" />
        </div>
        
        <div class="form-section">
          <el-form :model="form" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="form.username" disabled />
            </el-form-item>
            
            <el-form-item label="邮箱">
              <el-input v-model="form.email" disabled />
            </el-form-item>
            
            <el-form-item label="昵称">
              <el-input v-model="form.nickname" />
            </el-form-item>
            
            <el-form-item label="角色">
              <el-select :model-value="form.role" disabled>
                <el-option label="超级管理员" value="super_admin" />
                <el-option label="项目管理员" value="project_admin" />
                <el-option label="普通成员" value="member" />
                <el-option label="只读成员" value="readonly" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="updateProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <div class="password-card">
        <h3>修改密码</h3>
        <el-form :model="passwordForm" label-width="100px">
          <el-form-item label="原密码" :rules="[{ required: true, message: '请输入原密码' }]">
            <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
          </el-form-item>
          
          <el-form-item label="新密码" :rules="[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码长度至少6位' }]">
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
          </el-form-item>
          
          <el-form-item label="确认密码" :rules="[{ required: true, message: '请确认新密码' }]">
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="changePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';
import axios from '../utils/axios';
import * as icons from 'lucide-vue-next';
const userStore = useUserStore();
const user = computed(() => userStore.user);
const avatarInput = ref(null);
const form = reactive({
 username: '',
 email: '',
 nickname: '',
 role: ''
});
const passwordForm = reactive({
 oldPassword: '',
 newPassword: '',
 confirmPassword: ''
});
function uploadAvatar() {
 avatarInput.value?.click();
}
async function handleAvatarUpload(event) {
 const file = event.target.files[0];
 if (!file)
 return;
 const formData = new FormData();
 formData.append('avatar', file);
 try {
 const response = await axios.put('/auth/profile', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 if (response.data.success) {
 ElMessage.success('头像上传成功');
 await userStore.getProfile();
 }
 }
 catch (error) {
 ElMessage.error('上传失败');
 }
}
async function updateProfile() {
 const result = await userStore.updateProfile({ nickname: form.nickname });
 if (result.success) {
 ElMessage.success('修改成功');
 }
 else {
 ElMessage.error(result.message);
 }
}
async function changePassword() {
 if (passwordForm.newPassword !== passwordForm.confirmPassword) {
 ElMessage.error('两次输入的密码不一致');
 return;
 }
 const result = await axios.put('/auth/password', {
 oldPassword: passwordForm.oldPassword,
 newPassword: passwordForm.newPassword
 });
 if (result.data.success) {
 ElMessage.success('密码修改成功');
 passwordForm.oldPassword = '';
 passwordForm.newPassword = '';
 passwordForm.confirmPassword = '';
 }
 else {
 ElMessage.error(result.data.message);
 }
}
onMounted(() => {
 if (user.value) {
 form.username = user.value.username;
 form.email = user.value.email;
 form.nickname = user.value.nickname || '';
 form.role = user.value.role;
 }
});
</script>

<style scoped>
.profile-page {
  padding: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px;
}

.profile-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.profile-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-container {
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  position: relative;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder svg {
  width: 48px;
  height: 48px;
  color: #9ca3af;
}

.avatar-section .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  color: #667eea;
}

.avatar-input {
  display: none;
}

.form-section {
  border-top: 1px solid #f3f4f6;
  padding-top: 24px;
}

.password-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.password-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px;
}
</style>