<template>
  <header class="header">
    <div class="header-left">
      <h2 class="page-title">{{ pageTitle }}</h2>
    </div>
    <div class="header-right">
      <div class="connection-status" :class="{ connected: wsStore.isConnected }">
        <el-icon :size="14"><CircleCheck v-if="wsStore.isConnected" /><CircleClose v-else /></el-icon>
        <span>{{ wsStore.connectionStatus }}</span>
      </div>
      <div class="datetime">
        <span class="time">{{ currentTime }}</span>
        <span class="date">{{ currentDate }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import { useWebSocketStore } from '../../stores/websocket';

const route = useRoute();
const wsStore = useWebSocketStore();

const currentTime = ref('');
const currentDate = ref('');
let timer: number | null = null;

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '首页仪表板',
    '/inventory': '物料库存查询',
    '/excess': '多余库存查询',
    '/inbound': '入库管理',
    '/outbound': '出库管理',
    '/shelf': '上下架记录'
  };
  return titles[route.path] || 'WMS仓库管理系统';
});

const updateTime = () => {
  currentTime.value = dayjs().format('HH:mm:ss');
  currentDate.value = dayjs().format('YYYY年MM月DD日');
};

onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped lang="scss">
.header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.header-left {
  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f5f5f5;
  color: $text-secondary;
  font-size: 13px;
  transition: all 0.3s ease;

  &.connected {
    background: #e8f5e9;
    color: $success-color;
  }
}

.datetime {
  display: flex;
  align-items: center;
  gap: 12px;
  color: $text-regular;

  .time {
    font-size: 18px;
    font-weight: 600;
    font-family: 'Roboto Mono', monospace;
  }

  .date {
    font-size: 13px;
    color: $text-secondary;
  }
}
</style>
