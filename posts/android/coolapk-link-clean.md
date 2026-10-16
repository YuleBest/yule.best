---
title: 跳过酷安链接中间页
published: 2026-03-31
description: 介绍如何跳过酷安链接中间页
tags: [安卓, 酷安]
category: 笔记
---

众所周知，酷安会给每个链接加上 `https://www.coolapk.com/link/` 前缀，以跳转到中间页，但是这很烦人，所以我们需要去掉这个前缀。

<!-- more -->

使用以下油猴脚本即可：

```javascript
// ==UserScript==
// @name         酷安链接自动跳转
// @namespace    https://github.com/YuleBest
// @version      0.2
// @description  自动跳过酷安的中间链接页面，并保留目标页在历史记录中
// @author       Yule
// @match        *://www.coolapk.com/link?url=*
// @grant        none
// @run-at       document-start
// ==/UserScript==

;(function () {
  'use strict'

  const urlParams = new URLSearchParams(window.location.search)
  const targetUrl = urlParams.get('url')

  if (targetUrl) {
    // 使用 href 赋值，这样目标页面会被推入历史记录
    window.location.href = decodeURIComponent(targetUrl)
  }
})()
```
