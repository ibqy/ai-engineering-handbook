---
id: C01
title: 记忆与聊天历史有什么区别
category: memory
level: 基础
tags: [聊天历史, 分层记忆, 会话标识]
summary: 区分按时间记录的聊天历史与面向任务选择的信息，并识别示例项目的实际存储和召回边界。
updated: '2026-11-11'
order: 1
---

# 记忆与聊天历史有什么区别

## 直接回答

聊天历史回答“发生过什么”，通常按顺序保存消息；记忆回答“本次任务需要知道什么”，会筛选、归纳和召回信息。历史可以作为记忆的来源，但保存历史不等于模型每次都能看到它，生成摘要也不等于获得可靠事实。判断能力应以执行代码为准，而非类名或注释。

## 实际场景

用户先说“预算三千，只考虑可退款酒店”，下一轮问“第二家怎么样”。历史需要保留指代关系，长期记忆可记录经确认的偏好，但本次预算不宜直接变成永久偏好。若只保留回答结论，退款约束可能丢失；若每次灌入全部历史，过时信息又会占用窗口。

示例调用方每次提交都创建新的 taskId，并把它传给记忆门面的 sessionId 参数。因此同一用户再次提交任务，不会自动沿用上次短时历史；用户维度的长期召回不能替代连续多轮对话。

## 原理与取舍

短时存储的 Redis key 只有 sessionId，追加时刷新两小时有效期。recent 先读取整个列表，再在应用中返回末尾若干条；门面只取最近二十条。这里“短时”不是完整且永久的聊天档案，助手回答还会被截断为二百字符。

门面仅在回答长度大于五十字符时，把任务目标与截断二百字符的结论写入长期存储，并非完整事实提取。长期实现是进程内 ConcurrentHashMap 嵌套 ArrayList，内部列表并不线程安全，重启后数据丢失。召回按查询每隔两个字符取二字片段做包含判断，再限制条数，不是 embedding 或相关性排序。

## 实现示例

以下为未运行伪代码，是建议方案，不是项目已有接口：

```text
scope = authorize(tenantId, userId, conversationId)
appendOriginal(scope, messageId, role, content)
context = selectRecent(scope, historyBudget)
candidates = extractCandidateFacts(originalMessages)
rememberConfirmed(scope.user, candidates, sourceMessageIds)
run(taskId, context)
```

conversationId 应跨轮稳定，taskId 只标识一次执行。建议原始消息独立保存，派生记忆携带来源、有效期及确认状态；错误记忆可以回溯更正，而不是覆盖唯一证据。

## 常见坑

把“长期”理解为持久化，把注释中的“向量”理解为已经接入向量库，都会高估示例。相同 userId 下不同会话还可能共享长期候选，不能把会话私有事实无条件提升为用户事实。短时 key 未包含用户或租户，也不能单靠名称承担访问隔离。

## 验证清单

- 连续两次提交，核对 taskId 与实际 Redis key，确认是否读取了上一轮。
- 分别输入五十和五十一字符回答，检查长期写入边界及二百字符截断。
- 重启进程并测试并发读写，确认长期数据生命周期与列表安全性。
- 用同义表达、无关二字重合测试召回，分别统计漏召回和误召回。

## 关联项目与参考

以下链接对应已核对的执行代码；持久化、原始消息溯源与稳定会话标识均为改进建议。

- [短时存储与窗口](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/ShortTermMemory.java#L20-L45)
- [门面读取与写入](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/LayeredMemoryService.java#L46-L85)
- [长期存储与二字匹配](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/LongTermMemory.java#L30-L69)
- [任务标识传递](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/controller/AgentTaskService.java#L115-L165)
