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
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/InventoryCheck.vue'),
    meta: { title: '库存查询' }
  },
  {
    path: '/inbound',
    name: 'Inbound',
    component: () => import('../views/QuickInbound.vue'),
    meta: { title: '快速入库' }
  },
  {
    path: '/outbound',
    name: 'Outbound',
    component: () => import('../views/QuickOutbound.vue'),
    meta: { title: '快速出库' }
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('../views/RecordQuery.vue'),
    meta: { title: '记录查询' }
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
