<script setup>
import { ref } from 'vue'
import Gitalk from '../components/Gitalk.vue'
import 'gitalk/dist/gitalk.css'
import { AthemeConfig } from '../config'// 调整路径到你的配置文件

// 初始化链接数据（使用配置文件中的初始值）
const links = ref([...AthemeConfig.links])
</script>

<template>
  <div
    class="relative mx-auto mt-12 max-w-4xl rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:bg-gray-800/90"
  >
    <h1 class="text-2xl font-bold">
      友情链接
    </h1>
    <div class="friend-link-page">
      <!-- 链接列表 -->
      <div class="link-list">
        <div v-for="link in links" :key="link.link" class="link-item mt-2">
          <a :href="link.link" target="_blank" rel="noopener" class="flex-container">
            <img :src="link.avatar" class="avatar" alt="avatar">
            <div class="text-content">
              <div class="name">{{ link.name }}</div>
              <div class="desc">{{ link.desc }}</div>
            </div>
          </a>
        </div>
      </div>
    </div>
    <div class="view-box container">
      <Gitalk v-if="AthemeConfig.clientID" />
    </div>
  </div>
</template>

<style scoped>
/* 新增布局样式 */
.flex-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.text-content {
  flex: 1;
  min-width: 0; /* 防止文字溢出 */
}

/* 调整头像样式 */
.avatar {
  width: 48px;
  height: 48px;
  flex-shrink: 0; /* 禁止缩小 */
  object-fit: cover;
  border-radius: 8px;
}

/* 文字内容样式 */
.name {
  font-weight: 600;
  margin-bottom: 4px;
}

.desc {
  font-size: 0.9em;
  color: #666;
  line-height: 1.4;
}

/* 响应式优化 */
@media (max-width: 600px) {
  .flex-container {
    flex-direction: column;
    text-align: center;
  }

  .avatar {
    width: 64px;
    height: 64px;
    margin-bottom: 8px;
  }
}
</style>
