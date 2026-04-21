<template>
  <div class="page-container">
    <div class="page-header">
      <h2>多余库存查询</h2>
    </div>
    
    <div class="search-bar card">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索物料编码/名称"
        clearable
        style="width: 300px"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>搜索
      </el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <div class="table-card card">
      <el-table v-loading="loading" :data="tableData" style="width: 100%" border>
        <el-table-column prop="materialCode" label="物料编码" width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="200" />
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="location" label="存放位置" width="150" />
        <el-table-column prop="reason" label="产生原因" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'stored' ? 'success' : row.status === 'pending' ? 'warning' : 'info'">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
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
import { getExcessStockList } from '../api/inventory';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  keyword: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

const statusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    stored: '已入库',
    cleared: '已清理'
  };
  return map[status] || status;
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getExcessStockList({
      keyword: searchForm.keyword,
      page: pagination.page,
      pageSize: pagination.pageSize
    });
    if (res.code === 200) {
      tableData.value = res.data.list;
      pagination.total = res.data.pagination.total;
    }
  } catch (error) {
    console.error('获取多余库存失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetSearch = () => {
  searchForm.keyword = '';
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
