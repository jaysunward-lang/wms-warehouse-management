<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <h2>物料库存查询</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>新增物料
      </el-button>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-bar card">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索物料编码/名称/条码"
        clearable
        style="width: 300px"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="searchForm.category" placeholder="物料类别" clearable style="width: 150px">
        <el-option label="原材料" value="原材料" />
        <el-option label="半成品" value="半成品" />
        <el-option label="成品" value="成品" />
        <el-option label="备件" value="备件" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>搜索
      </el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <!-- 数据表格 -->
    <div class="table-card card">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
      >
        <el-table-column prop="materialCode" label="物料编码" width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="200" />
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="spec" label="规格" width="150" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="totalQuantity" label="总库存" width="100">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.totalQuantity === 0 }">
              {{ row.totalQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="locations" label="存放位置" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="loc in row.locations" :key="loc" size="small" class="mr-1">
              {{ loc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleInbound(row)">
              入库
            </el-button>
            <el-button type="danger" size="small" @click="handleOutbound(row)">
              出库
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
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
    
    <!-- 新增物料对话框 -->
    <el-dialog v-model="showCreateDialog" title="新增物料" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="物料编码" prop="materialCode">
          <el-input v-model="createForm.materialCode" placeholder="请输入物料编码" />
        </el-form-item>
        <el-form-item label="物料名称" prop="materialName">
          <el-input v-model="createForm.materialName" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="物料类别" prop="category">
          <el-select v-model="createForm.category" placeholder="请选择类别" style="width: 100%">
            <el-option label="原材料" value="原材料" />
            <el-option label="半成品" value="半成品" />
            <el-option label="成品" value="成品" />
            <el-option label="备件" value="备件" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格型号" prop="spec">
          <el-input v-model="createForm.spec" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="计量单位" prop="unit">
          <el-input v-model="createForm.unit" placeholder="默认：件" />
        </el-form-item>
        <el-form-item label="条形码" prop="barcode">
          <el-input v-model="createForm.barcode" placeholder="请输入条形码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">
          确定
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 入库对话框 -->
    <el-dialog v-model="showInboundDialog" title="物料入库" width="500px">
      <el-form ref="inboundFormRef" :model="inboundForm" :rules="inboundRules" label-width="100px">
        <el-form-item label="物料名称">
          <el-input :value="selectedMaterial?.materialName || ''" disabled />
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="inboundForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入库位置" prop="location">
          <el-input v-model="inboundForm.location" placeholder="请输入入库位置" />
        </el-form-item>
        <el-form-item label="仓库区域" prop="warehouseZone">
          <el-input v-model="inboundForm.warehouseZone" placeholder="请输入仓库区域" />
        </el-form-item>
        <el-form-item label="货架编号" prop="shelfNo">
          <el-input v-model="inboundForm.shelfNo" placeholder="请输入货架编号" />
        </el-form-item>
        <el-form-item label="入库类型" prop="type">
          <el-select v-model="inboundForm.type" style="width: 100%">
            <el-option label="采购入库" value="purchase" />
            <el-option label="退货入库" value="return" />
            <el-option label="调拨入库" value="transfer" />
            <el-option label="其他入库" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="inboundForm.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInboundDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleInboundSubmit">
          确定入库
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 出库对话框 -->
    <el-dialog v-model="showOutboundDialog" title="物料出库" width="500px">
      <el-form ref="outboundFormRef" :model="outboundForm" :rules="outboundRules" label-width="100px">
        <el-form-item label="物料名称">
          <el-input :value="selectedMaterial?.materialName || ''" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="selectedMaterial?.totalQuantity || 0" disabled />
        </el-form-item>
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number v-model="outboundForm.quantity" :min="1" :max="selectedMaterial?.totalQuantity" style="width: 100%" />
        </el-form-item>
        <el-form-item label="出库位置" prop="location">
          <el-select v-model="outboundForm.location" style="width: 100%">
            <el-option
              v-for="loc in selectedMaterial?.locations"
              :key="loc"
              :label="loc"
              :value="loc"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出库类型" prop="type">
          <el-select v-model="outboundForm.type" style="width: 100%">
            <el-option label="领用出库" value="use" />
            <el-option label="销售出库" value="sale" />
            <el-option label="调拨出库" value="transfer" />
            <el-option label="报废出库" value="scrap" />
            <el-option label="其他出库" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="出库原因" prop="reason">
          <el-input v-model="outboundForm.reason" type="textarea" rows="2" placeholder="请输入出库原因" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="outboundForm.remark" type="textarea" rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showOutboundDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleOutboundSubmit">
          确定出库
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { getMaterialStockList, createMaterial } from '../api/inventory';
import { materialInbound } from '../api/inbound';
import { materialOutbound } from '../api/outbound';

const loading = ref(false);
const submitting = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
  keyword: '',
  category: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 新增物料
const showCreateDialog = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive({
  materialCode: '',
  materialName: '',
  category: '',
  spec: '',
  unit: '件',
  barcode: ''
});

const createRules: FormRules = {
  materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
  materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择物料类别', trigger: 'change' }]
};

// 入库
const showInboundDialog = ref(false);
const inboundFormRef = ref<FormInstance>();
const selectedMaterial = ref<any>(null);
const inboundForm = reactive({
  quantity: 1,
  location: '',
  warehouseZone: '',
  shelfNo: '',
  type: 'purchase',
  remark: ''
});

const inboundRules: FormRules = {
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  location: [{ required: true, message: '请输入入库位置', trigger: 'blur' }]
};

// 出库
const showOutboundDialog = ref(false);
const outboundFormRef = ref<FormInstance>();
const outboundForm = reactive({
  quantity: 1,
  location: '',
  type: 'use',
  reason: '',
  remark: ''
});

const outboundRules: FormRules = {
  quantity: [{ required: true, message: '请输入出库数量', trigger: 'blur' }],
  location: [{ required: true, message: '请选择出库位置', trigger: 'change' }],
  reason: [{ required: true, message: '请输入出库原因', trigger: 'blur' }]
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getMaterialStockList({
      keyword: searchForm.keyword,
      category: searchForm.category,
      page: pagination.page,
      pageSize: pagination.pageSize
    });
    if (res.code === 200) {
      tableData.value = res.data.list;
      pagination.total = res.data.pagination.total;
    }
  } catch (error) {
    console.error('获取物料库存失败:', error);
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
  searchForm.category = '';
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

const handleCreate = async () => {
  if (!createFormRef.value) return;
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const res = await createMaterial(createForm);
        if (res.code === 201) {
          ElMessage.success('创建成功');
          showCreateDialog.value = false;
          createFormRef.value?.resetFields();
          fetchData();
        }
      } finally {
        submitting.value = false;
      }
    }
  });
};

const handleInbound = (row: any) => {
  selectedMaterial.value = row;
  showInboundDialog.value = true;
};

const handleInboundSubmit = async () => {
  if (!inboundFormRef.value) return;
  await inboundFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const res = await materialInbound({
          materialId: selectedMaterial.value.materialId,
          ...inboundForm
        });
        if (res.code === 201) {
          ElMessage.success('入库成功');
          showInboundDialog.value = false;
          inboundFormRef.value?.resetFields();
          fetchData();
        }
      } finally {
        submitting.value = false;
      }
    }
  });
};

const handleOutbound = (row: any) => {
  selectedMaterial.value = row;
  outboundForm.location = row.locations[0] || '';
  showOutboundDialog.value = true;
};

const handleOutboundSubmit = async () => {
  if (!outboundFormRef.value) return;
  await outboundFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const res = await materialOutbound({
          materialId: selectedMaterial.value.materialId,
          ...outboundForm
        });
        if (res.code === 201) {
          ElMessage.success('出库成功');
          showOutboundDialog.value = false;
          outboundFormRef.value?.resetFields();
          fetchData();
        }
      } finally {
        submitting.value = false;
      }
    }
  });
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

.text-danger {
  color: $danger-color;
}
</style>
