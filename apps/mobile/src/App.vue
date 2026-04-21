<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useWebSocketStore } from './stores/websocket';

const wsStore = useWebSocketStore();

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    wsStore.connect();
  }
});
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
