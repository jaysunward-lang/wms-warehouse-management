<template>
  <div class="page-container">
    <van-nav-bar
      title="快速入库"
      left-arrow
      @click-left="$router.back()"
      fixed
    />
    
    <div class="content-wrapper" style="padding-top: 46px;">
      <!-- 搜索物料 -->
      <div class="search-section">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索物料编码/名称"
          shape="round"
          @search="searchMaterials"
        />
        
        <van-list v-if="searchResults.length > 0" class="search-results">
          <van-cell
            v-for="item in searchResults"
            :key="item.materialId"
            :title="item.materialName"
            :label="`编码: ${item.materialCode} | 库存: ${item.totalQuantity}`"
            clickable
            @click="selectMaterial(item)"
          />
        </van-list>
      </div>
      
      <!-- 入库表单 -->
      <van-form @submit="handleSubmit" class="inbound-form">
        <van-cell-group inset>
          <van-cell v-if="selectedMaterial" title="选中物料" :value="selectedMaterial.materialName" />
          <van-field
            v-model="form.quantity"
            name="quantity"
            label="入库数量"
            type="number"
            placeholder="请输入入库数量"
            :rules="[{ required: true, message: '请输入入库数量' }]"
          />
          <van-field
            v-model="form.location"
            name="location"
            label="入库位置"
            placeholder="请输入入库位置"
            :rules="[{ required: true, message: '请输入入库位置' }]"
          />
          <van-field
            v-model="form.warehouseZone"
            name="warehouseZone"
            label="仓库区域"
            placeholder="请输入仓库区域"
          />
          <van-field
            v-model="form.shelfNo"
            name="shelfNo"
            label="货架编号"
            placeholder="请输入货架编号"
          />
          <van-field
            v-model="form.type"
            name="type"
            label="入库类型"
            is-link
            readonly
            placeholder="请选择入库类型"
            @click="showTypePicker = true"
          />
          <van-field
            v-model="form.remark"
            name="remark"
            label="备注"
            type="textarea"
            rows="2"
            placeholder="请输入备注"
          />
        </van-cell-group>
        
        <div class="form-actions">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            确认入库
          </van-button>
        </div>
      </van-form>
      
      <!-- 类型选择器 -->
      <van-popup v-model:show="showTypePicker" position="bottom">
        <van-picker
          :columns="typeColumns"
          @confirm="onTypeConfirm"
          @cancel="showTypePicker = false"
        />
      </van-popup>
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
import { ref } from 'vue';
import { showToast } from 'vant';
import { searchInventory } from '../api/inventory';
import { materialInbound } from '../api/inbound';

const activeTab = ref(2);
const searchKeyword = ref('');
const searchResults = ref<any[]>([]);
const selectedMaterial = ref<any>(null);
const submitting = ref(false);
const showTypePicker = ref(false);

const form = ref({
  quantity: '',
  location: '',
  warehouseZone: '',
  shelfNo: '',
  type: 'purchase',
  remark: ''
});

const typeColumns = [
  { text: '采购入库', value: 'purchase' },
  { text: '退货入库', value: 'return' },
  { text: '调拨入库', value: 'transfer' },
  { text: '其他入库', value: 'other' }
];

const searchMaterials = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = [];
    return;
  }
  try {
    const res = await searchInventory(searchKeyword.value);
    if (res.code === 200) {
      searchResults.value = res.data.list || [];
    }
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

const selectMaterial = (item: any) => {
  selectedMaterial.value = item;
  searchResults.value = [];
  searchKeyword.value = '';
};

const onTypeConfirm = ({ selectedOptions }: any) => {
  form.value.type = selectedOptions[0].value;
  showTypePicker.value = false;
};

const handleSubmit = async () => {
  if (!selectedMaterial.value) {
    showToast('请先选择物料');
    return;
  }
  
  submitting.value = true;
  try {
    const res = await materialInbound({
      materialId: selectedMaterial.value.materialId,
      quantity: parseFloat(form.value.quantity),
      location: form.value.location,
      warehouseZone: form.value.warehouseZone,
      shelfNo: form.value.shelfNo,
      type: form.value.type as any,
      remark: form.value.remark
    });
    
    if (res.code === 201) {
      showToast('入库成功');
      // 重置表单
      selectedMaterial.value = null;
      form.value = {
        quantity: '',
        location: '',
        warehouseZone: '',
        shelfNo: '',
        type: 'purchase',
        remark: ''
      };
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.search-section {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.inbound-form {
  margin-top: 20px;
}
</style>
