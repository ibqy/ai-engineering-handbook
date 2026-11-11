# AI 开发场景问答手册

面向 Java 后端与 AI 应用开发的中文工程问答。不是背术语的题库：每篇从真实问题出发，给出判断、方案取舍、实现示例、踩坑和验证清单。

**[在线阅读](https://ibqy.github.io/ai-engineering-handbook/) · [按场景查](docs/scenarios.md) · [项目对照](docs/projects.md) · [如何补充](docs/guide/contributing.md)**

## 分类目录

首版 10 个主题、40 篇问答；后续持续补充，一篇一文件。GitHub 上直接打开下列目录即可阅读，阅读站另外提供中文全文搜索、主题与难度筛选。

| 主题 | 基础与高阶场景 |
| --- | --- |
| [模型与提示词](docs/questions/models/) | 选模型、提示词契约、结构化输出、RAG 与微调 |
| [RAG 与知识检索](docs/questions/rag/) | 检索不到、分块、混合检索、索引更新删除 |
| [工具调用与 MCP](docs/questions/tools/) | 谁执行工具、协议边界、幂等、工具误选 |
| [Agent 与工作流](docs/questions/agents/) | 确定性工作流、死循环、恢复、多 Agent 取舍 |
| [记忆与上下文](docs/questions/memory/) | 历史与记忆、Token 预算、摘要漂移、会话并发 |
| [多模态](docs/questions/multimodal/) | OCR 与视觉、PDF 表格、语音打断、多模态评测 |
| [评测与排障](docs/questions/evaluation/) | 分层测试、检索指标、模型裁判、执行轨迹 |
| [性能与成本](docs/questions/performance/) | 首字延迟、费用归因、缓存、限流与重试 |
| [安全与权限](docs/questions/security/) | 提示注入、租户权限、敏感信息、人工审批 |
| [生产部署](docs/questions/production/) | 离线与真实集成、SSE 取消、灰度回滚、上线验收 |

## 和已有仓库的关系

手册按「问题」组织，现有[学习路线](https://ibqy.github.io/curriculum)按「课程」组织。文章关联 Spring AI、Spring AI Alibaba、Semantic Kernel、AgentScope、LangGraph4j、Graph、RAG 混合检索、多 Agent 编排与 AI 平台等教学项目，不重复复制整套课程。

明确区分教学模拟、通用设计和已存在的源码。代码能运行不等于已完成生产认证；离线测试不等于外部模型或数据库已联调。详情见[阅读边界](docs/guide/start.md)。

## 本地阅读与验证

```bash
npm ci
npm run dev
```

```bash
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

要求 Node.js 22+。不需要模型 API Key、数据库或 Java 环境。Pages 只托管静态内容。

## 持续维护

- 新问题：通过 Issue 模板记录实际场景，勿上传密钥和公司原始数据。
- 新文章：在 `docs/questions/<分类>/` 添加带元数据的 Markdown，目录和搜索自动收录。
- 修正文档：文章底部提供 GitHub 编辑入口；PR 自动校验，合入 `main` 后自动发布。
- 版本复现：引用默认指向关联仓库 `main`，复现实验时自行锁定 commit、模型及数据版本。

具体字段、章节和校验命令见[持续补充指南](docs/guide/contributing.md)。
