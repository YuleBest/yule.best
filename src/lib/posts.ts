import { load } from 'js-yaml'
import { marked } from 'marked'

export interface Post {
  path: string
  title: string
  published: string
  description: string
  tags: string[]
  category: string
  html: string
}

interface Frontmatter {
  title?: string
  published?: string | Date
  description?: string
  tags?: string[]
  category?: string
}

const sources = import.meta.glob('/posts/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function formatDate(value: string | Date | undefined) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function parsePost(file: string, source: string): Post {
  const match = frontmatterPattern.exec(source)
  const frontmatter = match?.[1]
  const data = (frontmatter ? load(frontmatter) : null) as Frontmatter | null
  const body = match ? source.slice(match[0].length) : source

  return {
    path: file.replace('/posts/', '').replace(/\.md$/, ''),
    title: data?.title ?? file,
    published: formatDate(data?.published),
    description: data?.description ?? '',
    tags: data?.tags ?? [],
    category: data?.category ?? '',
    html: marked.parse(body, { async: false, gfm: true }) as string,
  }
}

export const posts: Post[] = Object.entries(sources)
  .map(([file, source]) => parsePost(file, source))
  .sort((a, b) => b.published.localeCompare(a.published))

export function findPost(path: string) {
  return posts.find((post) => post.path === path)
}
