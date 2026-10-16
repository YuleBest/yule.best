<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { findPost, posts } from '@/lib/posts'

const route = useRoute()

const slug = computed(() => {
  const value = (route.params as { path?: string | string[] }).path
  return Array.isArray(value) ? value.join('/') : (value ?? '')
})

const post = computed(() => findPost(slug.value))
const index = computed(() => posts.findIndex((item) => item.path === slug.value))
const newer = computed(() => (index.value > 0 ? posts[index.value - 1] : undefined))
const older = computed(() => (index.value >= 0 ? posts[index.value + 1] : undefined))

watchEffect(() => {
  document.title = post.value
    ? `${post.value.title} · 于乐的早安电台`
    : '文章不存在 · 于乐的早安电台'
})
</script>

<template>
  <article class="mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
    <template v-if="post">
      <RouterLink
        to="/blog"
        class="text-sm text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        返回博客
      </RouterLink>

      <header class="mt-10 max-w-[46rem]">
        <div class="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
          <time :datetime="post.published">{{ post.published }}</time>
          <span v-if="post.category">{{ post.category }}</span>
        </div>
        <h1 class="mt-5 text-3xl leading-tight font-semibold sm:text-5xl">{{ post.title }}</h1>
        <p v-if="post.description" class="mt-5 text-lg leading-relaxed text-muted-foreground">
          {{ post.description }}
        </p>
        <ul v-if="post.tags.length" class="mt-7 flex flex-wrap gap-2">
          <li
            v-for="tag in post.tags"
            :key="tag"
            class="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground"
          >
            {{ tag }}
          </li>
        </ul>
      </header>

      <div
        class="prose prose-zinc dark:prose-invert mt-14 max-w-[68ch] prose-headings:font-semibold prose-a:text-brand prose-code:font-mono prose-img:rounded-lg"
        v-html="post.html"
      />

      <nav
        v-if="newer || older"
        class="mt-20 grid gap-6 border-t border-border/60 pt-8 sm:grid-cols-2"
      >
        <RouterLink
          v-if="newer"
          :to="`/blog/${newer.path}`"
          class="group flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <span class="font-mono text-xs text-muted-foreground">上一篇</span>
          <span class="text-base font-medium transition-colors group-hover:text-brand">
            {{ newer.title }}
          </span>
        </RouterLink>
        <RouterLink
          v-if="older"
          :to="`/blog/${older.path}`"
          class="group flex flex-col gap-2 sm:items-end sm:text-right focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <span class="font-mono text-xs text-muted-foreground">下一篇</span>
          <span class="text-base font-medium transition-colors group-hover:text-brand">
            {{ older.title }}
          </span>
        </RouterLink>
      </nav>
    </template>

    <div v-else class="py-24 text-center">
      <p class="text-2xl font-semibold">没有找到这篇文章</p>
      <p class="mt-3 text-sm text-muted-foreground">链接可能拼错了，或者文章还没写。</p>
      <RouterLink
        to="/blog"
        class="mt-10 inline-block rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
      >
        回到博客
      </RouterLink>
    </div>
  </article>
</template>
