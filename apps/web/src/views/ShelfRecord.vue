<template>
  <div class="page-container">
    <div class="page-header">
      <h2>上下架记录</h2>
    </div>
    
    <div class="search-bar card">
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      />
      <el-select v-model="searchForm.action" placeholder="操作类型" clearable style="width: 150px">
        <el-option label="上架" value="up" />
        <el-option label="下架" value="down" />
        <el-option label="库位转移" value="transfer" />
        <el-option label="盘点调整" value="adjust" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>搜索
      </el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <div class="table-card card">
      <el-table v-loading="loading" :data="tableData" style="width: 100%" border>
        <el-table-column prop="recordNo" label="记录单号" width="150" />
        <el-table-column prop="materialCode" label="物料编码" width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="200" />
        <el-table-column prop="action" label="操作" width="100">
          <template #default="{ row }">
            <el-tag :type="actionColor(row.action)">
              {{ actionText(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="fromLocation" label="原位置" width="150">
          <template #default="{ row }">
            {{ row.fromLocation || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="toLocation" label="目标位置" width="150">
          <template #default="{ row }">
            {{ row.toLocation || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作员" width="100" />
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import dayjs from 'dayjs';
import { getShelfRecordList } from '../api/shelf';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  dateRange: [] as string[],
  action: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

const actionText = (action: string) => {
  const map: Record<string, string> = {
    up: '上架',
    down: '下架',
    transfer: '库位转移',
    adjust: '盘点调整'
  };
  return map[action] || action;
};

const actionColor = (action: string) => {
  const map: Record<string, string> = {
    up: 'success',
    down: 'danger',
    transfer: 'warning',
    adjust: 'primary'
  };
  return map[action] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (searchForm.action) {
      params.action = searchForm.action;
    }
    if (searchForm.dateRange?.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    const res = await getShelfRecordList(params) as any;
    if (res.code === 200) {
      tableData.value = res.data.list;
      pagination.total = res.data.pagination.total;
    }
  } catch (error) {
    console.error('获取上下架记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetSearch = () => {
  searchForm.dateRange = [];
  searchForm.action = '';
  handleSearch();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchData();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.search-bar {
  display: flex;
  gap: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.table-card {
  padding: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
