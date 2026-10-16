---
title: 代码 - 于乐的 Markdown 教程
published: 2025-11-24
description: 介绍 Markdown 的代码语法
tags: [Markdown, 教程]
category: 于乐的 Markdown 教程
---

Markdown 支持行内代码和代码块。

## 行内代码

行内代码的语法是在代码前后插入反引号 `` ` ``：

- Markdown

```md
`code in line`
```

- 渲染效果

`code in line`

## 代码块

代码块的语法是在代码前后一行插入三个反引号 ` ``` `：

- Markdown

```md

```

this
is a
code block

```

```

- 渲染效果

```
this
is a
code block
```

如果你的渲染器是带高亮器功能的（如：Typora、GitHub、VuePress 等），你可以在第一行的反引号后加上语言名称或后缀，这样代码块会根据语言进行语法高亮：

- Markdown

````md
```bash
a=520
b=1314

echo "hello world"

if [ $a -gt $b ]; then
    echo "$a is greater than $b"
else
    echo "$a is not greater than $b"
fi
```
````

````

- 渲染效果

```bash
a=520
b=1314

echo "hello world"

if [ $a -gt $b ]; then
    echo "$a is greater than $b"
else
    echo "$a is not greater than $b"
fi
````

## 代码块的嵌套

如果你想在一个代码块内嵌套另一个代码块，则你需要在外层的代码块的反引号中多加一个反引号：

- Markdown

`````md
````md
```bash
a=520
b=1314

echo "hello world"

if [ $a -gt $b ]; then
    echo "$a is greater than $b"
else
    echo "$a is not greater than $b"
fi
```
````
`````

````
```

- 渲染效果

```md
```bash
a=520
b=1314

echo "hello world"

if [ $a -gt $b ]; then
    echo "$a is greater than $b"
else
    echo "$a is not greater than $b"
fi
```
```
````
