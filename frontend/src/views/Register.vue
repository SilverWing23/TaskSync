<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <div class="logo">
          <component :is="icons.Briefcase" class="logo-icon" />
        </div>
        <h1>创建账号</h1>
        <p>加入我们，开始高效协作</p>
      </div>
      
      <el-form ref="registerForm" :model="form" label-width="80px" @submit.prevent="handleRegister">
        <el-form-item label="用户名" prop="username" :rules="usernameRules">
          <el-input v-model="form.username" placeholder="请输入用户名">
            <template #prefix>
              <component :is="icons.User" />
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email" :rules="emailRules">
          <el-input v-model="form.email" placeholder="请输入邮箱">
            <template #prefix>
              <component :is="icons.Mail" />
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称（可选）">
            <template #prefix>
              <component :is="icons.UserCircle" />
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
        
        <el-form-item label="确认密码" prop="confirmPassword" :rules="confirmPasswordRules">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码">
            <template #prefix>
              <component :is="icons.Lock" />
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" class="register-btn" @click="handleRegister" :loading="loading">
            注册
          </el-button>
        </el-form-item>
        
        <div class="register-links">
          <span>已有账号？</span>
          <el-link @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import * as icons from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const usernameRules = [
  { required: true, message: '请输入用户名', trigger: 'blur' },
  { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' }
]

const emailRules = [
  { required: true, message: '请输入邮箱', trigger: 'blur' },
  { type: 'email', message: '请输入有效的邮箱', trigger: 'blur' }
]

const passwordRules = [
  { required: true, message: '请输入密码', trigger: 'blur' },
  { min: 6, message: '密码长度至少6位', trigger: 'blur' }
]

const confirmPasswordRules = [
  { required: true, message: '请确认密码', trigger: 'blur' },
  { validator: (rule, value, callback) => {
    if (value !== form.password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }, trigger: 'blur' }
]

async function handleRegister() {
  loading.value = true
  try {
    const result = await userStore.register(form.username, form.email, form.password, form.nickname)
    if (result.success) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('注册失败')
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-container {
  width: 450px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.register-header {
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

.register-header h1 {
  font-size: 24px;
  color: #1f2937;
  margin: 0 0 8px;
}

.register-header p {
  color: #9ca3af;
  margin: 0;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.register-links {
  text-align: center;
  margin-top: 20px;
  color: #6b7280;
}

.register-links span {
  margin-right: 8px;
}

.register-links .el-link {
  color: #667eea;
}
</style>