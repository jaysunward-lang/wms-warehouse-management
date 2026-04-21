<template>
  <div class="page-container">
    <div class="page-header">
      <h2>首页仪表板</h2>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card silicone-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
          <el-icon :size="32" color="#fff"><Box /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">物料总数</div>
          <div class="stat-value">{{ stats.materialCount }}</div>
        </div>
      </div>
      
      <div class="stat-card silicone-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #11998e, #38ef7d);">
          <el-icon :size="32" color="#fff"><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">库存总量</div>
          <div class="stat-value">{{ formatNumber(stats.totalStock) }}</div>
        </div>
      </div>
      
      <div class="stat-card silicone-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fc4a1a, #f7b733);">
          <el-icon :size="32" color="#fff"><Files /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">多余库存</div>
          <div class="stat-value">{{ formatNumber(stats.totalExcess) }}</div>
        </div>
      </div>
      
      <div class="stat-card silicone-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #ee0979, #ff6a00);">
          <el-icon :size="32" color="#fff"><Download /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">今日入库</div>
          <div class="stat-value">{{ formatNumber(stats.todayInbound) }}</div>
        </div>
      </div>
      
      <div class="stat-card silicone-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
          <el-icon :size="32" color="#fff"><Upload /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">今日出库</div>
          <div class="stat-value">{{ formatNumber(stats.todayOutbound) }}</div>
        </div>
      </div>
      
      <div class="stat-card silicone-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a, #fee140);">
          <el-icon :size="32" color="#fff"><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">库存预警</div>
          <div class="stat-value" :class="{ 'text-danger': stats.lowStockCount > 0 }">
            {{ stats.lowStockCount }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="chart-card card">
        <div class="chart-header">
          <h3>出入库趋势</h3>
        </div>
        <div ref="trendChartRef" class="chart-content"></div>
      </div>
      
      <div class="chart-card card">
        <div class="chart-header">
          <h3>物料类别分布</h3>
        </div>
        <div ref="categoryChartRef" class="chart-content"></div>
      </div>
    </div>
    
    <!-- 最近活动 -->
    <div class="activity-card card">
      <div class="activity-header">
        <h3>最近活动</h3>
      </div>
      <el-table :data="activities" style="width: 100%">
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'inbound' ? 'success' : 'danger'">
              {{ row.type === 'inbound' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recordNo" label="单号" width="150" />
        <el-table-column prop="materialName" label="物料名称" />
        <el-table-column prop="quantity" label="数量" width="120" />
        <el-table-column prop="operatorName" label="操作员" width="120" />
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.timestamp) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { getStats, getCharts, getActivities } from '../api/dashboard';
import { useWebSocketStore } from '../stores/websocket';

const wsStore = useWebSocketStore();
const stats = ref({
  materialCount: 0,
  totalStock: 0,
  totalExcess: 0,
  todayInbound: 0,
  todayOutbound: 0,
  yesterdayInbound: 0,
  yesterdayOutbound: 0,
  lowStockCount: 0
});

const activities = ref<any[]>([]);
const trendChartRef = ref<HTMLDivElement>();
const categoryChartRef = ref<HTMLDivElement>();
let trendChart: echarts.ECharts | null = null;
let categoryChart: echarts.ECharts | null = null;

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN');
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const initTrendChart = (data: any[]) => {
  if (!trendChartRef.value) return;
  
  trendChart = echarts.init(trendChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['入库', '出库']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入库',
        type: 'line',
        smooth: true,
        data: data.map(item => item.inbound),
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      },
      {
        name: '出库',
        type: 'line',
        smooth: true,
        data: data.map(item => item.outbound),
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      }
    ]
  };
  trendChart.setOption(option);
};

const initCategoryChart = (data: any[]) => {
  if (!categoryChartRef.value) return;
  
  categoryChart = echarts.init(categoryChartRef.value);
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        name: '物料类别',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: data.map(item => ({ name: item.name, value: item.value }))
      }
    ]
  };
  categoryChart.setOption(option);
};

const fetchData = async () => {
  try {
    const statsRes = await getStats();
    if (statsRes.code === 200) {
      stats.value = statsRes.data;
    }
    
    const chartsRes = await getCharts();
    if (chartsRes.code === 200) {
      await nextTick();
      initTrendChart(chartsRes.data.trend);
      initCategoryChart(chartsRes.data.category);
    }
    
    const activitiesRes = await getActivities(10);
    if (activitiesRes.code === 200) {
      activities.value = activitiesRes.data;
    }
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
  }
};

// 监听WebSocket消息
const handleWebSocketMessage = () => {
  if (wsStore.lastMessage) {
    fetchData();
  }
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', () => {
    trendChart?.resize();
    categoryChart?.resize();
  });
});

onUnmounted(() => {
  trendChart?.dispose();
  categoryChart?.dispose();
});
</script>

<style scoped lang="scss">
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 16px;

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .stat-info {
    flex: 1;

    .stat-label {
      font-size: 14px;
      color: $text-secondary;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: $text-primary;

      &.text-danger {
        color: $danger-color;
      }
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  padding: 24px;

  .chart-header {
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }
  }

  .chart-content {
    height: 300px;
  }
}

.activity-card {
  padding: 24px;

  .activity-header {
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }
  }
}
</style>
