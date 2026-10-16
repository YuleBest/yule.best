<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Star } from '@lucide/vue'
import { fetchProjects, type ProjectSummary } from '@/lib/github'

const projects = ref<ProjectSummary[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  document.title = '项目 · 于乐的早安电台'

  try {
    projects.value = (await fetchProjects()).projects
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '项目信息加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
    <header class="flex flex-wrap items-end justify-between gap-6 border-b border-border/60 pb-6">
      <h1 class="text-3xl font-semibold sm:text-4xl">项目</h1>
      <p v-if="!loading && !error" class="font-mono text-xs text-muted-foreground">
        {{ projects.length }} 个
      </p>
    </header>

    <p v-if="loading" class="py-16 text-sm text-muted-foreground">正在从 GitHub 拉取项目信息…</p>
    <p v-else-if="error" class="py-16 text-sm">{{ error }}</p>

    <ul v-else>
      <li
        v-for="project in projects"
        :key="project.name"
        class="group relative overflow-hidden border-b border-border/60"
      >
        <span
          aria-hidden="true"
          class="absolute inset-0 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
        <RouterLink
          :to="`/project/${project.name}`"
          class="relative flex flex-col gap-3 px-1 py-8 transition-colors duration-300 group-hover:text-brand-ink sm:flex-row sm:items-baseline sm:justify-between sm:gap-12"
        >
          <span class="sm:flex sm:items-baseline sm:gap-10">
            <span class="text-xl font-medium whitespace-nowrap">{{ project.name }}</span>
            <span
              class="mt-2 block max-w-[52ch] text-sm text-muted-foreground transition-colors duration-300 group-hover:text-brand-ink/80 sm:mt-0"
            >
              {{ project.description }}
            </span>
          </span>
          <span
            class="flex shrink-0 items-center gap-5 font-mono text-xs text-muted-foreground transition-colors duration-300 group-hover:text-brand-ink/80"
          >
            <span class="flex items-center gap-1.5">
              <Star class="size-3.5" />
              {{ project.stars }}
            </span>
            <span v-if="project.latestRelease">{{ project.latestRelease.tag }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
