# 关联项目与能力边界

手册回答横跨框架的工程问题；已有仓库负责演示具体实现。这里是选读地图，不是生产能力认证，也不代表这些仓库在同一个依赖版本上。

## AI 框架入门与对照

| 项目 | 适合对照的问题 | 阅读时注意 |
| --- | --- | --- |
| [Spring AI 教学实战](https://github.com/ibqy/spring-ai-teaching-demo) | 模型调用、结构化输出、Tool、RAG、MCP、Token 计量 | 工具数据和向量存储有教学简化；真实模型调用需自行配置 |
| [Spring AI Alibaba 教学](https://github.com/ibqy/spring-ai-alibaba-teaching-demo) | DashScope、会话、知识型客服 | 需区分真实模型服务与内存会话、示例业务数据 |
| [Semantic Kernel Java](https://github.com/ibqy/semantic-kernel-java-teaching-demo) | 插件、聊天历史、框架职责对照 | 内存会话和向量存储不等于持久化方案 |
| [AgentScope Java](https://github.com/ibqy/agentscope-java-teaching-demo) | 多智能体、记忆、工具与事件 | 不同示例采用不同简化策略；词法检索不能当成 embedding 效果证明 |

## 图编排与复杂 Agent

| 项目 | 适合对照的问题 | 阅读时注意 |
| --- | --- | --- |
| [Spring AI Alibaba Graph](https://github.com/ibqy/spring-ai-alibaba-graph-demo) | 状态、条件边、并行、检查点、审批 | 默认离线业务数据；进程内检查点不是跨重启恢复 |
| [LangGraph4j](https://github.com/ibqy/langgraph4j-teaching-demo) | 原生图执行、恢复、SSE 生命周期 | 图引擎真实运行；MemorySaver 与外部业务模拟需要单独理解 |
| [复杂 Agent 编排](https://github.com/ibqy/agent-orchestration-demo) | Planner/Worker/Reviewer、记忆、工具防护 | 有状态机与快照逻辑，但多实例审批、工具版本与任务总线仍需补齐 |

## RAG 与 AI 平台工程

| 项目 | 适合对照的问题 | 阅读时注意 |
| --- | --- | --- |
| [RAG 高阶混合检索](https://github.com/ibqy/rag-hybrid-search-demo) | RRF、检索评测、分块、索引一致性 | 离线消融是合成排名实验；上传未入索引、Rerank 未接入问答、问答未做租户过滤 |
| [AI 平台中台](https://github.com/ibqy/ai-platform-demo) | 路由、缓存、配额、Token 成本、管道顺序 | 示例鉴权不是生产身份认证；缓存与任务为内存实现；正则不能保证防提示注入 |

## 怎么交叉阅读

- 先选基础框架：从 Spring AI 读懂模型、工具与记忆接口，不需要四套框架全学完再动手。
- 再比较执行模型：同一审批场景，比较普通服务代码、StateGraph、LangGraph4j 与多 Agent 各自解决什么。
- 最后做工程验收：用手册的验证清单检查隔离、重试、取消、成本、评测与发布。

[完整学习路线](https://ibqy.github.io/curriculum)仍按课程先后组织；这本手册按问题组织。两者互补，不把问答手册计作又一个必须学习的框架。

## 引用会变化，结论要有适用范围

文章链接到仓库的 `main` 以方便继续阅读；仓库后续更新可能改变实现。复现时记录对应 commit、依赖版本、模型标识、数据集和运行配置；若发现文章与源码不一致，使用页面底部「在 GitHub 补充或纠错」。

对尚无直接实现的主题（例如完整语音实时系统），文章会标为通用设计，不能通过关联仓库的一个流式示例推导出整套功能已实现。
