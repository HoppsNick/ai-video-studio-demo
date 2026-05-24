# AI Video Studio Demo

这是一个本地 AI 视频生产实验项目，包含素材下载、旁白测试、Remotion 视频生成、剪映/Jianying 草稿构建脚本，以及一个静态 demo 网站。

## Demo 网站

打开 `demo-site/index.html` 可以预览当前项目的展示页。页面会引用仓库里的 Remotion 成片、预览图和素材文件。

## 主要目录

- `demo-site/`：项目展示网站
- `productions/remotion-product-intro/`：Remotion 产品介绍视频工程
- `productions/interstellar-higher-self/`：叙事短片制作计划、镜头方案、音频和素材
- `skills/`：本地自动化技能与脚本资料

## 常用命令

在 `productions/remotion-product-intro/` 目录下：

```bash
npm run start
npm run still
npm run render
```

本仓库默认不提交 `node_modules/` 和本地 `.env.local` 等密钥文件。
