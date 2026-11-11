---
id: C04
title: 多会话并发怎样避免串话和覆盖
category: memory
level: 高阶
tags: [并发控制, 会话隔离, 乐观锁]
summary: 区分用户限流、会话隔离与一致性控制，结合实际存储边界说明队列和版本校验的适用位置。
updated: '2026-11-11'
order: 4
---

# 多会话并发怎样避免串话和覆盖

## 直接回答

避免串话靠身份校验与数据作用域，避免覆盖靠同一会话内的写入顺序和冲突检测。用户并发槽位只控制任务数量，不是会话锁、认证或租户隔离。建议分别设计用户、租户、会话和任务标识，并让所有读取、追加、摘要更新都遵守相同边界。

## 实际场景

同一用户打开两个窗口，一个讨论合同，一个讨论旅行；只按用户保存短时记录会混入无关上下文。同一会话同时提交“改到周五”和“改到周六”，两个任务若基于旧状态各自生成摘要，后完成者可能覆盖先完成者的新信息。隔离不同会话与协调同一会话是两类问题，不能只靠增加线程解决。

## 原理与取舍

示例短时 Redis key 是 agent:short:%s，仅包含 sessionId。调用方却在每次提交时新建 taskId，并将其作为 sessionId 传入门面；这通常把不同任务分开，但不自动延续多轮会话，也没有把租户和用户绑定进 key。新增稳定会话标识时必须同时校验归属，不能直接信任客户端参数。

单次 Redis 追加不代表整轮更新原子化。门面分两次追加用户目标和助手结论；若未来复用会话并发执行，两轮消息可能交错。长期存储虽然使用 ConcurrentHashMap，值却是 ArrayList，并发追加和遍历并不线程安全；它还会在进程重启后丢失。

ConcurrencyLimiter 按 userId 递增计数并设置十分钟有效期，超过上限后递减，任务结束再释放。这没有按会话串行化；长任务跨越有效期也需另行评估计数准确性，不能当作可靠锁租约。

## 实现示例

以下为未运行伪代码，队列和版本 CAS 均是建议，非已有功能：

```text
scope = authorize(tenantId, userId, conversationId)
enqueue(scope, taskId, idempotencyKey)
state = load(scope)
result = execute(state, request)
if not compareAndSet(scope, state.version, result):
    reloadAndReconcile()
appendEventsOnce(scope, taskId, result)
```

同会话队列便于保持因果顺序，但慢任务会阻塞后续请求；版本 CAS 允许并行计算，却需要处理冲突和重复执行成本。多实例应共享协调状态，单机互斥不能覆盖所有进程。外部工具有副作用时，重试还需独立的幂等机制。

## 常见坑

把 taskId 当 conversationId 会丢连续性，把 userId 当会话键会混话题；仅添加租户前缀而不验证身份仍可能越权。更换线程安全列表也不能解决摘要的读改写冲突。长期用户级记忆应区分共享偏好和会话私有事实，避免通过召回间接串话。

## 验证清单

- 同用户双会话并行运行，确认上下文、消息和摘要互不混入。
- 不同租户使用同名会话，验证越权读取与写入均被拒绝。
- 同会话乱序完成，检查版本冲突、消息顺序及重试幂等性。
- 并发读写长期列表，核对条目数量与异常，而非只检查 Map。
- 模拟超时、进程重启和槽位过期，验证恢复后不会重复副作用。

## 关联项目与参考

已核对如下执行代码；身份绑定、会话队列及 CAS 未在这些实现中提供。

- [任务创建及记忆调用](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/controller/AgentTaskService.java#L115-L165)
- [短时键与追加](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/ShortTermMemory.java#L20-L45)
- [长期列表读写](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/LongTermMemory.java#L30-L61)
- [用户槽位计数](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/guard/ConcurrencyLimiter.java#L19-L60)
