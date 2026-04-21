<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <el-icon :size="64" color="#409eff"><Box /></el-icon>
          <h1>WMS仓库管理系统</h1>
          <p>智能化仓储管理解决方案</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>实时库存同步</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>多端协同操作</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>智能数据分析</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2>{{ isRegister ? '用户注册' : '用户登录' }}</h2>
          
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="login-form"
            @keyup.enter="handleSubmit"
          >
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <template v-if="isRegister">
              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              
              <el-form-item prop="realName">
                <el-input
                  v-model="form.realName"
                  placeholder="请输入真实姓名（操作员名字）"
                  size="large"
                  :prefix-icon="UserFilled"
                />
              </el-form-item>
              
              <el-form-item prop="phone">
                <el-input
                  v-model="form.phone"
                  placeholder="请输入手机号（选填）"
                  size="large"
                  :prefix-icon="Phone"
                />
              </el-form-item>
            </template>
            
            <el-form-item>
              <button
                type="button"
                class="silicone-btn primary submit-btn"
                :disabled="loading"
                @click="handleSubmit"
              >
                <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
                <span>{{ isRegister ? '注册' : '登录' }}</span>
              </button>
            </el-form-item>
          </el-form>
          
          <div class="form-footer">
            <span>{{ isRegister ? '已有账号？' : '还没有账号？' }}</span>
            <a href="javascript:void(0)" @click="toggleMode">
              {{ isRegister ? '立即登录' : '立即注册' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { User, Lock, UserFilled, Phone, Loading } from '@element-plus/icons-vue';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const isRegister = ref(false);
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: ''
});

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (isRegister.value && value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ]
};

const toggleMode = () => {
  isRegister.value = !isRegister.value;
  formRef.value?.resetFields();
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      
      if (isRegister.value) {
        const result = await authStore.registerAction({
          username: form.username,
          password: form.password,
          realName: form.realName,
          phone: form.phone
        });
        
        if (result.success) {
          ElMessage.success('注册成功，请登录');
          isRegister.value = false;
          form.password = '';
          form.confirmPassword = '';
        } else {
          ElMessage.error(result.message);
        }
      } else {
        const result = await authStore.loginAction(form.username, form.password);
        
        if (result.success) {
          ElMessage.success('登录成功');
          router.push('/');
        } else {
          ElMessage.error(result.message);
        }
      }
      
      loading.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  display: flex;
  width: 900px;
  height: 600px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-left {
  flex: 1;
  background: linear-gradient(145deg, #1a1f2e 0%, #2d3748 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  color: #fff;

  .brand {
    text-align: center;
    margin-bottom: 60px;

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 20px 0 10px;
    }

    p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: linear-gradient(145deg, #f5f5f5, #ffffff);
}

.login-form-wrapper {
  width: 100%;
  max-width: 320px;

  h2 {
    text-align: center;
    margin-bottom: 32px;
    color: $text-primary;
    font-size: 24px;
  }
}

.login-form {
  .el-input {
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: inset 3px 3px 6px #d1d1d1, inset -3px -3px 6px #ffffff;
      background: #f0f0f0;
      border: none;
      padding: 4px 15px;

      &.is-focus {
        box-shadow: inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff;
      }
    }
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  color: $text-secondary;
  font-size: 14px;

  a {
    color: $primary-color;
    text-decoration: none;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
