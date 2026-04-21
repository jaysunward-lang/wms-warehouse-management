<template>
  <div class="page-container">
    <van-nav-bar
      title="库存查询"
      left-arrow
      @click-left="$router.back()"
      fixed
    />
    
    <div class="content-wrapper" style="padding-top: 46px;">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索物料编码/名称"
          shape="round"
          @search="handleSearch"
        />
      </div>
      
      <!-- 库存列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-card
            v-for="item in list"
            :key="item.materialId"
            :title="item.materialName"
            :desc="`编码: ${item.materialCode}`"
            class="inventory-card"
          >
            <template #tags>
              <van-tag type="primary" style="margin-right: 8px;">{{ item.category }}</van-tag>
              <van-tag type="success">库存: {{ item.totalQuantity }}</van-tag>
            </template>
            <template #footer>
              <div class="card-footer">
                <span class="location-text">位置: {{ item.locations?.join(', ') || '未分配' }}</span>
                <div class="card-actions">
                  <van-button size="small" type="primary" @click="handleInbound(item)">入库</van-button>
                  <van-button size="small" type="danger" @click="handleOutbound(item)">出库</van-button>
                </div>
              </div>
            </template>
          </van-card>
        </van-list>
      </van-pull-refresh>
      
      <van-empty v-if="list.length === 0 && !loading" description="暂无库存数据" />
    </div>
    
    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/inventory">查询</van-tabbar-item>
      <van-tabbar-item icon="plus" to="/inbound">入库</van-tabbar-item>
      <van-tabbar-item icon="minus" to="/outbound">出库</van-tabbar-item>
      <van-tabbar-item icon="records" to="/records">记录</van-tabbar-item>
    </van-tabbar>
    
    <!-- 入库弹窗 -->
    <van-popup v-model:show="showInbound" position="bottom" round :style="{ height: '60%' }">
      <van-nav-bar title="快速入库" @click-left="showInbound = false">
        <template #left>
          <van-icon name="cross" size="20" />
        </template>
      </van-nav-bar>
      <div style="padding: 20px;">
        <van-form @submit="submitInbound">
          <van-cell-group inset>
            <van-cell title="物料" :value="selectedMaterial?.materialName" />
            <van-field
              v-model="inboundForm.quantity"
              name="quantity"
              label="数量"
              type="number"
              placeholder="请输入入库数量"
              :rules="[{ required: true, message: '请输入数量' }]"
            />
            <van-field
              v-model="inboundForm.location"
              name="location"
              label="位置"
              placeholder="请输入入库位置"
              :rules="[{ required: true, message: '请输入位置' }]"
            />
          </van-cell-group>
          <div style="margin: 20px;">
            <van-button round block type="primary" native-type="submit" :loading="submitting">
              确认入库
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
    
    <!-- 出库弹窗 -->
    <van-popup v-model:show="showOutbound" position="bottom" round :style="{ height: '60%' }">
      <van-nav-bar title="快速出库" @click-left="showOutbound = false">
        <template #left>
          <van-icon name="cross" size="20" />
        </template>
      </van-nav-bar>
      <div style="padding: 20px;">
        <van-form @submit="submitOutbound">
          <van-cell-group inset>
            <van-cell title="物料" :value="selectedMaterial?.materialName" />
            <van-cell title="当前库存" :value="selectedMaterial?.totalQuantity" />
            <van-field
              v-model="outboundForm.quantity"
              name="quantity"
              label="数量"
              type="number"
              placeholder="请输入出库数量"
              :rules="[{ required: true, message: '请输入数量' }]"
            />
            <van-field
              v-model="outboundForm.location"
              name="location"
              label="位置"
              placeholder="请输入出库位置"
              :rules="[{ required: true, message: '请输入位置' }]"
            />
            <van-field
              v-model="outboundForm.reason"
              name="reason"
              label="原因"
              placeholder="请输入出库原因"
            />
          </van-cell-group>
          <div style="margin: 20px;">
            <van-button round block type="danger" native-type="submit" :loading="submitting">
              确认出库
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getMaterialStockList } from '../api/inventory';
import { materialInbound } from '../api/inbound';
import { materialOutbound } from '../api/outbound';

const activeTab = ref(1);
const searchKeyword = ref('');
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const list = ref<any[]>([]);
const page = ref(1);
const pageSize = 10;

const showInbound = ref(false);
const showOutbound = ref(false);
const selectedMaterial = ref<any>(null);
const submitting = ref(false);

const inboundForm = ref({
  quantity: '',
  location: ''
});

const outboundForm = ref({
  quantity: '',
  location: '',
  reason: ''
});

const fetchList = async () => {
  try {
    const res = await getMaterialStockList({
      keyword: searchKeyword.value,
      page: page.value,
      pageSize
    });
    if (res.code === 200) {
      if (page.value === 1) {
        list.value = res.data.list;
      } else {
        list.value.push(...res.data.list);
      }
      finished.value = list.value.length >= res.data.pagination.total;
    }
  } catch (error) {
    console.error('获取库存失败:', error);
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

const handleSearch = () => {
  page.value = 1;
  finished.value = false;
  list.value = [];
  onLoad();
};

const handleInbound = (item: any) => {
  selectedMaterial.value = item;
  inboundForm.value = { quantity: '', location: '' };
  showInbound.value = true;
};

const handleOutbound = (item: any) => {
  selectedMaterial.value = item;
  outboundForm.value = { quantity: '', location: '', reason: '' };
  showOutbound.value = true;
};

const submitInbound = async () => {
  if (!selectedMaterial.value) return;
  submitting.value = true;
  try {
    const res = await materialInbound({
      materialId: selectedMaterial.value.materialId,
      quantity: parseFloat(inboundForm.value.quantity),
      location: inboundForm.value.location
    });
    if (res.code === 201) {
      showToast('入库成功');
      showInbound.value = false;
      onRefresh();
    }
  } finally {
    submitting.value = false;
  }
};

const submitOutbound = async () => {
  if (!selectedMaterial.value) return;
  submitting.value = true;
  try {
    const res = await materialOutbound({
      materialId: selectedMaterial.value.materialId,
      quantity: parseFloat(outboundForm.value.quantity),
      location: outboundForm.value.location,
      reason: outboundForm.value.reason
    });
    if (res.code === 201) {
      showToast('出库成功');
      showOutbound.value = false;
      onRefresh();
    }
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  onLoad();
});
</script>

<style scoped>
.inventory-card {
  margin: 8px 12px;
  border-radius: 12px;
}

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-text {
  font-size: 12px;
  color: #999;
}

.card-actions {
  display: flex;
  gap: 8px;
}
</style>
