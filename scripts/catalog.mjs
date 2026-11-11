import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { categories } from '../docs/.vitepress/categories.mjs'

const sections = ['直接回答', '实际场景', '原理与取舍', '实现示例', '常见坑', '验证清单', '关联项目与参考']

export function readCatalog(docsRoot) {
  const root = join(docsRoot, 'questions')
  const ids = new Set()
  const result = []
  for (const folder of readdirSync(root, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue
    for (const filename of readdirSync(join(root, folder.name))) {
      if (!filename.endsWith('.md')) continue
      const path = `questions/${folder.name}/${filename}`
      const { data, content } = matter(readFileSync(join(docsRoot, path), 'utf8'))
      const fail = message => { throw new Error(`${path}: ${message}`) }
      const category = categories.find(item => item.id === data.category)
      if (!category) fail('category 不在分类表中')
      if (folder.name !== data.category) fail('目录与 category 不一致')
      if (!new RegExp(`^${category.prefix}\\d{2,}$`).test(data.id)) fail('id 前缀或编号格式错误')
      if (ids.has(data.id)) fail(`重复 id ${data.id}`)
      ids.add(data.id)
      for (const field of ['title', 'summary']) {
        if (typeof data[field] !== 'string' || !data[field].trim()) fail(`缺少 ${field}`)
      }
      if (!['基础', '高阶'].includes(data.level)) fail('level 必须为基础或高阶')
      if (!Array.isArray(data.tags) || !data.tags.length || data.tags.some(tag => typeof tag !== 'string' || !tag.trim())) fail('tags 必须为非空字符串数组')
      if (!Number.isInteger(data.order) || data.order < 1) fail('order 必须为正整数')
      const date = new Date(`${data.updated}T00:00:00Z`)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updated) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.updated) fail('updated 必须为有效日期 YYYY-MM-DD')
      const prose = content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
      const headings = [...prose.matchAll(/^# ([^\r\n]+)$/gm)].map(match => match[1].trim())
      if (headings.length !== 1 || headings[0] !== data.title.trim()) fail('需要唯一且与 title 一致的 H1 标题')
      for (const section of sections) {
        if (!new RegExp(`^## ${section}\\s*$`, 'm').test(prose)) fail(`缺少章节：${section}`)
      }
      if (!/\]\(https:\/\/[^\s)]+\)/.test(prose)) fail('至少需要一条参考链接')
      result.push({ id: data.id, title: data.title, summary: data.summary, category: data.category, level: data.level, tags: data.tags, updated: data.updated, order: data.order, url: `/${path.slice(0, -3)}` })
    }
  }
  return result.sort((a, b) => categories.findIndex(c => c.id === a.category) - categories.findIndex(c => c.id === b.category) || a.order - b.order || a.id.localeCompare(b.id))
}
