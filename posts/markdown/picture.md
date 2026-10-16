---
title: 图片 - 于乐的 Markdown 教程
published: 2025-11-24
description: 介绍 Markdown 的图片语法
tags: [Markdown, 教程]
category: 于乐的 Markdown 教程
---

Markdown 支持图片语法。图片语法是 `![alt](url)`，其中 `alt` 是图片的替代文本，`url` 是图片的 URL。

替代文本在图片无法显示时会替代图片进行显示，替代文本不是必须的，可以留空。

URL 可以是本地路径或网络路径。路径支持相对路径和绝对路径，文档自身用 `.` 来表示。

如果想让多张图片并排显示，可以在一行里写多个图片，中间用空格隔开：`![alt1](url1) ![alt2](url2) ![alt3](url3)`

## 参考图片

和[链接](./link)一样，图片也支持参考图片：

```md
![alt][id]

[id]: url
```

## 特性

### 图片链接

如果想给图片添加链接，可以在外层嵌套一个链接格式：

```md
[![alt](url)](link)
```

### 图片格式

Markdown 本身不限制图片的格式，这取决于渲染的环境。但如果想尽量在所有平台都可以展示，建议你使用 JPEG(JPG)、PNG 或 GIF 格式。
