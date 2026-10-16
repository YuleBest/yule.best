---
title: CSS 伪元素介绍
published: 2025-11-23
description: 介绍了 CSS 中的伪元素概念
tags: [前端, CSS, 伪元素]
category: 笔记
---

在前端开发中，有一个原则至关重要：结构与样式分离。我们希望 HTML 代码保持干净、语义化，而不被大量的装饰性 `<div>` 或 `<span>` 标签所污染。

这时候，CSS 伪元素 _(Pseudo-elements)_ 就派上用场了。它们就像是隐藏在 CSS 中的「幽灵元素」，不仅能帮你保持 HTML 的整洁，还能创造出令人惊叹的视觉效果。

<!-- more -->

## 什么是伪元素

简单来说，伪元素允许你对被选择元素的特定部分进行样式设置，或者在元素内容的前后插入虚拟内容。

它们之所以叫「伪」元素，是因为它们并不存在于 HTML 文档树 _(DOM)_ 中，你无法用 JavaScript 直接像操作普通 DOM 节点那样操作它们，但它们在页面上却是实实在在可见的。

## `::before` 和 `::after`

这是使用频率最高的两个伪元素。它们分别在元素内容的最前面和最后面插入内容。

**核心规则：`content` 属性**

使用这两个伪元素时，有一个绝对不能忘记的规则：必须配合 `content` 属性使用（哪怕是空字符串 `content: "";`）。如果省略 `content`，伪元素将不会显示。

### 实战案例：给标题添加装饰线

不想在 HTML 里加额外的标签来实现标题两边的横线？伪元素是最好的选择。

```css
h2.title {
  text-align: center;
  position: relative;
}

h2.title::before,
h2.title::after {
  content: ''; /* 必须有 */
  display: inline-block;
  width: 50px;
  height: 2px;
  background-color: #333;
  vertical-align: middle;
  margin: 0 10px; /* 与文字保持距离 */
}
```

## 其他好用的伪元素

除了 `::before` 和 `::after`，CSS 还提供了一系列针对特定文本部分的伪元素：

1. `::first-letter` (首字下沉)

想做像报纸一样的首字下沉效果？不需要把第一个字包在 `<span>` 里。

```css
p.intro::first-letter {
  font-size: 3em;
  font-weight: bold;
  color: #e74c3c;
  float: left;
  line-height: 1;
  margin-right: 10px;
}
```

2. `::first-line` (首行样式)

无论窗口宽度如何变化，它永远只选中段落的第一行。

```css
p::first-line {
  font-weight: bold;
  text-transform: uppercase;
}
```

3. `::selection` (自定义选中文本)

默认的蓝色背景选中效果太枯燥？你可以自定义用户选中文字时的颜色，提升品牌感。

```css
::selection {
  background-color: #f1c40f; /* 黄色背景 */
  color: #000; /* 黑色文字 */
}
```

4. `::placeholder` (输入框占位符)

美化表单时，控制 `input` 里的提示文字样式。

```css
input::placeholder {
  color: #999;
  font-style: italic;
}
```

## 进阶技巧与注意事项

### 利用 attr() 获取数据

伪元素的 content 属性非常强大，它可以读取 HTML 标签上的属性值。这在制作纯 CSS Tooltip 时非常有用。

HTML:

```html
<button data-tooltip="点击保存文件">保存</button>
```

CSS:

```css
button:hover::after {
  content: attr(data-tooltip); /* 读取 data-tooltip 的值 */
  position: absolute;
  background: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  top: -30px;
  left: 0;
}
```

## 总结

CSS 伪元素是前端开发者的「瑞士军刀」，熟练掌握它们，不仅能让你写出更优雅的 CSS 代码，还能在不增加 HTML 负担的情况下，极大地丰富网页的视觉表现力。

下次当你想要添加一个装饰性的小图标或线条时，先别急着写 `<div>`，试着问问自己：「我可以用 `::before` 来实现吗？」
