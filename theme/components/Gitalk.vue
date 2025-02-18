<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import md5 from 'md5'
import Gitalk from 'gitalk' // 导入类型声明
import { AthemeConfig } from '../config'
import GitalkOptions = Gitalk.GitalkOptions

interface IGitalkInstance {
  render: (id: string) => void
  destroy: () => void
}

let gitalk: IGitalkInstance | null = null

onMounted(() => {
  // 显式声明类型并转换readonly数组
  const commentConfig: GitalkOptions = {
    clientID: AthemeConfig.clientID,
    clientSecret: AthemeConfig.clientSecret,
    repo: AthemeConfig.repo,
    owner: AthemeConfig.owner,
    admin: [...AthemeConfig.admin], // 解除readonly
    title: document.title, // 添加必填字段
    id: md5(location.pathname).slice(0, 50),
    distractionFreeMode: false,
    // 添加Gitalk要求的其他默认字段
  }

  gitalk = new Gitalk(commentConfig) as IGitalkInstance
  gitalk.render('gitalk-container')
})

onUnmounted(() => {
  gitalk?.destroy()
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
