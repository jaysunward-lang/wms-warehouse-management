<template>
  <aside class="sidebar">
    <div class="logo">
      <el-icon :size="32" color="#409eff"><Box /></el-icon>
      <span class="logo-text">WMS仓库系统</span>
    </div>
    
    <nav class="menu">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        :class="{ active: $route.path === item.path }"
      >
        <el-icon :size="20">
          <component :is="item.icon" />
        </el-icon>
        <span class="menu-text">{{ item.title }}</span>
      </router-link>
    </nav>
    
    <div class="user-info">
      <div class="user-name">{{ authStore.user?.realName || '未登录' }}</div>
      <button class="silicone-btn logout-btn" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        <span>退出</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const menuItems = ref([
  { path: '/dashboard', title: '首页仪表板', icon: 'HomeFilled' },
  { path: '/inventory', title: '物料库存查询', icon: 'Box' },
  { path: '/excess', title: '多余库存查询', icon: 'Files' },
  { path: '/inbound', title: '入库管理', icon: 'Download' },
  { path: '/outbound', title: '出库管理', icon: 'Upload' },
  { path: '/shelf', title: '上下架记录', icon: 'Sort' }
]);

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    authStore.logout();
    ElMessage.success('已退出登录');
    router.push('/login');
  }).catch(() => {});
};
</script>

<style scoped lang="scss">
.sidebar {
  width: $sidebar-width;
  height: 100vh;
  background: linear-gradient(180deg, #1a1f2e 0%, #2d3748 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
}

.logo {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo-text {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 1px;
  }
}

.menu {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin-bottom: 8px;
  border-radius: 12px;
  color: $sidebar-text;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  box-shadow: 
    inset 2px 2px 4px rgba(255,255,255,0.05),
    inset -2px -2px 4px rgba(0,0,0,0.2),
    3px 3px 6px rgba(0,0,0,0.2);

  &:hover {
    background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
    color: #fff;
    transform: translateX(4px);
    box-shadow: 
      inset 2px 2px 4px rgba(255,255,255,0.1),
      inset -2px -2px 4px rgba(0,0,0,0.3),
      4px 4px 8px rgba(0,0,0,0.3);
  }

  &.active {
    background: linear-gradient(145deg, $primary-color, darken($primary-color, 10%));
    color: #fff;
    box-shadow: 
      inset 2px 2px 4px rgba(255,255,255,0.2),
      inset -2px -2px 4px rgba(0,0,0,0.3),
      4px 4px 8px rgba(0,0,0,0.3);
  }

  .menu-text {
    font-size: 15px;
    font-weight: 500;
  }
}

.user-info {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;

  .user-name {
    color: #fff;
    font-size: 14px;
    text-align: center;
    padding: 8px 0;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }
}

.logout-btn {
  width: 100%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  background: linear-gradient(145deg, #f56c6c, #d32f2f);
  color: #fff;
  box-shadow: 
    4px 4px 8px rgba(0,0,0,0.3),
    -2px -2px 4px rgba(255,255,255,0.1);

  &:hover {
    background: linear-gradient(145deg, #ff8585, #e53935);
    box-shadow: 
      2px 2px 6px rgba(0,0,0,0.3),
      -1px -1px 3px rgba(255,255,255,0.1);
  }

  &:active {
    box-shadow: 
      inset 2px 2px 4px rgba(0,0,0,0.3),
      inset -2px -2px 4px rgba(255,255,255,0.1);
  }
}
</style>
