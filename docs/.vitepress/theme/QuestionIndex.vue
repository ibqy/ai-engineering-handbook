<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as questions } from '../questions.data.mjs'
import { categories } from '../categories.mjs'
import { filterQuestions } from './filter.mjs'

const category = ref('')
const level = ref('')
const query = ref('')
const visible = computed(() => filterQuestions(questions, { category: category.value, level: level.value, query: query.value }))
const groups = computed(() => categories.map(item => ({ ...item, questions: visible.value.filter(question => question.category === item.id) })).filter(item => item.questions.length))
const active = computed(() => Boolean(category.value || level.value || query.value))
function reset() { category.value = ''; level.value = ''; query.value = '' }
</script>

<template>
  <div class="question-index">
    <div class="index-heading">
      <div><span class="eyebrow">FIELD NOTES / 工程速查</span><h1>AI 开发场景问答手册</h1>
        <p>带着问题来，带着判断和验证方法走。<br>从基础概念到生产取舍，与已有实战项目对照阅读。</p></div>
      <div class="index-count"><strong>{{ questions.length }}</strong><span>篇问答 · {{ categories.length }} 个主题</span></div>
    </div>
    <nav class="reading-links" aria-label="阅读入口">
      <a :href="withBase('/scenarios')">我遇到了一个问题 →</a>
      <a :href="withBase('/guide/start')">第一次阅读</a>
      <a :href="withBase('/projects')">对照我的实战仓库</a>
      <a :href="withBase('/guide/contributing')">补充一道问题</a>
    </nav>
    <div class="index-controls">
      <label class="query-field">筛选标题、摘要、标签<input v-model="query" type="search" placeholder="例如：RAG、幂等、上下文" autocomplete="off"></label>
      <label>主题<select v-model="category"><option value="">全部主题</option><option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
      <label>难度<select v-model="level"><option value="">全部难度</option><option>基础</option><option>高阶</option></select></label>
      <button class="reset-button" :disabled="!active" @click="reset">重置筛选</button>
    </div>
    <div class="result-summary"><span role="status" aria-live="polite">显示 {{ visible.length }} / {{ questions.length }} 篇问答</span><span>查正文细节，请使用顶部「全文搜索」</span></div>
    <div v-if="!visible.length" class="empty-state"><h2>暂时没有匹配的问题</h2><p>换一个关键词，或清除主题与难度限制。</p><button @click="reset">查看全部问答</button></div>
    <section v-for="group in groups" :key="group.id" class="question-group" :aria-labelledby="`category-${group.id}`">
      <header><div><h2 :id="`category-${group.id}`">{{ group.name }}</h2><p>{{ group.description }}</p></div><span>{{ group.questions.length }} 篇</span></header>
      <ul class="question-list">
        <li v-for="question in group.questions" :key="question.id">
          <a :href="withBase(question.url)" class="question-link">
            <span class="question-id">{{ question.id }}</span>
            <div class="question-copy"><h3>{{ question.title }}</h3><p>{{ question.summary }}</p><div class="question-tags"><span v-for="tag in question.tags" :key="tag">{{ tag }}</span></div></div>
            <span class="question-level" :class="{ advanced: question.level === '高阶' }">{{ question.level }}</span><span class="question-arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>
