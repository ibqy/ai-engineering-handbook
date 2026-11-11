import { createContentLoader } from 'vitepress'
import { categories } from './categories.mjs'

export default createContentLoader('questions/**/*.md', {
  transform(pages) {
    return pages.map(({ url, frontmatter }) => ({ ...frontmatter, url: url.replace(/\.html$/, '') }))
      .sort((a, b) => categories.findIndex(c => c.id === a.category) - categories.findIndex(c => c.id === b.category) || a.order - b.order || a.id.localeCompare(b.id))
  }
})
