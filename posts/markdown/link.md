---
title: 链接 - 于乐的 Markdown 教程
published: 2025-11-24
description: 介绍 Markdown 的链接语法
tags: [Markdown, 教程]
category: 于乐的 Markdown 教程
---

Markdown 支持行内链接与参考链接。不管是哪一种，链接的文字都是用 `[方括号]` 来标记。

## 行内链接

行内链接的语法是：`[链接文本](链接地址)`。这里的「链接文本」是展示给读者看的，而「链接地址」是点击链接后跳转的地址：

- Markdown

```md
全球最大的搜索引擎是 [Google](https://www.google.com) 搜索。
```

- 渲染效果

全球最大的搜索引擎是 [Google](https://www.google.com) 搜索。

### 自动链接

你可以使用 `<链接地址>` 来创建自动链接，Markdown 会自动将 `<链接地址>` 转换为 `[链接地址](链接地址)`：

- Markdown

```md
<https://www.google.com>
```

- 渲染效果

<https://www.google.com>

## 参考链接

参考链接的语法是：

```md
[链接文本]

[链接文本]: 链接地址
```

- Markdown

```md
我们使用了 [Google] 提供的服务

[Google]: https://www.google.com
```

- 渲染效果

我们使用了 [Google] 提供的服务

[Google]: https://www.google.com

你也可以使用：

```md
[链接文本][id]

[id]: 链接地址
```

- Markdown

```md
主流的搜索引擎有 [Google][1]、[Baidu][2]、[Bing][3]。

[1]: https://www.google.com
[2]: https://www.baidu.com
[3]: https://www.bing.com
```

- 渲染效果

主流的搜索引擎有 [Google][1]、[Baidu][2]、[Bing][3]。

[1]: https://www.google.com
[2]: https://www.baidu.com
[3]: https://www.bing.com

参考链接的意义在于易读性，当读者直接阅读你的 Markdown 源文件时，他不会在行内看到一长串链接而被打乱阅读节奏。

## 本地链接

本地链接指的是链接地址指向本地资源，这里的「本地资源」常用的有两种：文档章节和文档。

> 章节
> 指的是通过[标题语法](./title)进行标记的标题开头

### 文档章节

你可以使用 `[链接文本](#章节名称)` 来创建一个指向当前文档的章节的链接，此链接会跳转到该章节。

- Markdown

```md
[本地链接](#本地链接)
```

- 渲染效果

[本地链接](#本地链接)

## 文档

你可以使用 `[链接文本](文档路径)` 来创建一个指向其他文档的链接，此链接会跳转到该文档。

- Markdown

```md
[链接 - 链接语法](./link.md)
```

- 渲染效果

[链接 - 链接语法](./link)

你也可以使用文档和章节的组合，例如 `./link.md#本地链接`，这会跳转到该文档的指定章节。
