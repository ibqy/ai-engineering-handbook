<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { categories } from '../categories.mjs'
const { frontmatter } = useData()
const category = computed(() => categories.find(item => item.id === frontmatter.value.category))
</script>

<template>
  <div v-if="frontmatter.id" class="article-meta">
    <a :href="withBase('/')">问答目录</a><span aria-hidden="true">/</span>
    <span>{{ category?.name }}</span><span>{{ frontmatter.id }}</span>
    <strong>{{ frontmatter.level }}</strong>
    <span>内容复核 {{ frontmatter.updated }}</span>
  </div>
</template>
