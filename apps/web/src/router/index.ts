import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../components/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页仪表板', icon: 'HomeFilled' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('../views/InventoryQuery.vue'),
        meta: { title: '物料库存查询', icon: 'Box' }
      },
      {
        path: 'excess',
        name: 'Excess',
        component: () => import('../views/ExcessInventory.vue'),
        meta: { title: '多余库存查询', icon: 'Files' }
      },
      {
        path: 'inbound',
        name: 'Inbound',
        component: () => import('../views/InboundManage.vue'),
        meta: { title: '入库管理', icon: 'Download' }
      },
      {
        path: 'outbound',
        name: 'Outbound',
        component: () => import('../views/OutboundManage.vue'),
        meta: { title: '出库管理', icon: 'Upload' }
      },
      {
        path: 'shelf',
        name: 'Shelf',
        component: () => import('../views/ShelfRecord.vue'),
        meta: { title: '上下架记录', icon: 'Sort' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
