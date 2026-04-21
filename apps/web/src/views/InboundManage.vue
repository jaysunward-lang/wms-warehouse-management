<template>
  <div class="page-container">
    <div class="page-header">
      <h2>入库管理</h2>
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
      <el-select v-model="searchForm.type" placeholder="入库类型" clearable style="width: 150px">
        <el-option label="采购入库" value="purchase" />
        <el-option label="退货入库" value="return" />
        <el-option label="调拨入库" value="transfer" />
        <el-option label="多余库存入库" value="excess" />
        <el-option label="其他入库" value="other" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>搜索
      </el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <div class="table-card card">
      <el-table v-loading="loading" :data="tableData" style="width: 100%" border>
        <el-table-column prop="recordNo" label="入库单号" width="150" />
        <el-table-column prop="materialCode" label="物料编码" width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="typeColor(row.type)">
              {{ typeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="location" label="入库位置" width="150" />
        <el-table-column prop="operatorName" label="操作员" width="100" />
        <el-table-column prop="createdAt" label="入库时间" width="180">
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
import { getInboundList } from '../api/inbound';

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  dateRange: [] as string[],
  type: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

const typeText = (type: string) => {
  const map: Record<string, string> = {
    purchase: '采购入库',
    return: '退货入库',
    transfer: '调拨入库',
    excess: '多余库存入库',
    other: '其他入库'
  };
  return map[type] || type;
};

const typeColor = (type: string) => {
  const map: Record<string, string> = {
    purchase: 'primary',
    return: 'success',
    transfer: 'warning',
    excess: 'danger',
    other: 'info'
  };
  return map[type] || 'info';
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
    if (searchForm.type) {
      params.type = searchForm.type;
    }
    if (searchForm.dateRange?.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }
    const res = await getInboundList(params);
    if (res.code === 200) {
      tableData.value = res.data.list;
      pagination.total = res.data.pagination.total;
    }
  } catch (error) {
    console.error('获取入库记录失败:', error);
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
  searchForm.type = '';
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
