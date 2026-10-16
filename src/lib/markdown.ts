import { Marked, type Renderer, type Token, type Tokens } from 'marked'

interface ReadmeContext {
  repo: string
  branch: string
}

function isRelative(url: string) {
  return !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)
}

export function renderReadme(markdown: string, context: ReadmeContext) {
  const instance = new Marked({ gfm: true })

  instance.use({
    walkTokens(token: Token) {
      if (token.type !== 'link' && token.type !== 'image') return
      if (!token.href || !isRelative(token.href)) return

      const path = token.href.replace(/^\.?\//, '')
      token.href =
        token.type === 'image'
          ? `https://raw.githubusercontent.com/${context.repo}/${context.branch}/${path}`
          : `https://github.com/${context.repo}/blob/${context.branch}/${path}`
    },
    renderer: {
      link(this: Renderer, token: Tokens.Link) {
        const text = this.parser.parseInline(token.tokens)
        const title = token.title ? ` title="${token.title}"` : ''
        const external = /^https?:/i.test(token.href) ? ' target="_blank" rel="noreferrer"' : ''
        return `<a href="${token.href}"${title}${external}>${text}</a>`
      },
    },
  })

  return instance.parse(markdown) as string
}
