---
title: 通过 Cloudflare Workers 部署获取 Bing 每日壁纸的 API
published: 2025-11-23
description: 介绍如何通过 Cloudflare Workers 来部署一个获取 Bing 每日壁纸的 API 接口
tags: [API, 后端, Cloudflare]
category: 笔记
image: https://image.yule.ink/blog/bing_wallpaper-homepage.png
---

Bing 每日壁纸是指微软 Bing 官网展示的壁纸，每天会进行更换，官方 API 接口 `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1` 响应的数据是 JSON 格式，我们的目标是提取出 `images[0].urlbase` 字段，经过处理后返回给用户。

<!-- more -->

实现这个目标有几种方式：

- 使用自己的服务器
- 使用 Cloudflare Workers

在这里分享使用 Cloudflare Workers 的实现方式，代码可以直接套用到你的服务器里。

## 原理

Bing 每日壁纸的 API 接口：`https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1`

这里的 `idx` 参数表示返回的图片的索引（`0` 为今天），`n` 参数表示返回的图片数量。

它返回的是一个 JSON 格式的数据，其中 `images[0].urlbase` 字段就是我们要的壁纸地址的前缀：

```json 8
{
  "images": [
    {
      "startdate": "20251122",
      "fullstartdate": "202511221600",
      "enddate": "20251123",
      "url": "/th?id=OHR.MadgascarAmmonite_ZH-CN6497276091_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp",
      "urlbase": "/th?id=OHR.MadgascarAmmonite_ZH-CN6497276091",
      "copyright": "马达加斯加菊石化石 (© ThomasLENNE/Shutterstock)",
      "copyrightlink": "https://www.bing.com/search?q=%E6%96%90%E6%B3%A2%E9%82%A3%E5%A5%91%E6%95%B0%E5%88%97&form=hpcapt&mkt=zh-cn",
      "title": "大自然的秘密代码",
      "quiz": "/search?q=Bing+homepage+quiz&filters=WQOskey:%22HPQuiz_20251122_MadgascarAmmonite%22&FORM=HPQUIZ",
      "wp": true,
      "hsh": "d34f4440180b71821b622b227a7183a3",
      "drk": 1,
      "top": 1,
      "bot": 1,
      "hs": []
    }
  ],
  "tooltips": {
    "loading": "正在加载...",
    "previous": "上一个图像",
    "next": "下一个图像",
    "walle": "此图片不能下载用作壁纸。",
    "walls": "下载今日美图。仅限用作桌面壁纸。"
  }
}
```

## Cloudflare Workers

首先，前往 Cloudflare 新建一个 Worker，选择「从 Hello World 开始」，然后把默认代码换成下面的代码：

```js title=workers.js
export default {
  async fetch(request) {
    try {
      const bingApi = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
      const res = await fetch(bingApi)
      if (!res.ok) {
        throw new Error('Bing API error')
      }

      const data = await res.json()
      const imgUrlBase = data.images[0].urlbase
      const imgUrl = `https://www.bing.com${imgUrlBase}_1920x1080.jpg`

      // 读取图片二进制
      const imgRes = await fetch(imgUrl)
      if (!imgRes.ok) {
        throw new Error('Failed to download image')
      }

      const imgArrayBuffer = await imgRes.arrayBuffer()

      // 返回图片二进制
      return new Response(imgArrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    } catch (err) {
      return new Response('Failed to fetch Bing image: ' + err.message, {
        status: 500,
      })
    }
  },
}
```

然后点击「部署」，复制 Worker 的 URL 即可，你也可以自己绑定域名。

前端直接使用此 URL 即可，例如：

```html
<img src="https://your-worker-url" alt="Bing Wallpaper" />
```
