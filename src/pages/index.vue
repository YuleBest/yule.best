<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { gsap } from '@/lib/gsap'
import type { Post } from '@/lib/posts'

type Flair = 'clover' | 'asterisk'

interface HeroChar {
  char: string
  flair?: Flair
}

const facts = [
  { label: '性别', value: '男生' },
  { label: '位置', value: '广东' },
  { label: '最爱的歌', value: '夜空中最亮的星' },
]

const aboutText =
  '一个闪闪发光的人类，喜欢听歌、摄影、编程、写作以及一切美好的食（事）物。树欲静而风不止，心欲静有叶婆娑，在人的一生中，风的催促下，对生活常意兴阑珊，这是源自太多的沉默与难言，还是因为太长的距离难传心意，我们不得而知。总之，亲爱的朋友，感谢你走进我内心的一角，祝你玩得开心。'

const heroSentence = '于乐的早安电台'
const heroLines: HeroChar[][][] = ['欢迎来到', '于乐的早安电台'].map((line) =>
  line.split(' ').map((word) =>
    [...word].map((char, index, chars): HeroChar => {
      if (char === ',') return { char, flair: 'clover' }
      if (index === chars.length - 1 && char === '.') return { char, flair: 'asterisk' }
      return { char }
    }),
  ),
)

const aboutChars = [...aboutText]
const contactChars = [...'想和我聊天吗？']
const latestPosts = ref<Post[]>([])

const pageRef = ref<HTMLElement | null>(null)

let mm: gsap.MatchMedia | undefined

onMounted(async () => {
  document.title = '于乐的早安电台'

  const page = pageRef.value
  if (!page) return

  mm = gsap.matchMedia()
  mm.add(
    '(prefers-reduced-motion: no-preference)',
    () => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })

      intro
        .from('.hero-char', {
          yPercent: 115,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.028 },
        })
        .from(
          '.hero-flair',
          {
            autoAlpha: 0,
            scale: 0.4,
            rotation: -140,
            duration: 0.8,
            ease: 'back.out(1.7)',
          },
          0.5,
        )
        .from('.hero-lead', { autoAlpha: 0, y: 14, duration: 0.6 }, 0.8)
        .from('.hero-cta', { autoAlpha: 0, y: 14, duration: 0.6 }, 0.95)

      gsap.fromTo(
        '.about-char',
        { autoAlpha: 0.15 },
        {
          autoAlpha: 1,
          ease: 'none',
          stagger: 0.06,
          scrollTrigger: {
            trigger: '.about-copy',
            start: 'top 85%',
            end: 'top 40%',
            scrub: true,
          },
        },
      )

      gsap.from('.contact-char', {
        yPercent: 115,
        duration: 0.9,
        stagger: 0.04,
        scrollTrigger: { trigger: '.contact-line', start: 'top 85%' },
      })
    },
    page,
  )

  const { posts } = await import('@/lib/posts')
  latestPosts.value = posts.slice(0, 3)
})

onBeforeUnmount(() => {
  mm?.revert()
})
</script>

<template>
  <main id="top" ref="pageRef">
    <section
      class="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pt-36 pb-16 sm:px-8"
    >
      <div class="w-full max-w-7xl">
        <h1
          :aria-label="heroSentence"
          class="w-full text-[1.75rem] leading-[1.05] font-semibold sm:text-[3rem] lg:text-[4.5rem] xl:text-[5.5rem] 2xl:text-[6.25rem]"
        >
          <span
            v-for="(line, lineIndex) in heroLines"
            :key="lineIndex"
            class="flex flex-wrap justify-center gap-x-[0.26em]"
          >
            <span v-for="(word, wordIndex) in line" :key="wordIndex" class="whitespace-nowrap">
              <template v-for="(item, charIndex) in word" :key="charIndex">
                <span
                  v-if="item.flair === 'clover'"
                  aria-hidden="true"
                  class="hero-flair ml-[0.03em] inline-block h-[0.36em] w-[0.36em] align-[-0.08em] text-brand"
                >
                  <svg viewBox="0 0 100 100" class="h-full w-full" fill="currentColor">
                    <rect x="6" y="6" width="44" height="44" rx="22" />
                    <rect x="50" y="6" width="44" height="44" rx="22" />
                    <rect x="6" y="50" width="44" height="44" rx="22" />
                    <rect x="50" y="50" width="44" height="44" rx="22" />
                  </svg>
                </span>
                <span
                  v-else-if="item.flair === 'asterisk'"
                  aria-hidden="true"
                  class="hero-flair ml-[0.05em] inline-block h-[0.55em] w-[0.55em] align-[-0.06em] text-brand"
                >
                  <svg
                    viewBox="0 0 100 100"
                    class="h-full w-full"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="16"
                    stroke-linecap="round"
                  >
                    <path d="M50 10v80" />
                    <path d="M15 30l70 40" />
                    <path d="M85 30L15 70" />
                  </svg>
                </span>
                <span
                  v-else
                  aria-hidden="true"
                  class="inline-block overflow-hidden pb-[0.12em] align-bottom"
                >
                  <span class="hero-char inline-block">{{ item.char }}</span>
                </span>
              </template>
            </span>
          </span>
        </h1>

        <p
          class="hero-lead mx-auto mt-8 max-w-[30em] text-center text-lg leading-relaxed text-muted-foreground"
        >
          从这里开始，一起构建美好的人生吧～
        </p>

        <div class="hero-cta mt-10 flex flex-wrap justify-center gap-3">
          <Button as-child>
            <RouterLink to="/blog">去博客玩</RouterLink>
          </Button>
          <Button as-child variant="outline">
            <a href="mailto:chat@yule.best">写封邮件</a>
          </Button>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-5xl px-5 sm:px-8">
      <section id="about" class="scroll-mt-20 border-t border-border/60 py-20 lg:py-28">
        <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20">
          <div>
            <h2 class="text-2xl font-semibold">关于</h2>
            <p class="about-copy mt-6 max-w-[46ch] text-xl leading-relaxed">
              <span v-for="(char, index) in aboutChars" :key="index" class="about-char">
                {{ char }}
              </span>
            </p>
          </div>
          <dl class="space-y-5 text-sm">
            <div
              v-for="fact in facts"
              :key="fact.label"
              class="flex flex-col gap-1 border-b border-border/60 pb-4"
            >
              <dt class="text-muted-foreground">{{ fact.label }}</dt>
              <dd class="text-foreground">{{ fact.value }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="posts" class="scroll-mt-20 border-t border-border/60 py-20 lg:py-28">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <h2 class="text-2xl font-semibold">文章</h2>
          <RouterLink
            to="/blog"
            class="text-sm text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            查看全部文章
          </RouterLink>
        </div>

        <ul class="mt-12">
          <li
            v-for="post in latestPosts"
            :key="post.path"
            class="group relative overflow-hidden border-t border-border/60 last:border-b"
          >
            <span
              aria-hidden="true"
              class="absolute inset-0 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <RouterLink
              :to="`/blog/${post.path}`"
              class="relative flex flex-col gap-3 px-1 py-8 transition-colors duration-300 group-hover:text-brand-ink sm:flex-row sm:items-baseline sm:justify-between sm:gap-12"
            >
              <span class="sm:flex sm:items-baseline sm:gap-10">
                <span class="text-xl font-medium whitespace-nowrap">{{ post.title }}</span>
                <span
                  class="mt-2 block max-w-[48ch] text-sm text-muted-foreground transition-colors duration-300 group-hover:text-brand-ink/80 sm:mt-0"
                >
                  {{ post.description }}
                </span>
              </span>
              <span
                class="flex shrink-0 items-center gap-6 font-mono text-xs text-muted-foreground transition-colors duration-300 group-hover:text-brand-ink/80"
              >
                <span>{{ post.category }}</span>
                <time :datetime="post.published">{{ post.published }}</time>
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section id="contact" class="scroll-mt-20 border-t border-border/60 py-20 lg:py-32">
        <h2 class="text-2xl font-semibold">联系</h2>
        <p class="contact-line mt-8 max-w-[20ch] text-4xl leading-tight font-medium sm:text-6xl">
          <span
            v-for="(char, index) in contactChars"
            :key="index"
            class="inline-block overflow-hidden pb-[0.08em] align-bottom"
          >
            <span class="contact-char inline-block">{{ char }}</span>
          </span>
        </p>
        <div class="mt-12 flex flex-wrap gap-3">
          <Button as-child>
            <a href="mailto:chat@yule.best">发邮件给我</a>
          </Button>
          <Button as-child variant="outline">
            <a href="https://github.com/YuleBest" target="_blank" rel="noreferrer">去我的 GitHub</a>
          </Button>
        </div>
      </section>
    </div>
  </main>
</template>
