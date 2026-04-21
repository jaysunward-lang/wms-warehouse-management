<template>
  <div class="page-container">
    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-dot" :class="{ connected: wsStore.isConnected }"></div>
      <span>{{ wsStore.connectionStatus }}</span>
      <span style="margin-left: auto; font-size: 12px; color: #666;">
        {{ authStore.user?.realName || '未登录' }}
      </span>
    </div>
    
    <!-- 统计卡片 -->
    <div class="content-wrapper">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">今日概况</span>
          <span class="stat-date">{{ currentDate }}</span>
        </div>
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.todayInbound }}</div>
            <div class="stat-label">今日入库</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.todayOutbound }}</div>
            <div class="stat-label">今日出库</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalStock }}</div>
            <div class="stat-label">库存总量</div>
          </div>
        </div>
      </div>
      
      <!-- 九宫格功能菜单 -->
      <div class="grid-container">
        <h3 class="grid-title">功能菜单</h3>
        <van-grid :column-num="3" :gutter="12">
          <van-grid-item
            v-for="item in menuItems"
            :key="item.path"
            @click="navigateTo(item.path)"
          >
            <div class="grid-item">
              <div class="grid-icon" :style="{ background: item.color }">
                <van-icon :name="item.icon" size="28" color="#fff" />
              </div>
              <span class="grid-text">{{ item.title }}</span>
            </div>
          </van-grid-item>
        </van-grid>
      </div>
      
      <!-- 最近活动 -->
      <div class="card">
        <h3 class="card-title">最近活动</h3>
        <van-cell-group>
          <van-cell
            v-for="activity in activities"
            :key="activity.id"
            :title="activity.materialName"
            :label="formatDate(activity.timestamp)"
          >
            <template #icon>
              <van-tag :type="activity.type === 'inbound' ? 'success' : 'danger'" style="margin-right: 8px;">
                {{ activity.type === 'inbound' ? '入库' : '出库' }}
              </van-tag>
            </template>
            <template #value>
              <span :style="{ color: activity.type === 'inbound' ? '#07c160' : '#ff4d4f' }">
                {{ activity.type === 'inbound' ? '+' : '-' }}{{ activity.quantity }}
              </span>
            </template>
          </van-cell>
        </van-cell-group>
        <van-empty v-if="activities.length === 0" description="暂无活动" />
      </div>
    </div>
    
    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/inventory">查询</van-tabbar-item>
      <van-tabbar-item icon="plus" to="/inbound">入库</van-tabbar-item>
      <van-tabbar-item icon="minus" to="/outbound">出库</van-tabbar-item>
      <van-tabbar-item icon="records" to="/records">记录</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { useAuthStore } from '../stores/auth';
import { useWebSocketStore } from '../stores/websocket';
import { getStats, getActivities } from '../api/dashboard';

const router = useRouter();
const authStore = useAuthStore();
const wsStore = useWebSocketStore();
const activeTab = ref(0);

const stats = ref({
  todayInbound: 0,
  todayOutbound: 0,
  totalStock: 0
});

const activities = ref<any[]>([]);

const currentDate = computed(() => {
  return dayjs().format('MM月DD日');
});

const menuItems = [
  { path: '/inventory', title: '库存查询', icon: 'search', color: '#1989fa' },
  { path: '/inbound', title: '快速入库', icon: 'plus', color: '#07c160' },
  { path: '/outbound', title: '快速出库', icon: 'minus', color: '#ff4d4f' },
  { path: '/records', title: '记录查询', icon: 'records', color: '#ff976a' },
  { path: '/inventory', title: '扫码盘点', icon: 'scan', color: '#7232dd' },
  { path: '/inventory', title: '库存预警', icon: 'warning-o', color: '#ff976a' }
];

const navigateTo = (path: string) => {
  router.push(path);
};

const formatDate = (date: string) => {
  return dayjs(date).format('MM-DD HH:mm');
};

const fetchData = async () => {
  try {
    const statsRes = await getStats();
    if (statsRes.code === 200) {
      stats.value.todayInbound = statsRes.data.todayInbound;
      stats.value.todayOutbound = statsRes.data.todayOutbound;
      stats.value.totalStock = statsRes.data.totalStock;
    }
    
    const activitiesRes = await getActivities(5);
    if (activitiesRes.code === 200) {
      activities.value = activitiesRes.data;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: #ff4d4f;
}

.status-dot.connected {
  background: #07c160;
}

.stat-card {
  background: linear-gradient(135deg, #1989fa 0%, #096dd9 100%);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
  margin-bottom: 12px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-title {
  font-size: 16px;
  font-weight: 500;
}

.stat-date {
  font-size: 13px;
  opacity: 0.9;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
}

.grid-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding: 0 4px;
}
</style>
