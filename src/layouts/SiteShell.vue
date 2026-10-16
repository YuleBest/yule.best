<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import ModeToggle from '@/components/ModeToggle.vue'
import { gsap, ScrollSmoother, ScrollTrigger } from '@/lib/gsap'

const navLinks: { label: string; to: RouteLocationRaw }[] = [
  { label: '项目', to: { path: '/projects' } },
  { label: '博客', to: { path: '/blog' } },
]

const route = useRoute()
const shellRef = ref<HTMLElement | null>(null)

let mm: gsap.MatchMedia | undefined
let smoother: ScrollSmoother | undefined
let programmaticScrollUntil = 0
let contentObserver: ResizeObserver | null = null

function scrollToRoute() {
  const hash = route.hash
  if (hash.length > 1) {
    const target = document.querySelector(hash)
    if (target) {
      if (smoother) {
        smoother.scrollTo(target, true)
      } else {
        target.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        })
      }
      programmaticScrollUntil = Date.now() + 1200
      return
    }
  }

  if (smoother) {
    smoother.scrollTop(0)
    programmaticScrollUntil = Date.now() + 400
  } else {
    window.scrollTo(0, 0)
  }
}

function onPageLeave(el: Element, done: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    done()
    return
  }

  gsap.to(el, {
    autoAlpha: 0,
    y: -16,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: done,
    onInterrupt: done,
  })
}

function onPageEnter(el: Element, done: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    done()
    return
  }

  gsap.fromTo(
    el,
    { autoAlpha: 0, y: 18 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
      onComplete: () => {
        done()
        ScrollTrigger.refresh()
        scrollToRoute()
      },
      onInterrupt: done,
    },
  )
}

onMounted(() => {
  const shell = shellRef.value
  if (shell) {
    mm = gsap.matchMedia()

    // 平滑滚动只在精确指针设备上启用，触屏交给系统原生滚动
    mm.add(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
        smoother = ScrollSmoother.create({
          wrapper: '#smooth-wrapper',
          content: '#smooth-content',
          smooth: 0.8,
        })

        return () => {
          smoother?.kill()
          smoother = undefined
        }
      },
      shell,
    )

    mm.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        const header = shell.querySelector<HTMLElement>('.site-header')
        if (header) {
          let headerHidden = false
          let lastScrollY = window.scrollY
          ScrollTrigger.create({
            start: 96,
            end: 'max',
            onUpdate: (self) => {
              const scrollY = window.scrollY
              const moved = Math.abs(scrollY - lastScrollY) > 2
              lastScrollY = scrollY
              if (!self.isActive || !moved) return

              const shouldHide = self.direction === 1 && Date.now() > programmaticScrollUntil
              if (shouldHide === headerHidden) return
              headerHidden = shouldHide
              gsap.to(header, {
                yPercent: shouldHide ? -100 : 0,
                duration: shouldHide ? 0.35 : 0.5,
                ease: shouldHide ? 'power2.in' : 'power3.out',
                overwrite: true,
              })
            },
          })
        }
      },
      shell,
    )

    const content = shell.querySelector<HTMLElement>('#smooth-content')
    if (content) {
      let lastHeight = 0
      let refreshQueued = false
      contentObserver = new ResizeObserver(() => {
        const height = content.getBoundingClientRect().height
        if (Math.abs(height - lastHeight) < 2) return
        lastHeight = height
        if (refreshQueued) return
        refreshQueued = true
        requestAnimationFrame(() => {
          refreshQueued = false
          ScrollTrigger.refresh()
        })
      })
      contentObserver.observe(content)
    }
  }

  nextTick(scrollToRoute)
})

onBeforeUnmount(() => {
  contentObserver?.disconnect()
  mm?.revert()
})
</script>

<template>
  <div ref="shellRef">
    <header
      class="site-header fixed inset-x-0 top-0 z-50 bg-background/85 backdrop-blur-md will-change-transform"
    >
      <nav class="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5 sm:gap-10 sm:px-8">
        <RouterLink
          :to="{ path: '/', hash: '#top' }"
          class="shrink-0 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          于乐的早安电台
        </RouterLink>
        <ul class="flex items-center gap-4 sm:gap-8">
          <li v-for="link in navLinks" :key="link.label">
            <RouterLink
              :to="link.to"
              class="group relative inline-block py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-sm"
            >
              {{ link.label }}
              <span
                aria-hidden="true"
                class="absolute inset-x-0 bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100"
              />
            </RouterLink>
          </li>
        </ul>
        <div class="ml-auto flex shrink-0 items-center gap-2">
          <RouterLink
            :to="{ path: '/', hash: '#contact' }"
            class="hidden rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:inline-block"
          >
            联系我
          </RouterLink>
          <ModeToggle />
        </div>
      </nav>
      <div class="mx-auto max-w-5xl px-5 sm:px-8">
        <div class="h-px bg-border/70" />
      </div>
    </header>

    <div id="smooth-wrapper">
      <div id="smooth-content">
        <RouterView v-slot="{ Component, route: currentRoute }">
          <Transition :css="false" mode="out-in" @leave="onPageLeave" @enter="onPageEnter">
            <component :is="Component" :key="currentRoute.path" />
          </Transition>
        </RouterView>

        <footer class="border-t border-border/60">
          <div
            class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-xs text-muted-foreground sm:px-8"
          >
            <span>© 2026 于乐Yule</span>
            <span>
              <a
                href="https://zh.moegirl.org.cn/小鸟游六花"
                target="_blank"
                rel="noreferrer"
                class="transition-colors hover:text-brand"
              >
                萌LH-20050612
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
