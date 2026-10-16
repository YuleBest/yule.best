export interface ReleaseInfo {
  tag: string
  name: string
  publishedAt: string | null
  htmlUrl: string
}

export interface ProjectSummary {
  name: string
  repo: string
  htmlUrl: string
  description: string
  stars: number
  forks: number
  issues: number
  topics: string[]
  license: string | null
  defaultBranch: string
  pushedAt: string
  latestRelease: ReleaseInfo | null
}

export interface ReleaseAsset {
  id: number
  name: string
  size: number
  downloadCount: number
  contentType: string
}

export interface Release {
  id: number
  tag: string
  name: string
  prerelease: boolean
  publishedAt: string | null
  htmlUrl: string
  assets: ReleaseAsset[]
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`)
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? `请求失败（${response.status}）`)
  }
  return response.json() as Promise<T>
}

export function fetchProjects() {
  return getJson<{ projects: ProjectSummary[] }>('/projects')
}

export function fetchProject(name: string) {
  return getJson<ProjectSummary>(`/projects/${name}`)
}

export function fetchReadme(name: string) {
  return getJson<{ name: string; repo: string; markdown: string }>(`/projects/${name}/readme`)
}

export function fetchReleases(name: string) {
  return getJson<{ name: string; available: boolean; releases: Release[] }>(
    `/projects/${name}/releases`,
  )
}

export function assetDownloadUrl(name: string, asset: ReleaseAsset) {
  return `/api/projects/${name}/assets/${asset.id}?name=${encodeURIComponent(asset.name)}`
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
