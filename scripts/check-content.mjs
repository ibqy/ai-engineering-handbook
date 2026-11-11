import { fileURLToPath } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { readCatalog } from './catalog.mjs'
import { categories } from '../docs/.vitepress/categories.mjs'

const docsRoot = fileURLToPath(new URL('../docs/', import.meta.url))
const questions = readCatalog(docsRoot)
if (!questions.length) throw new Error('手册没有问答文章')
for (const category of categories) {
  if (!questions.some(question => question.category === category.id)) throw new Error(`分类为空：${category.name}`)
}
if (process.argv.includes('--local-sources')) {
  const workspace = resolve(docsRoot, '../..')
  let references = 0
  for (const question of questions) {
    const text = readFileSync(join(docsRoot, `${question.url.slice(1)}.md`), 'utf8')
    for (const match of text.matchAll(/https:\/\/github\.com\/ibqy\/([^/\s]+)\/(?:blob|tree)\/main\/([^\s)#]+)/g)) {
      const path = join(workspace, match[1], decodeURIComponent(match[2]))
      if (!existsSync(path)) throw new Error(`${question.id} 引用不存在：${path}`)
      references++
    }
  }
  console.log(`已核对 ${references} 条本地源码/文档引用（不代表外部服务已联调）`)
}
console.log(`内容校验通过：${questions.length} 篇问答，${categories.length} 个分类`)
