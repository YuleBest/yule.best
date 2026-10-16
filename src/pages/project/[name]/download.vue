<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Download } from '@lucide/vue'
import { assetDownloadUrl, fetchReleases, formatSize, type Release } from '@/lib/github'

const route = useRoute()
const name = computed(() => String((route.params as { name?: string }).name ?? ''))

const releases = ref<Release[]>([])
const loading = ref(true)
const error = ref('')

watch(
  name,
  async (value) => {
    loading.value = true
    error.value = ''

    try {
      releases.value = (await fetchReleases(value)).releases
      document.title = `下载 ${value} · 于乐的早安电台`
    } catch (caught) {
      releases.value = []
      error.value = caught instanceof Error ? caught.message : '版本信息加载失败'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
    <RouterLink
      :to="`/project/${name}`"
      class="text-sm text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      返回 {{ name }}
    </RouterLink>

    <header
      class="mt-10 flex flex-wrap items-end justify-between gap-6 border-b border-border/60 pb-6"
    >
      <h1 class="text-3xl font-semibold sm:text-4xl">下载 {{ name }}</h1>
      <p v-if="!loading && !error" class="font-mono text-xs text-muted-foreground">
        {{ releases.length }} 个版本
      </p>
    </header>

    <p v-if="loading" class="py-16 text-sm text-muted-foreground">正在获取 Release…</p>
    <p v-else-if="error" class="py-16 text-sm">{{ error }}</p>
    <p v-else-if="!releases.length" class="py-16 text-sm text-muted-foreground">
      这个项目还没有发布 Release。
    </p>

    <div v-else class="mt-4">
      <section v-for="release in releases" :key="release.id" class="border-b border-border/60 py-8">
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h2 class="text-xl font-medium">{{ release.tag }}</h2>
          <span
            v-if="release.prerelease"
            class="rounded-full border border-border/70 px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            预发布
          </span>
          <span v-if="release.publishedAt" class="font-mono text-xs text-muted-foreground">
            {{ release.publishedAt.slice(0, 10) }}
          </span>
        </div>

        <ul class="mt-6">
          <li v-for="asset in release.assets" :key="asset.id">
            <a
              :href="assetDownloadUrl(name, asset)"
              class="group flex flex-wrap items-center justify-between gap-4 border-t border-border/60 py-4 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span class="flex min-w-0 items-center gap-3">
                <Download
                  class="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand"
                />
                <span class="truncate text-sm">{{ asset.name }}</span>
              </span>
              <span
                class="flex shrink-0 items-center gap-5 font-mono text-xs text-muted-foreground"
              >
                <span>{{ formatSize(asset.size) }}</span>
                <span>{{ asset.downloadCount }} 次下载</span>
              </span>
            </a>
          </li>
        </ul>

        <ul v-if="!release.assets.length" class="mt-4 text-sm text-muted-foreground">
          <li>该版本没有可下载的文件。</li>
        </ul>
      </section>
    </div>
  </section>
</template>
