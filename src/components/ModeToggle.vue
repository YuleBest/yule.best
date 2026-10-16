<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Moon, Sun } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const mode = useColorMode()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="relative text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
      >
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">切换主题</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="mode = 'light'">浅色</DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'dark'">深色</DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'auto'">跟随系统</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
