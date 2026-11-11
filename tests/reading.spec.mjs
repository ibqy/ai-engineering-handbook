import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { readCatalog } from '../scripts/catalog.mjs'
const questions = readCatalog(fileURLToPath(new URL('../docs/', import.meta.url)))

test('reader filters by category and difficulty, searches and recovers from empty results', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI 开发场景问答手册')
  await expect(page.locator('.question-link')).toHaveCount(questions.length)
  await expect(page.getByRole('button', { name: '重置筛选' })).toBeDisabled()
  await page.getByRole('combobox', { name: '主题', exact: true }).selectOption('rag')
  await page.getByRole('combobox', { name: '难度', exact: true }).selectOption('高阶')
  await expect(page.locator('.question-link')).toHaveCount(questions.filter(q => q.category === 'rag' && q.level === '高阶').length)
  await page.getByLabel('筛选标题、摘要、标签').fill('没有这个问题xyz')
  await expect(page.getByRole('heading', { name: '暂时没有匹配的问题' })).toBeVisible()
  await page.getByRole('button', { name: '查看全部问答' }).click()
  await expect(page.locator('.question-link')).toHaveCount(questions.length)
  await page.getByLabel('筛选标题、摘要、标签').fill('M01')
  await expect(page.locator('.question-link')).toHaveCount(1)
  await page.locator('.question-link').click()
  await expect(page.locator('.vp-doc h1')).toHaveText(questions.find(q => q.id === 'M01').title)
  await expect(page.locator('.article-meta')).toContainText('M01')
  await expect(page.getByRole('link', { name: '在 GitHub 补充或纠错' })).toHaveAttribute('href', /\/edit\/main\/docs\/questions\/models\//)
})

test('Chinese full-text search finds article content and opens an article', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '全文搜索问答' }).click()
  const search = page.locator('#localsearch-input')
  await expect(search).toBeVisible()
  await search.fill('检查点')
  await expect(page.locator('.VPLocalSearchBox .result').first()).toBeVisible()
  await page.locator('.VPLocalSearchBox .result').first().click()
  await expect(page.locator('.vp-doc h1')).toBeVisible()
  await expect(page).toHaveURL(/\/questions\//)
})

for (const width of [375, 768, 1024, 1440]) {
  test(`directory and article fit ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await expect(page.locator('.question-link').first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.locator('.question-link').first().click()
    await expect(page.locator('.vp-doc h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 375) {
      await page.getByRole('button', { name: '分类目录' }).click()
      await expect(page.locator('.VPSidebar')).toBeVisible()
    }
  })
}

test('keyboard filters and dark mode remain usable', async ({ page }) => {
  await page.goto('./')
  await page.getByLabel('筛选标题、摘要、标签').focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('combobox', { name: '主题', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('combobox', { name: '难度', exact: true })).toBeFocused()
  await page.getByRole('switch', { name: '切换至深色' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.locator('.question-link').first().click()
  await expect(page.locator('.vp-doc h1')).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('every article renders its sections with no console errors or missing local resources', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('response', response => { if (response.url().startsWith('http://127.0.0.1:4173/') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
  for (const question of questions) {
    const response = await page.goto(`.${question.url}`)
    expect(response.status()).toBe(200)
    await expect(page.locator('.vp-doc h1')).toHaveText(question.title)
    for (const section of ['直接回答', '实际场景', '原理与取舍', '实现示例', '常见坑', '验证清单', '关联项目与参考']) {
      await expect(page.locator('.vp-doc h2').filter({ hasText: section })).toHaveCount(1)
    }
  }
  expect(errors).toEqual([])
})

test('scenario, source map and contribution guide remain reachable', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('link', { name: '我遇到了一个问题 →' }).click()
  await expect(page.locator('.vp-doc h1')).toHaveText('按场景查问题')
  await page.locator('.vp-doc a[href*="/questions/"]').first().click()
  await expect(page.locator('.article-meta')).toBeVisible()
  await page.goto('./projects')
  await expect(page.locator('.vp-doc h1')).toHaveText('关联项目与能力边界')
  await page.goto('./guide/contributing')
  await expect(page.locator('.vp-doc h1')).toHaveText('持续补充与纠错')
})
