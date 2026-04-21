<template>
  <div class="not-found">
    <div class="content">
      <el-icon :size="120" color="#909399"><WarningFilled /></el-icon>
      <h1>404</h1>
      <p>页面不存在</p>
      <el-button type="primary" @click="$router.push('/')">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-base;
}

.content {
  text-align: center;

  h1 {
    font-size: 72px;
    font-weight: 700;
    color: $text-primary;
    margin: 20px 0;
  }

  p {
    font-size: 18px;
    color: $text-secondary;
    margin-bottom: 30px;
  }
}
</style>
