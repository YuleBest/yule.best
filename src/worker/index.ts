import { Hono } from 'hono'

interface Env {
  GITHUB_TOKEN?: string
}

interface GitHubRepo {
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  topics?: string[]
  default_branch: string
  pushed_at: string
  license: { spdx_id: string | null } | null
}

interface GitHubAsset {
  id: number
  name: string
  size: number
  download_count: number
  content_type: string
}

interface GitHubRelease {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  draft: boolean
  prerelease: boolean
  published_at: string | null
  html_url: string
  assets: GitHubAsset[]
}

const REPOS: Record<string, string> = {
  LuminPro: 'YuleBest/LuminPro',
  FontMM: 'YuleBest/FontMM',
}

const GITHUB_API = 'https://api.github.com'
const INFO_TTL = 300
const README_TTL = 600
const RELEASE_TTL = 300
const PASSTHROUGH_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
]

class GithubError extends Error {
  status: number

  constructor(status: number, message?: string) {
    super(message ?? `GitHub 返回 ${status}`)
    this.status = status
  }
}

const app = new Hono<{ Bindings: Env }>().basePath('/api')

function githubHeaders(env: Env, accept = 'application/vnd.github+json') {
  const headers: Record<string, string> = {
    accept,
    'user-agent': 'yule-best-site',
    'x-github-api-version': '2022-11-28',
  }
  if (env.GITHUB_TOKEN) headers.authorization = `Bearer ${env.GITHUB_TOKEN}`
  return headers
}

function resolveRepo(name: string) {
  return Object.keys(REPOS).includes(name) ? REPOS[name] : undefined
}

async function cached(request: Request, ttl: number, handler: () => Promise<Response>) {
  const cache = (caches as unknown as { default: Cache }).default

  try {
    const hit = await cache.match(request)
    if (hit) return hit
  } catch {
    // 缓存不可用时直接回源
  }

  const response = await handler()
  if (!response.ok) return response

  const headers = new Headers(response.headers)
  headers.set('cache-control', `public, max-age=${ttl}`)
  const cacheable = new Response(await response.text(), { status: response.status, headers })

  try {
    await cache.put(request, cacheable.clone())
  } catch {
    // 写缓存失败不影响响应
  }

  return cacheable
}

async function loadProject(env: Env, name: string) {
  const repo = REPOS[name] as string
  const [repoResponse, latestResponse, listResponse] = await Promise.all([
    fetch(`${GITHUB_API}/repos/${repo}`, { headers: githubHeaders(env) }),
    fetch(`${GITHUB_API}/repos/${repo}/releases/latest`, { headers: githubHeaders(env) }),
    fetch(`${GITHUB_API}/repos/${repo}/releases?per_page=1`, { headers: githubHeaders(env) }),
  ])

  if (!repoResponse.ok && repoResponse.status !== 404) {
    throw new GithubError(repoResponse.status, `GitHub 返回 ${repoResponse.status}`)
  }

  const data = (await repoResponse.json()) as GitHubRepo

  // 只有预发布版本时 /releases/latest 会 404，退回列表里的最新一条
  let release: GitHubRelease | null = latestResponse.ok
    ? ((await latestResponse.json()) as GitHubRelease)
    : null

  if (!release && listResponse.ok) {
    const [first] = (await listResponse.json()) as GitHubRelease[]
    release = first ?? null
  }

  return {
    name,
    repo: data.full_name,
    htmlUrl: data.html_url,
    description: data.description ?? '',
    stars: data.stargazers_count,
    forks: data.forks_count,
    issues: data.open_issues_count,
    topics: data.topics ?? [],
    license: data.license?.spdx_id ?? null,
    defaultBranch: data.default_branch,
    pushedAt: data.pushed_at,
    latestRelease: release
      ? {
          tag: release.tag_name,
          name: release.name ?? release.tag_name,
          publishedAt: release.published_at,
          htmlUrl: release.html_url,
        }
      : null,
  }
}

app.get('/projects', (c) =>
  cached(c.req.raw, INFO_TTL, async () => {
    const projects = await Promise.all(Object.keys(REPOS).map((name) => loadProject(c.env, name)))
    return Response.json({ projects })
  }),
)

app.get('/health', (c) => c.json({ ok: true, githubToken: Boolean(c.env.GITHUB_TOKEN) }))

app.get('/projects/:name', (c) => {
  const name = c.req.param('name')
  if (!resolveRepo(name)) return c.json({ error: '项目不存在' }, 404)

  return cached(c.req.raw, INFO_TTL, async () => Response.json(await loadProject(c.env, name)))
})

app.get('/projects/:name/readme', (c) => {
  const name = c.req.param('name')
  const repo = resolveRepo(name)
  if (!repo) return c.json({ error: '项目不存在' }, 404)

  return cached(c.req.raw, README_TTL, async () => {
    const response = await fetch(`${GITHUB_API}/repos/${repo}/readme`, {
      headers: githubHeaders(c.env, 'application/vnd.github.raw'),
    })
    if (!response.ok) throw new GithubError(response.status)

    return Response.json({
      name,
      repo,
      markdown: await response.text(),
    })
  })
})

app.get('/projects/:name/releases', (c) => {
  const name = c.req.param('name')
  const repo = resolveRepo(name)
  if (!repo) return c.json({ error: '项目不存在' }, 404)

  return cached(c.req.raw, RELEASE_TTL, async () => {
    const response = await fetch(`${GITHUB_API}/repos/${repo}/releases?per_page=30`, {
      headers: githubHeaders(c.env),
    })
    if (!response.ok) throw new GithubError(response.status)

    const releases = (await response.json()) as GitHubRelease[]

    return Response.json({
      name,
      available: releases.length > 0,
      releases: releases
        .filter((release) => !release.draft)
        .map((release) => ({
          id: release.id,
          tag: release.tag_name,
          name: release.name ?? release.tag_name,
          prerelease: release.prerelease,
          publishedAt: release.published_at,
          htmlUrl: release.html_url,
          assets: release.assets.map((asset) => ({
            id: asset.id,
            name: asset.name,
            size: asset.size,
            downloadCount: asset.download_count,
            contentType: asset.content_type,
          })),
        })),
    })
  })
})

app.get('/projects/:name/assets/:id', async (c) => {
  const name = c.req.param('name')
  const repo = resolveRepo(name)
  const id = c.req.param('id')

  if (!repo) return c.json({ error: '项目不存在' }, 404)
  if (!/^\d+$/.test(id)) return c.json({ error: '资源 ID 不合法' }, 400)

  const headers = githubHeaders(c.env, 'application/octet-stream')
  const range = c.req.header('range')
  if (range) headers.range = range

  const upstream = await fetch(`${GITHUB_API}/repos/${repo}/releases/assets/${id}`, { headers })
  if (!upstream.ok || !upstream.body) {
    return c.json({ error: `GitHub 返回 ${upstream.status}` }, 502)
  }

  const responseHeaders = new Headers()
  for (const key of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(key)
    if (value) responseHeaders.set(key, value)
  }

  const filename = (c.req.query('name') ?? 'download').replace(/["\\\r\n]/g, '_')
  responseHeaders.set('content-disposition', `attachment; filename="${filename}"`)
  responseHeaders.set('cache-control', 'public, max-age=3600')

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
})

app.onError((error, c) => {
  console.error(error)
  if (error instanceof GithubError) {
    return c.json({ error: error.message }, error.status === 404 ? 404 : 502)
  }
  return c.json({ error: '服务暂时不可用' }, 500)
})

export default app
