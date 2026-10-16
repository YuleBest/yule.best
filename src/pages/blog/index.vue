<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap } from '@/lib/gsap'
import { posts } from '@/lib/posts'

const listRef = ref<HTMLElement | null>(null)

let mm: gsap.MatchMedia | undefined

onMounted(() => {
  document.title = '博客 · 于乐的早安电台'

  const list = listRef.value
  if (!list) return

  mm = gsap.matchMedia()
  mm.add(
    '(prefers-reduced-motion: no-preference)',
    () => {
      gsap.from('.post-row', {
        autoAlpha: 0,
        y: 18,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.035,
      })
    },
    list,
  )
})

onBeforeUnmount(() => {
  mm?.revert()
})
</script>

<template>
  <section ref="listRef" class="mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
    <header class="flex flex-wrap items-end justify-between gap-6 border-b border-border/60 pb-6">
      <h1 class="text-3xl font-semibold sm:text-4xl">博客</h1>
      <p class="font-mono text-xs text-muted-foreground">{{ posts.length }} 篇</p>
    </header>

    <ul>
      <li
        v-for="post in posts"
        :key="post.path"
        class="post-row group relative overflow-hidden border-b border-border/60"
      >
        <span
          aria-hidden="true"
          class="absolute inset-0 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
        <RouterLink
          :to="`/blog/${post.path}`"
          class="relative flex flex-col gap-3 px-1 py-7 transition-colors duration-300 group-hover:text-brand-ink sm:flex-row sm:items-baseline sm:justify-between sm:gap-12"
        >
          <span class="sm:flex sm:items-baseline sm:gap-8">
            <span class="text-xl font-medium whitespace-nowrap">{{ post.title }}</span>
            <span
              class="mt-2 block max-w-[52ch] text-sm text-muted-foreground transition-colors duration-300 group-hover:text-brand-ink/80 sm:mt-0"
            >
              {{ post.description }}
            </span>
          </span>
          <span
            class="flex shrink-0 items-center gap-5 font-mono text-xs text-muted-foreground transition-colors duration-300 group-hover:text-brand-ink/80"
          >
            <span>{{ post.category }}</span>
            <time :datetime="post.published">{{ post.published }}</time>
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
