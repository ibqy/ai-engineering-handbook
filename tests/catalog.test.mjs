import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const catalog = await import('../scripts/catalog.mjs').catch(() => ({}))
const filtering = await import('../docs/.vitepress/theme/filter.mjs').catch(() => ({}))
const article = (extra = '') => `---
id: M01
title: 怎样选择模型？
category: models
level: 基础
tags: [模型, LLM]
summary: 按任务评测选择。
updated: '2026-11-11'
order: 1
${extra}---
# 怎样选择模型？
${['直接回答', '实际场景', '原理与取舍', '实现示例', '常见坑', '验证清单', '关联项目与参考'].map(s => `## ${s}\n\n这里是具体的内容。\n`).join('\n')}
[参考](https://github.com/ibqy/spring-ai-teaching-demo/blob/main/README.md)
`
function fixture(t, source = article()) {
  const root = mkdtempSync(join(tmpdir(), 'handbook-'))
  mkdirSync(join(root, 'questions/models'), { recursive: true })
  writeFileSync(join(root, 'questions/models/model.md'), source)
  t.after(() => rmSync(root, { recursive: true, force: true }))
  return root
}

test('catalog discovers new Markdown without a manual registration list', t => {
  assert.equal(typeof catalog.readCatalog, 'function')
  const result = catalog.readCatalog(fixture(t))
  assert.equal(result.length, 1)
  assert.equal(result[0].url, '/questions/models/model')
  assert.equal(result[0].id, 'M01')
  assert.deepEqual(result[0].tags, ['模型', 'LLM'])
})

test('catalog refuses duplicate stable IDs', t => {
  assert.equal(typeof catalog.readCatalog, 'function')
  const root = fixture(t)
  writeFileSync(join(root, 'questions/models/other.md'), article())
  assert.throws(() => catalog.readCatalog(root), /重复.*M01/)
})

test('catalog rejects missing required article sections', t => {
  assert.equal(typeof catalog.readCatalog, 'function')
  const root = fixture(t, article().replace('## 验证清单', '## 其他'))
  assert.throws(() => catalog.readCatalog(root), /验证清单/)
})

test('catalog requires one H1 matching the article title', t => {
  for (const heading of ['', '# 不同标题', '# 怎样选择模型？\n# 怎样选择模型？']) {
    assert.throws(() => catalog.readCatalog(fixture(t, article().replace('# 怎样选择模型？', heading))), /H1/)
  }
})

test('catalog rejects unknown category and invalid level', t => {
  assert.equal(typeof catalog.readCatalog, 'function')
  assert.throws(() => catalog.readCatalog(fixture(t, article().replace('category: models', 'category: mystery'))), /category/)
  assert.throws(() => catalog.readCatalog(fixture(t, article().replace('level: 基础', 'level: 随意'))), /level/)
})

test('catalog rejects misplaced files and invalid date', t => {
  assert.equal(typeof catalog.readCatalog, 'function')
  assert.throws(() => catalog.readCatalog(fixture(t, article().replace('category: models', 'category: rag'))), /目录/)
  assert.throws(() => catalog.readCatalog(fixture(t, article().replace('2026-11-11', '2026-02-31'))), /updated/)
})

const questions = [
  { id: 'R01', title: '检索不到答案', category: 'rag', level: '基础', tags: ['RAG'], summary: '先排查索引' },
  { id: 'A01', title: '任务恢复', category: 'agents', level: '高阶', tags: ['checkpoint'], summary: '副作用要幂等' }
]
test('filter combines category, difficulty and normalized text', () => {
  assert.equal(typeof filtering.filterQuestions, 'function')
  assert.deepEqual(filtering.filterQuestions(questions, { category: 'rag', level: '基础', query: ' RAg ' }), [questions[0]])
  assert.deepEqual(filtering.filterQuestions(questions, { query: '副作用' }), [questions[1]])
  assert.deepEqual(filtering.filterQuestions(questions, { category: 'rag', level: '高阶' }), [])
})

test('blank filter returns all articles without mutation; no match is empty', () => {
  assert.equal(typeof filtering.filterQuestions, 'function')
  assert.deepEqual(filtering.filterQuestions(questions, {}), questions)
  assert.deepEqual(filtering.filterQuestions(questions, { query: '不存在' }), [])
  assert.equal(questions.length, 2)
})
