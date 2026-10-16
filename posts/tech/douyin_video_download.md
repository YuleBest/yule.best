---
title: 抖音视频解析：原理与实现
published: 2026-01-20
description: 介绍如何解析抖音视频链接并下载视频
tags: [脚本, 逆向分析]
category: 笔记
---

### 1. 提取短链接

用户输入的分享内容往往是一段文字里包含一个短链接，把这个短链接精准提取出来，方便后续操作。

### 2. 访问短链接获取重定向后的页面

抖音短链接是“入口”，访问它后会被跳转到真正的视频页面。
用 curl 请求短链接，携带手机浏览器的 User-Agent，模仿真实设备访问，用 `-L` 让 curl 跟随重定向，获取最终页面内容。

```bash
# 提纯分享文本中的短链接
get_short_url() {
    local raw_input_text="$1"
    echo "$raw_input_text" | grep -oE 'https://v\.douyin\.com/\S+' | head -n1
}

# 获取短链接的响应结果
fetch_html() {
    local url="$1"
    local user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    curl -sL -A "\'$user_agent\'" "$url"
}
```

### 3. 解析页面提取视频关键信息

页面内容是一个巨大的 HTML 和 JSON 混合体，脚本用简单的正则 grep 和 sed 抓取：

- `︎video_id`：下载视频的唯一标识
- `nickname`：作者昵称，用作文件名
- ︎`create_time`：发布时间的 **时间戳**

```bash
extract_video_details() {
    local html="$1"
    video_id=$(echo "$html" | grep -oE 'video_id=[a-zA-Z0-9]+' | sed 's/video_id=//' | head -n1)
    nickname=$(echo "$html" | grep -oE '"nickname":"[^"]+"' | sed 's/.*"nickname":"\([^"]*\)".*/\1/' | head -n1)
    create_ts=$(echo "$html" | grep -oE '"create_time":[0-9]+' | sed 's/.*"create_time"://' | head -n1)
}
```

### 4. 校验数据有效性

如果关键数据没提取到，说明链接*可能*无效，或者是图集、动态照片这种特殊类型，脚本直接报错退出（实际上图集和动态照片也可以下载，先偷个懒吧）。

```bash
check_video_details() {
    if [[ -z "$video_id" || -z "$nickname" || -z "$create_ts" ]]; then
        echo -e "\n${re}[!] video_id 或 nickname 或 create_time 提取失败${res}"
        exit 1
    fi

    if [[ ! -z $(echo "$video_id" | grep -o "http") ]]; then
        echo -e "\n${re}[!] 作品可能是一个图集或动态照片，暂无法下载，敬请期待${res}"
        exit 1
    fi
}
```

### 5. 格式化发布时间

时间戳是秒级的数字，脚本用 date -d @timestamp 把它转换成形如 YYYYMMDD-HHMMSS 的格式，方便写入文件名。

### 6. 处理昵称中的特殊字符

文件名不能包含 `\/:*?"<>|` 等符号，脚本用 tr -d 把昵称里的非法字符删除，防止文件保存失败。

```bash
# 发布时间的时间戳转时间
format_create_time() {
    date -d @"$create_ts" +"%Y%m%d-%H%M%S"
}

# 避免昵称中含有特殊符号
sanitize_nickname() {
    echo "$nickname" | tr -d '\/:*?"<>|'
}
```

### 7. 构造视频真实下载链接

抖音视频真实下载链接是固定格式：`https://www.iesdouyin.com/aweme/v1/play/?video_id=${video_id}&ratio=1080p&line=0`，脚本用之前提取的 video_id 拼接出完整 URL。

### 8. 下载视频

用 curl 下载视频文件到本地，文件名是：`抖音_作者昵称_发布时间.mp4`，下载完成后提示成功，失败则提示错误。

```bash
# 构造下载链接
construct_video_url() {
    echo "https://www.iesdouyin.com/aweme/v1/play/?video_id=${video_id}&ratio=1080p&line=0"
}

# 下载视频
download_video() {
    local video_url="$1"
    local save_path="$2"
    echo -e "\n[*] 正在下载视频..."
    if curl -s -L -o "$save_path" "$video_url"; then
        echo -e "${gr}[✓] 下载成功：$save_path${res}"
    else
        echo -e "${re}[!] 下载失败${res}"
    fi
}
```

### bash 实现的完整代码

```bash
#!/bin/bash

# 定义下载目录路径
def_path() {
    script_dir="$(dirname $(readlink -f $0))"
    file_name="抖音_${safe_nickname}_${create_time}.mp4"
    save_path="/storage/emulated/0/Download/抖音视频/$file_name"
}

# 定义颜色变量
gr='\033[0;32m'
ye='\033[1;33m'
re='\033[0;31m'
bl='\033[0;36m'
res='\033[0m'

# 提纯分享文本中的短链接
get_short_url() {
    local raw_input_text="$1"
    echo "$raw_input_text" | grep -oE 'https://v\.douyin\.com/\S+' | head -n1
}

# 获取短链接的响应结果
fetch_html() {
    local url="$1"
    local user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    curl -sL -A "\'$user_agent\'" "$url"
}

# 提取视频信息
extract_video_details() {
    local html="$1"
    video_id=$(echo "$html" | grep -oE 'video_id=[a-zA-Z0-9]+' | sed 's/video_id=//' | head -n1)
    nickname=$(echo "$html" | grep -oE '"nickname":"[^"]+"' | sed 's/.*"nickname":"\([^"]*\)".*/\1/' | head -n1)
    create_ts=$(echo "$html" | grep -oE '"create_time":[0-9]+' | sed 's/.*"create_time"://' | head -n1)
}

# 错误检查
check_video_details() {
    if [[ -z "$video_id" || -z "$nickname" || -z "$create_ts" ]]; then
        echo -e "\n${re}[!] video_id 或 nickname 或 create_time 提取失败${res}"
        exit 1
    fi

    if [[ ! -z $(echo "$video_id" | grep -o "http") ]]; then
        echo -e "\n${re}[!] 作品可能是一个图集或动态照片，暂无法下载，敬请期待${res}"
        exit 1
    fi
}

# 发布时间的时间戳转时间
format_create_time() {
    date -d @"$create_ts" +"%Y%m%d-%H%M%S"
}

# 避免昵称中含有特殊符号
sanitize_nickname() {
    echo "$nickname" | tr -d '\/:*?"<>|'
}

# 构造下载链接
construct_video_url() {
    echo "https://www.iesdouyin.com/aweme/v1/play/?video_id=${video_id}&ratio=1080p&line=0"
}

# 下载视频
download_video() {
    local video_url="$1"
    local save_path="$2"
    echo -e "\n[*] 正在下载视频..."
    if curl -s -L -o "$save_path" "$video_url"; then
        echo -e "${gr}[✓] 下载成功：$save_path${res}"
    else
        echo -e "${re}[!] 下载失败${res}"
    fi
}

main() {
    echo -e -n "${ye}[>] 请输入抖音分享内容（链接或分享文本）：${res}"
    read -r raw_input_text
    short_url=$(get_short_url "$raw_input_text")

    if [[ -z "$short_url" ]]; then
        echo -e "\n${re}[!] 未识别出有效的抖音短链接${res}"
        exit 1
    fi

    echo -e "\n[*] 识别到抖音短链接：$short_url"
    echo -e "[*] 获取重定向页面..."

    html=$(fetch_html "$short_url")
    extract_video_details "$html"
    check_video_details

    create_time=$(format_create_time)
    safe_nickname=$(sanitize_nickname)
    video_url=$(construct_video_url)

    def_path
    echo -e "\n[*] 视频ID：$video_id"
    echo -e "[*] 作者昵称：$nickname"
    echo -e "[*] 发布时间：$create_time"
    echo -e "[*] 视频直链：$video_url"

    download_video "$video_url" "$save_path"
}

clear
main
```

### JS 实现

使用大善人 Cloudflare 的 Worker 功能来实现后端 API，例如这样：[dydown.js](https://github.com/YuleBest/xiaoyu-toolbox/blob/main/src/back-end/cf-workers/dydown.js)

使用 Vue 3 制作的示例页面：[小于工具箱](https://tool.yule.ink/dydown)
