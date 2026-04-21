import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login, getProfile, register } from '../api/auth';
import { useWebSocketStore } from './websocket';
import { showToast } from 'vant';

export interface User {
  userId: number;
  username: string;
  realName: string;
  phone?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string>(localStorage.getItem('token') || '');
  const loading = ref(false);
  const wsStore = useWebSocketStore();

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const clearToken = () => {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    wsStore.disconnect();
  };

  const loginAction = async (username: string, password: string) => {
    loading.value = true;
    try {
      const res = await login({ username, password });
      if (res.code === 200) {
        setToken(res.data.token);
        user.value = res.data.user;
        wsStore.connect();
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '登录失败' };
    } finally {
      loading.value = false;
    }
  };

  const registerAction = async (data: {
    username: string;
    password: string;
    realName: string;
    phone?: string;
  }) => {
    loading.value = true;
    try {
      const res = await register(data);
      if (res.code === 201) {
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '注册失败' };
    } finally {
      loading.value = false;
    }
  };

  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const res = await getProfile();
      if (res.code === 200) {
        user.value = res.data;
      }
    } catch (error) {
      clearToken();
    }
  };

  const logout = () => {
    clearToken();
    showToast('已退出登录');
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    setToken,
    clearToken,
    loginAction,
    registerAction,
    fetchProfile,
    logout
  };
});
