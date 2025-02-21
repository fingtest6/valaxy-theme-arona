<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import md5 from 'md5'
import Gitalk from 'gitalk' // 导入 Gitalk
import { AthemeConfig } from '../config'
import GitalkOptions = Gitalk.GitalkOptions

let gitalk: any | null = null // 不需要自定义接口，直接使用 any 类型

onMounted(() => {
  // 配置 Gitalk 参数
  const commentConfig: GitalkOptions = {
    clientID: AthemeConfig.clientID,
    clientSecret: AthemeConfig.clientSecret,
    repo: AthemeConfig.repo,
    owner: AthemeConfig.owner,
    admin: [...AthemeConfig.admin], // 解除 readonly
    title: document.title, // 添加必填字段
    id: md5(location.pathname).slice(0, 50),
    distractionFreeMode: false,
  }

  // 初始化 Gitalk 实例并渲染
  gitalk = new Gitalk(commentConfig)
  gitalk.render('gitalk-container')
})

onUnmounted(() => {
  // 手动清理 DOM 元素
  const container = document.getElementById('gitalk-container')
  if (container) {
    container.innerHTML = '' // 清空容器内容
  }
})
</script>

<template>
  <div class="gitalk-container">
    <div id="gitalk-container" />
  </div>
</template>

<style>
.gt-container .gt-header-textarea {
  color: #000;
}
</style>
