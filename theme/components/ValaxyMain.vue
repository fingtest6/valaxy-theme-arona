<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'
import { useSiteConfig } from 'valaxy'
import { AthemeConfig } from '../config'
import Gitalk from './Gitalk.vue'
import 'gitalk/dist/gitalk.css'

defineProps<{
  frontmatter: Post
  data?: PageData
}>()
const siteConfig = useSiteConfig()
</script>

<template>
  <main>
    <div w="full" flex="~">
      <slot name="main">
        <div class="content" flex="~ col grow" w="full" p="l-4 lt-md:0">
          <slot name="main-header" />
          <slot name="main-header-after" />

          <slot name="main-content">
            <div class="markdown-body max-w-none pb-8 prose">
              <ValaxyMd :frontmatter="frontmatter">
                <slot name="main-content-md" />
                <slot />
              </ValaxyMd>
            </div>
            <div class="view-box container">
              <Gitalk v-if="AthemeConfig.clientID" />
            </div>
            <slot name="main-content-after" />
          </slot>
        </div>

        <slot name="main-nav-before" />

        <slot name="main-nav" />

        <slot name="main-nav-after" />

        <slot v-if="siteConfig.comment.enable && frontmatter.comment !== false" name="comment" />
        <slot name="footer" />
      </slot>
    </div>

    <slot name="aside" />
  </main>
</template>
