<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <component :is="icons.Briefcase" class="logo-icon" />
        </div>
        <h1>团队任务管理系统</h1>
        <p>高效协作，轻松管理</p>
      </div>
      
      <el-form ref="loginForm" :model="form" label-width="80px" @submit.prevent="handleLogin">
        <el-form-item label="邮箱" prop="email" :rules="emailRules">
          <el-input v-model="form.email" placeholder="请输入邮箱">
            <template #prefix>
              <component :is="icons.Mail" />
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password" :rules="passwordRules">
          <el-input v-model="form.password" type="password" placeholder="请输入密码">
            <template #prefix>
              <component :is="icons.Lock" />
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
        
        <div class="login-links">
          <span>还没有账号？</span>
          <el-link @click="goToRegister">立即注册</el-link>
        </div>
      </el-form>
      
      <div class="demo-info">
        <p>演示账号：admin@example.com / 密码：123456</p>
        <p>用户账号：user1@example.com / 密码：123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import * as icons from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

const emailRules = [
  { required: true, message: '请输入邮箱', trigger: 'blur' },
  { type: 'email', message: '请输入有效的邮箱', trigger: 'blur' }
]

const passwordRules = [
  { required: true, message: '请输入密码', trigger: 'blur' },
  { min: 6, message: '密码长度至少6位', trigger: 'blur' }
]

async function handleLogin() {
  loading.value = true
  try {
    const result = await userStore.login(form.email, form.password)
    if (result.success) {
      router.push('/')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #fff;
}

.login-header h1 {
  font-size: 24px;
  color: #1f2937;
  margin: 0 0 8px;
}

.login-header p {
  color: #9ca3af;
  margin: 0;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.login-links {
  text-align: center;
  margin-top: 20px;
  color: #6b7280;
}

.login-links span {
  margin-right: 8px;
}

.login-links .el-link {
  color: #667eea;
}

.demo-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.demo-info p {
  margin: 5px 0;
  font-size: 12px;
  color: #9ca3af;
}
</style>