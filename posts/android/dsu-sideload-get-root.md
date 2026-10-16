---
title: ROOT 教程，但无需刷机包和 TWRP
published: 2026-08-29
description: 通过 DSU 侧载获取设备的镜像并 Root
tags: [安卓, 刷机, DSU, Root]
category: 笔记
---

> 这是一篇适用于**无法获取刷机包**且**没有 TWRP 适配**的机型的 ROOT 教程，前提有两个：
>
> - 解锁 BL
> - 安卓版本为安卓 10 或以上

## 备份

虽然以下的操作不需要清除设备数据，但还是请备份好你的所有重要资料，避免意外情况发生。

## 下载

1. 打开[网盘链接](https://www.cjjd19.com/s/iBeVVv-jmhV.html)下载安装 `DSU Sideload` 和 `Treble Check`

2. 打开 Treble Check，检查你的 CPU 体系架构与 Project Treble 支持情况

3. 下载适合你的 GSI，比较推荐 [Sourceforge](https://sourceforge.net/projects/andyyan-gsi/files)

怎么选择适合你的呢？我们先看看文件的命名：

- `a64/arm64`：指的就是你的 CPU 架构

- `v/g`：即 **V**anilla 或 **G**oogle，`v` 表示没有自带谷歌框架，`g` 表示预置了谷歌框架，取决于你的个人爱好

- `S/N`：即 **S**uperSU 或 **N**oSuperSU，我们需要超级用户权限，所以选 `S` 的

- `vndklite`：`vndklite` 适用于 `VNDKLite` 设备或非 `VNDKLite` 设备上的可读写系统，我的设备支持 Project Treble，所以选择带 `vndklite` 的，如果不支持 Project Treble，应选择不带的

## 安装

1. 打开 DSU Sideload，点击 设定 - 新建文件夹 - 随便命名 - 允许 - 继续

2. 在软件中设定好镜像路径、空间大小（最低 5GB）后点击安装，等待进度条跑完

3. 将手机打开 USB 调试，连接电脑，手机允许调试，电脑打开 [adb 终端](https://mrzzoxo.lanzoue.com/b02plghuh)，输入以下命令后按回车：

   ```shell
   adb shell sh "/storage/emulated/0/Android/data/vegabobo.dsusideloader/files/install"
   ```

   返回 `DSU installation activity has been started!` 就是安装成功了

## 提取 `boot/init_boot`

1. 等待几秒钟，点击通知中的重启进入 GSI（如果卡 Fastboot，说明你配置有误或者你的手机不支持 GSI，直接长按电源键重启后舍弃即可）

2. 重启到 GSI 后，使用数据线连接电脑，电脑打开 adb 终端

3. 首先执行

   ```shell
   adb shell
   ```

   进入手机的 adb 终端，然后执行

   ```shell
   su
   ```

   获取 shell 的 root 权限

4. 使用

   ```shell
   cd /dev/block/bootdevice/by-name
   ```

   跳转到镜像目录，然后使用

   ```shell
   ls -l
   ```

   列出目录下的文件，我们只需要留意其中的 `boot/init_boot` 地址即可，我这里的地址是 `/dev/block/sde14`

5. 接着，我们执行

   ```shell
   dd if=<地址> of=/sdcard/<镜像名称>
   ```

   即可把镜像复制到 `sdcard/` 下，执行

   ```shell
   adb pull /sdcard/<镜像名> <要复制到的文件夹路径>
   ```

   把镜像复制到电脑上

6. 重启返回原系统

## 获取 Root

目前，我们已经成功获取到了手机的 `boot/init_boot` 镜像，可以使用[我的教程](https://www.coolapk.com/feed/57221213?shareKey=ODgyYzI3Y2VmZWExNjY4YTg3ZmM~&shareUid=18214705&shareFrom=com.coolapk.market_14.2.3)中的第二步进行修补，获得 Root 啦～
