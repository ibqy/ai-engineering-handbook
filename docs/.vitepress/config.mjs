import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { readCatalog } from '../../scripts/catalog.mjs'
import { categories } from './categories.mjs'

const repository = 'https://github.com/ibqy/ai-engineering-handbook'
const questions = readCatalog(fileURLToPath(new URL('../', import.meta.url)))

export default defineConfig({
  lang: 'zh-CN',
  title: 'AI 开发场景问答手册',
  description: '从常见问题到高阶场景：模型、RAG、Agent、MCP、评测与生产工程。关联 ibqy 的 Java AI 实战仓库，持续补充。',
  base: '/ai-engineering-handbook/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['meta', { name: 'theme-color', content: '#b91c1c' }]],
  markdown: { lineNumbers: true, theme: { light: 'github-light', dark: 'github-dark' } },
  themeConfig: {
    siteTitle: 'AI / 场景问答',
    nav: [
      { text: '问答目录', link: '/' },
      { text: '按场景查', link: '/scenarios' },
      { text: '项目对照', link: '/projects' },
      { text: '持续补充', link: '/guide/contributing' }
    ],
    sidebar: [
      { text: '阅读指南', items: [
        { text: '全部问答', link: '/' },
        { text: '按场景查', link: '/scenarios' },
        { text: '如何使用这本手册', link: '/guide/start' },
        { text: '关联项目与能力边界', link: '/projects' },
        { text: '补充与纠错', link: '/guide/contributing' }
      ] },
      ...categories.map(category => ({ text: category.name, collapsed: true, items: questions.filter(q => q.category === category.id).map(q => ({ text: `${q.id} ${q.title}`, link: q.url })) }))
    ],
    outline: { level: [2, 3], label: '本页目录' },
    sidebarMenuLabel: '分类目录',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换至浅色',
    darkModeSwitchTitle: '切换至深色',
    skipToContentLabel: '跳到正文',
    docFooter: { prev: '上一篇', next: '下一篇' },
    editLink: { pattern: `${repository}/edit/main/docs/:path`, text: '在 GitHub 补充或纠错' },
    lastUpdated: { text: '最后提交更新' },
    socialLinks: [{ icon: 'github', link: repository }],
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        miniSearch: {
          options: { tokenize: text => Array.from(new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text)).filter(part => part.isWordLike).map(part => part.segment) },
          searchOptions: { combineWith: 'AND', fuzzy: false, prefix: true }
        },
        locales: { root: { translations: {
          button: { buttonText: '全文搜索', buttonAriaLabel: '全文搜索问答' },
          modal: { noResultsText: '没有找到结果，试试更短的关键词', resetButtonTitle: '清空搜索', backButtonTitle: '关闭搜索', displayDetails: '显示正文片段', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } }
        } } }
      }
    },
    footer: { message: '工程判断优先于术语堆砌。示例不等于生产承诺。', copyright: 'ibqy · AI 开发场景问答手册' }
  }
})
