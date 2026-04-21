import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { io, Socket } from 'socket.io-client';

export const useWebSocketStore = defineStore('websocket', () => {
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const lastMessage = ref<any>(null);

  const connectionStatus = computed(() => {
    return isConnected.value ? '已连接' : '未连接';
  });

  const connect = () => {
    if (socket.value?.connected) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    socket.value = io('http://localhost:3000', {
      transports: ['websocket'],
      auth: { token }
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
      console.log('WebSocket已连接');
      socket.value?.emit('inventory:subscribe', {});
      socket.value?.emit('dashboard:subscribe');
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
      console.log('WebSocket已断开');
    });

    socket.value.on('inventory:updated', (data) => {
      lastMessage.value = { type: 'inventory', data };
      console.log('收到库存更新:', data);
    });

    socket.value.on('shelf:changed', (data) => {
      lastMessage.value = { type: 'shelf', data };
      console.log('收到上下架变更:', data);
    });

    socket.value.on('transaction:new', (data) => {
      lastMessage.value = { type: 'transaction', data };
      console.log('收到新交易:', data);
    });

    socket.value.on('system:notification', (data) => {
      lastMessage.value = { type: 'notification', data };
      console.log('收到系统通知:', data);
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  const emit = (event: string, data?: any) => {
    if (socket.value?.connected) {
      socket.value.emit(event, data);
    }
  };

  return {
    socket,
    isConnected,
    lastMessage,
    connectionStatus,
    connect,
    disconnect,
    emit
  };
});
