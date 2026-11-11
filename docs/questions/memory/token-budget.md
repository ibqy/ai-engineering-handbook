---
id: C02
title: 上下文窗口和Token预算怎么分配
category: memory
level: 基础
tags: [上下文窗口, Token预算, 历史压缩]
summary: 从完整请求核算上下文预算，区分示例中的字符粗估、历史压缩阈值与真正的模型窗口约束。
updated: '2026-11-11'
order: 2
---

# 上下文窗口和Token预算怎么分配

## 直接回答

先按模型接口约束确定可用窗口，再预留输出与安全余量，剩余空间分给系统指令、工具定义、当前问题、检索信息和历史。不能把整个窗口都分给历史，也不能只数用户可见文字。预算应在完整请求装配后复核，超额时按信息价值裁剪，而不是无差别截断。

## 实际场景

例如使用三万二千 Token 窗口，可先给输出留四千、安全余量留两千，系统指令三千、工具定义五千、当前问题两千、检索材料六千，历史剩下一万。这只是教学分配，不是固定比例；工具返回很长或用户上传代码时，应动态重算。

示例调用方把工具清单、记忆上下文和当前目标拼入任务。如果只对最近对话计数，即使历史低于阈值，最终请求仍可能超窗。后续工具调用也会增加上下文，需要每次请求重新检查。

## 原理与取舍

MemoryCompressor 按每条字符串 length()/2+1 粗估 Token；这不是模型分词器计数，对英文、代码、特殊符号和不同语言的误差并不稳定。执行代码在估值大于 maxTokens 的百分之七十时压缩；门面传入八千，所以触发线是估值五千六百，而不是全请求的真实窗口使用率。

百分之七十只是示例阈值，不能当成通用安全保证。摘要调用本身需要容纳摘要指令、待压缩历史和输出；当前实现仅返回摘要列表，没有写回 Redis，也没有压缩后预算复核。门面先取最近二十条，遗漏的更早事实不会因增加压缩预算而恢复。

## 实现示例

以下为未运行伪代码，表示建议的预算流程，并非已有功能：

```text
fixed = count(system + tools + current)
available = window - outputReserve - safety - fixed
if available < 0: rejectOrReduceFixedInput()
retrieval = selectEvidence(retrievalCap, available)
history = selectHistory(available - count(retrieval))
request = assemble(system, tools, current, retrieval, history)
assert count(request) + outputReserve + safety <= window
```

count 建议使用目标模型匹配的计数方式，并覆盖消息封装开销。摘要若仍超限，应减少材料、重新摘要或明确拒绝，不能仅依据“调用过压缩器”就放行。

## 常见坑

历史条数不等于 Token 数，单条工具结果就可能很大。扩大 topK 会挤占历史与输出，截断当前问题则可能删除关键约束。无上限的递归压缩还会增加费用和延迟，建议限制次数并设置失败回退路径。输出预留也须遵守模型独立的最大生成限制。

## 验证清单

- 对中文、英文和代码分别比较粗估与实际用量，记录偏差分布。
- 同时统计 system、tools、current、retrieval、history 和输出预留。
- 构造恰好达到及超过阈值的输入，检查摘要调用自身是否超窗。
- 测试摘要反而变长、工具返回突增及固定输入已超预算的情况。
- 记录裁剪内容及原因，检查数字、否定条件和当前任务是否完整。

## 关联项目与参考

已核对下列源码；完整请求计数、动态分配和压后复核均为建议，不能归为现有能力。

- [字符粗估与压缩阈值](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/MemoryCompressor.java#L45-L65)
- [二十条历史及八千参数](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/LayeredMemoryService.java#L46-L66)
- [工具清单与任务装配](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/controller/AgentTaskService.java#L150-L159)
