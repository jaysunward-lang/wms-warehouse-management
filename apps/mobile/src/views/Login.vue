<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">
        <van-icon name="warehouse" size="64" color="#1989fa" />
      </div>
      <h1>WMS仓库管理</h1>
      <p>移动端仓库管理系统</p>
    </div>
    
    <div class="login-form">
      <van-tabs v-model:active="activeTab" class="login-tabs">
        <van-tab title="登录">
          <van-form @submit="handleLogin">
            <van-cell-group inset>
              <van-field
                v-model="loginForm.username"
                name="username"
                label="用户名"
                placeholder="请输入用户名"
                :rules="[{ required: true, message: '请输入用户名' }]"
              />
              <van-field
                v-model="loginForm.password"
                type="password"
                name="password"
                label="密码"
                placeholder="请输入密码"
                :rules="[{ required: true, message: '请输入密码' }]"
              />
            </van-cell-group>
            <div class="form-actions">
              <van-button 
                round 
                block 
                type="primary" 
                native-type="submit"
                :loading="loading"
              >
                登录
              </van-button>
            </div>
          </van-form>
        </van-tab>
        
        <van-tab title="注册">
          <van-form @submit="handleRegister">
            <van-cell-group inset>
              <van-field
                v-model="registerForm.username"
                name="username"
                label="用户名"
                placeholder="请输入用户名"
                :rules="[{ required: true, message: '请输入用户名' }]"
              />
              <van-field
                v-model="registerForm.password"
                type="password"
                name="password"
                label="密码"
                placeholder="请输入密码"
                :rules="[{ required: true, message: '请输入密码' }]"
              />
              <van-field
                v-model="registerForm.realName"
                name="realName"
                label="真实姓名"
                placeholder="请输入真实姓名（操作员名字）"
                :rules="[{ required: true, message: '请输入真实姓名' }]"
              />
              <van-field
                v-model="registerForm.phone"
                name="phone"
                label="手机号"
                placeholder="请输入手机号（选填）"
              />
            </van-cell-group>
            <div class="form-actions">
              <van-button 
                round 
                block 
                type="primary" 
                native-type="submit"
                :loading="loading"
              >
                注册
              </van-button>
            </div>
          </van-form>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref(0);
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const registerForm = reactive({
  username: '',
  password: '',
  realName: '',
  phone: ''
});

const handleLogin = async () => {
  loading.value = true;
  const result = await authStore.loginAction(loginForm.username, loginForm.password);
  loading.value = false;
  
  if (result.success) {
    showToast('登录成功');
    router.push('/');
  } else {
    showToast(result.message);
  }
};

const handleRegister = async () => {
  loading.value = true;
  const result = await authStore.registerAction({
    username: registerForm.username,
    password: registerForm.password,
    realName: registerForm.realName,
    phone: registerForm.phone
  });
  loading.value = false;
  
  if (result.success) {
    showToast('注册成功，请登录');
    activeTab.value = 0;
  } else {
    showToast(result.message);
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.login-header {
  padding: 60px 20px 40px;
  text-align: center;
  color: #fff;
}

.login-header h1 {
  font-size: 28px;
  margin: 20px 0 8px;
  font-weight: 600;
}

.login-header p {
  font-size: 14px;
  opacity: 0.9;
}

.login-form {
  flex: 1;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 20px;
}

.login-tabs {
  margin-top: 10px;
}

.form-actions {
  margin: 30px 16px;
}

:deep(.van-tabs__nav) {
  background: transparent;
}

:deep(.van-tab__text) {
  font-size: 16px;
  font-weight: 500;
}
</style>
