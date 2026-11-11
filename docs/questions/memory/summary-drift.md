---
id: C03
title: 历史摘要为什么越压缩越失真
category: memory
level: 高阶
tags: [摘要漂移, 信息溯源, 记忆压缩]
summary: 解释有损摘要的误差累积，区分窗口截断与重复压缩，并提出保留原始证据的验证方案。
updated: '2026-11-11'
order: 3
---

# 历史摘要为什么越压缩越失真

## 直接回答

摘要是有损选择，不是可逆编码。压缩会删除措辞、条件和来源，后续再压缩时只能依据残留文本；遗漏无法自行恢复，推测还可能被改写成确定事实。但“越压越失真”不是必然的运行轨迹，必须先确认系统是否把摘要写回，再检查真正的信息损失发生在哪里。

## 实际场景

用户说“周五可能发布，只有安全审查通过才行”，第一次摘要变成“计划周五发布”，第二次变成“周五发布已确定”。条件和不确定性逐步消失，执行者可能据此通知客户。更危险的是，后来用户明确延期，而摘要仍保留旧日期，却没有来源帮助判断哪条更新有效。

建议把日期、金额、否定条件、授权状态和待确认事项作为重点保真字段，而非只追求字数缩短。摘要越短，越需要承认覆盖范围有限。

## 原理与取舍

示例压缩器要求保留目标、结论、数据编号和遗留问题，但这些提示不构成结果校验。执行代码使用字符数除二加一粗估，超过传入预算的百分之七十才调用模型；这个阈值只是示例。返回值是单元素摘要列表，没有写回 Redis，也没有压后长度复核，因此不能声称它已经反复覆盖旧摘要。

实际损失可能更早发生：门面先取最近二十条，再调用压缩器，窗口外的旧事实不在输入中。任务结束时助手回答还被截断为二百字符；回答超过五十字符才写长期结论，并非提取完整事实。若限制条件位于截断位置之后，即使摘要模型完全忠实，也无法恢复它。

## 实现示例

以下为未运行伪代码，是建议方案，不代表项目已支持来源关联：

```text
originals = loadOriginalMessages(scope, range)
draft = summarize(originals, preserveConditions = true)
draft.sourceMessageIds = originals.ids
issues = compareFacts(draft, originals)
if issues.notEmpty: keepOriginalsOrRequestReview()
else: saveDerivedSummary(draft, sourceRange, version)
```

建议摘要保留原始消息 ID、覆盖范围及版本，关键事实附对应来源；重建摘要优先读取原文，而不是不断压缩上一版。来源链接只能提供审计入口，仍需验证其确实支持结论，不能以“有引用”代替事实核对。

## 常见坑

用压缩率衡量全部质量，会奖励删除关键条件。把用户猜测、助手建议与工具观测混成同一事实，会抬高证据强度。只检查摘要流畅性则发现不了否定词丢失。对于冲突信息，建议保留时间和撤销关系，无法判断时明确标注冲突，不要静默合并。

## 验证清单

- 构造包含数字、否定、例外和后续更正的对话，逐项核对保留率。
- 分别测试原文摘要与多次摘要，区分首轮损失和误差累积。
- 把关键事实放在第二十一条之前，确认窗口截断不能靠压缩补救。
- 检查摘要来源是否可解析、范围是否完整、过期版本是否仍被使用。
- 比较压前压后长度，并测试生成失败、内容空缺时的回退行为。

## 关联项目与参考

以下证据来自已核对的执行代码；原始消息档案、来源 ID 和版本化摘要均为建议，现有返回列表不提供这些保证。

- [摘要提示与返回路径](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/MemoryCompressor.java#L23-L65)
- [窗口选择与回答截断](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/LayeredMemoryService.java#L58-L85)
- [短时列表读取](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/memory/ShortTermMemory.java#L35-L45)
