<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Clock, GitFork, Scale, Star } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { fetchProject, fetchReadme, type ProjectSummary } from '@/lib/github'
import { renderReadme } from '@/lib/markdown'

const route = useRoute()
const name = computed(() => String((route.params as { name?: string }).name ?? ''))

const project = ref<ProjectSummary | null>(null)
const markdown = ref('')
const loading = ref(true)
const error = ref('')

const readmeHtml = computed(() => {
  const info = project.value
  if (!info || !markdown.value) return ''
  return renderReadme(markdown.value, { repo: info.repo, branch: info.defaultBranch })
})

watch(
  name,
  async (value) => {
    loading.value = true
    error.value = ''

    try {
      const [info, readme] = await Promise.all([fetchProject(value), fetchReadme(value)])
      project.value = info
      markdown.value = readme.markdown
      document.title = `${info.name} · 于乐的早安电台`
    } catch (caught) {
      project.value = null
      markdown.value = ''
      error.value = caught instanceof Error ? caught.message : '项目信息加载失败'
      document.title = '项目不存在 · 于乐的早安电台'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <article class="mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
    <RouterLink
      to="/projects"
      class="text-sm text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      返回项目
    </RouterLink>

    <p v-if="loading" class="py-20 text-sm text-muted-foreground">正在加载项目…</p>
    <p v-else-if="error" class="py-20 text-sm">{{ error }}</p>

    <template v-else-if="project">
      <header class="mt-10">
        <h1 class="text-3xl leading-tight font-semibold sm:text-5xl">{{ project.name }}</h1>
        <p
          v-if="project.description"
          class="mt-5 max-w-[46rem] text-lg leading-relaxed text-muted-foreground"
        >
          {{ project.description }}
        </p>

        <div
          class="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs text-muted-foreground"
        >
          <span class="flex items-center gap-1.5"
            ><Star class="size-3.5" />{{ project.stars }}</span
          >
          <span class="flex items-center gap-1.5"
            ><GitFork class="size-3.5" />{{ project.forks }}</span
          >
          <span v-if="project.license" class="flex items-center gap-1.5">
            <Scale class="size-3.5" />{{ project.license }}
          </span>
          <span class="flex items-center gap-1.5">
            <Clock class="size-3.5" />{{ project.pushedAt.slice(0, 10) }}
          </span>
        </div>

        <ul v-if="project.topics.length" class="mt-7 flex flex-wrap gap-2">
          <li
            v-for="topic in project.topics"
            :key="topic"
            class="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground"
          >
            {{ topic }}
          </li>
        </ul>

        <div class="mt-10 flex flex-wrap gap-3">
          <Button as-child>
            <RouterLink :to="`/project/${project.name}/download`">开始下载</RouterLink>
          </Button>
          <Button as-child variant="outline">
            <a :href="project.htmlUrl" target="_blank" rel="noreferrer">去 GitHub</a>
          </Button>
        </div>

        <p v-if="project.latestRelease" class="mt-6 text-sm text-muted-foreground">
          最新版本
          <a
            :href="project.latestRelease.htmlUrl"
            target="_blank"
            rel="noreferrer"
            class="text-foreground transition-colors hover:text-brand"
          >
            {{ project.latestRelease.tag }}
          </a>
          <span v-if="project.latestRelease.publishedAt">
            · {{ project.latestRelease.publishedAt.slice(0, 10) }}
          </span>
        </p>
      </header>

      <div
        class="prose prose-zinc dark:prose-invert mt-16 max-w-[68ch] prose-headings:font-semibold prose-a:text-brand prose-code:font-mono prose-img:rounded-lg"
        v-html="readmeHtml"
      />
    </template>
  </article>
</template>
