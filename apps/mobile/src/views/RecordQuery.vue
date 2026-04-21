<template>
  <div class="page-container">
    <van-nav-bar
      title="记录查询"
      left-arrow
      @click-left="$router.back()"
      fixed
    />
    
    <div class="content-wrapper" style="padding-top: 46px;">
      <!-- 类型切换 -->
      <van-tabs v-model:active="recordType" @change="onTabChange">
        <van-tab title="入库记录" name="inbound" />
        <van-tab title="出库记录" name="outbound" />
        <van-tab title="上下架记录" name="shelf" />
      </van-tabs>
      
      <!-- 筛选条件 -->
      <div class="filter-bar">
        <van-field
          v-model="dateRange"
          label="日期范围"
          placeholder="选择日期范围"
          readonly
          @click="showDatePicker = true"
        />
      </div>
      
      <!-- 记录列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <!-- 入库记录 -->
          <template v-if="recordType === 'inbound'">
            <van-cell-group v-for="item in list" :key="item.inboundId" inset class="record-group">
              <van-cell :title="item.materialName" :label="item.recordNo">
                <template #value>
                  <div class="record-value">
                    <van-tag type="success">+{{ item.quantity }}</van-tag>
                    <span class="record-time">{{ formatDate(item.createdAt) }}</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="操作员" :value="item.operatorName" />
              <van-cell title="入库位置" :value="item.location" />
            </van-cell-group>
          </template>
          
          <!-- 出库记录 -->
          <template v-if="recordType === 'outbound'">
            <van-cell-group v-for="item in list" :key="item.outboundId" inset class="record-group">
              <van-cell :title="item.materialName" :label="item.recordNo">
                <template #value>
                  <div class="record-value">
                    <van-tag type="danger">-{{ item.quantity }}</van-tag>
                    <span class="record-time">{{ formatDate(item.createdAt) }}</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="操作员" :value="item.operatorName" />
              <van-cell title="出库位置" :value="item.location" />
            </van-cell-group>
          </template>
          
          <!-- 上下架记录 -->
          <template v-if="recordType === 'shelf'">
            <van-cell-group v-for="item in list" :key="item.recordId" inset class="record-group">
              <van-cell :title="item.materialName" :label="item.recordNo">
                <template #value>
                  <div class="record-value">
                    <van-tag :type="getActionType(item.action)">
                      {{ getActionText(item.action) }}
                    </van-tag>
                    <span class="record-time">{{ formatDate(item.createdAt) }}</span>
                  </div>
                </template>
              </van-cell>
              <van-cell title="数量" :value="item.quantity" />
              <van-cell title="操作员" :value="item.operatorName" />
            </van-cell-group>
          </template>
        </van-list>
      </van-pull-refresh>
      
      <van-empty v-if="list.length === 0 && !loading" description="暂无记录" />
    </div>
    
    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/inventory">查询</van-tabbar-item>
      <van-tabbar-item icon="plus" to="/inbound">入库</van-tabbar-item>
      <van-tabbar-item icon="minus" to="/outbound">出库</van-tabbar-item>
      <van-tabbar-item icon="records" to="/records">记录</van-tabbar-item>
    </van-tabbar>
    
    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-picker
        :columns="dateColumns"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { getInboundList } from '../api/inbound';
import { getOutboundList } from '../api/outbound';
import { getShelfRecordList } from '../api/shelf';

const activeTab = ref(4);
const recordType = ref('inbound');
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const list = ref<any[]>([]);
const page = ref(1);
const pageSize = 10;

const dateRange = ref('最近7天');
const showDatePicker = ref(false);
const dateColumns = ['今天', '昨天', '最近7天', '最近30天', '本月'];

const getActionText = (action: string) => {
  const map: Record<string, string> = {
    up: '上架',
    down: '下架',
    transfer: '移库',
    adjust: '调整'
  };
  return map[action] || action;
};

const getActionType = (action: string) => {
  const map: Record<string, string> = {
    up: 'success',
    down: 'danger',
    transfer: 'warning',
    adjust: 'primary'
  };
  return map[action] || 'default';
};

const formatDate = (date: string) => {
  return dayjs(date).format('MM-DD HH:mm');
};

const getDateRange = () => {
  const end = dayjs().format('YYYY-MM-DD');
  let start = end;
  
  switch (dateRange.value) {
    case '今天':
      start = end;
      break;
    case '昨天':
      start = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      break;
    case '最近7天':
      start = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      break;
    case '最近30天':
      start = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
      break;
    case '本月':
      start = dayjs().startOf('month').format('YYYY-MM-DD');
      break;
  }
  
  return { start, end };
};

const fetchList = async () => {
  try {
    const { start, end } = getDateRange();
    let res;
    
    switch (recordType.value) {
      case 'inbound':
        res = await getInboundList({
          startDate: start,
          endDate: end,
          page: page.value,
          pageSize
        });
        break;
      case 'outbound':
        res = await getOutboundList({
          startDate: start,
          endDate: end,
          page: page.value,
          pageSize
        });
        break;
      case 'shelf':
        res = await getShelfRecordList({
          startDate: start,
          endDate: end,
          page: page.value,
          pageSize
        });
        break;
    }
    
    if (res!.code === 200) {
      if (page.value === 1) {
        list.value = res!.data.list;
      } else {
        list.value.push(...res!.data.list);
      }
      finished.value = list.value.length >= res!.data.pagination.total;
    }
  } catch (error) {
    console.error('获取记录失败:', error);
  }
};

const onLoad = async () => {
  loading.value = true;
  await fetchList();
  loading.value = false;
  page.value++;
};

const onRefresh = async () => {
  refreshing.value = true;
  page.value = 1;
  finished.value = false;
  await fetchList();
  refreshing.value = false;
};

const onTabChange = () => {
  page.value = 1;
  finished.value = false;
  list.value = [];
  onLoad();
};

const onDateConfirm = ({ selectedOptions }: any) => {
  dateRange.value = selectedOptions[0].text;
  showDatePicker.value = false;
  onRefresh();
};

onMounted(() => {
  onLoad();
});
</script>

<style scoped>
.filter-bar {
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.record-group {
  margin-bottom: 12px;
}

.record-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-time {
  font-size: 12px;
  color: #999;
}
</style>
