# 按场景查问题

不必从第一篇读到最后一篇。先选眼前的症状，按照「定位 → 决策 → 验证」往下走。

## 我要做第一个 AI 应用

1. [M01 · 选择模型](./questions/models/model-selection.md)：先确定任务、预算与验收集。
2. [M02 · 输入输出契约](./questions/models/prompt-contract.md)：把模糊的指令变成可检查的约束。
3. [T01 · 谁执行工具](./questions/tools/tool-calling.md)：区分模型建议与业务代码执行。
4. [D01 · 离线与真实集成](./questions/production/offline-vs-live.md)：知道 Demo 通过证明了什么、没证明什么。

## 知识库明明有资料，回答还是不对

1. [R01 · 检索不到](./questions/rag/retrieval-miss.md)：查解析、索引、过滤条件与候选集。
2. [R02 · 分块](./questions/rag/chunking.md)：证据是否在切分时断开？
3. [R03 · 混合检索与重排](./questions/rag/hybrid-rerank.md)：改排序之前，先确认候选包含答案。
4. [E02 · 检索指标](./questions/evaluation/rag-metrics.md)：用标注查询集判断变化，而不是只试两句话。
5. [R04 · 索引一致性](./questions/rag/index-consistency.md)：如果答案过期，排查版本、删除和缓存。

## Agent 不停重试，或者把业务操作做了两遍

1. [A02 · 退出循环](./questions/agents/stop-loops.md)：设置步骤、时间、预算与无进展边界。
2. [T03 · 写操作幂等](./questions/tools/tool-idempotency.md)：先查执行结果，再决定是否重试。
3. [A03 · 检查点恢复](./questions/agents/checkpoint-resume.md)：恢复状态不等于撤销已执行的外部操作。
4. [S04 · 人工审批](./questions/security/human-approval.md)：审批绑定参数、操作者和有效期。

## 上下文越来越长，模型开始忘事或串话

1. [C01 · 记忆分层](./questions/memory/history-vs-memory.md)：分清原始记录、当前上下文与长期事实。
2. [C02 · Token 预算](./questions/memory/token-budget.md)：系统约束、工具、检索结果都要算进去。
3. [C03 · 摘要漂移](./questions/memory/summary-drift.md)：保留来源与关键事实，不让摘要成为新的事实源。
4. [C04 · 会话并发](./questions/memory/concurrent-conversations.md)：按会话序列化或使用版本冲突检测。

## 响应慢、费用高、遇到 429

1. [P01 · 拆分延迟](./questions/performance/latency.md)：首字、生成、检索和工具耗时分别看。
2. [P02 · 真实成本](./questions/performance/token-cost.md)：把重试、失败和子 Agent 一并计入。
3. [P03 · 缓存](./questions/performance/cache-isolation.md)：先有正确的权限与版本边界，再提高命中率。
4. [P04 · 限流与降级](./questions/performance/rate-limit-retry.md)：防止重试进一步放大拥塞。

## 要处理合同、表格、图片或语音

1. [V01 · OCR 还是视觉模型](./questions/multimodal/image-input.md)：按文字精确性、版面和图形推理需求选择。
2. [V02 · 文档表格保真](./questions/multimodal/document-tables.md)：保留页码、表头与跨页关系。
3. [V03 · 语音交互](./questions/multimodal/audio-stream.md)：取消必须贯穿识别、推理与播放。
4. [V04 · 多模态评测](./questions/multimodal/multimodal-evaluation.md)：困难样本单独分层，不拿干净截图代表真实资料。

## 准备接入公司数据并上线

1. [S02 · 租户与用户权限](./questions/security/tenant-authorization.md)：权限来自服务端身份，不来自模型和请求自报字段。
2. [S01 · 提示注入](./questions/security/prompt-injection.md)：检索内容与工具输出不应获得系统指令权限。
3. [S03 · 敏感信息](./questions/security/secrets-pii.md)：日志与测试集同样需要最小化和脱敏。
4. [D02 · 流式取消](./questions/production/stream-cancellation.md)：浏览器关了，不代表模型和工具停止了。
5. [D03 · 灰度与回滚](./questions/production/release-regression.md)：模型、提示词、索引都需要可追踪的版本。
6. [D04 · 上线验收](./questions/production/go-live-checklist.md)：检查失败、恢复、安全和预算，不只检查正常对话。

## 想判断一次改动到底有没有变好

1. [E01 · 分层评测](./questions/evaluation/evaluation-layers.md)：区分确定性逻辑与概率性生成。
2. [E03 · 模型裁判](./questions/evaluation/llm-judge.md)：用人工样本校准，防位置偏差与风格偏好。
3. [E04 · 执行轨迹](./questions/evaluation/trace-debugging.md)：从一次失败还原模型、检索与工具边界。
4. [A04 · 多 Agent 取舍](./questions/agents/multi-agent.md)：与单 Agent 基线做同题对照，而不是按角色数量判断先进性。
