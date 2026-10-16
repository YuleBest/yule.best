import { gsap } from 'gsap'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

// 移动端地址栏收起/展开会触发 viewport 高度变化，别让它反复 refresh
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollSmoother, ScrollTrigger }
