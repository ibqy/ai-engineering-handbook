---
id: M03
title: JSON 合法为什么不等于业务正确？
category: models
level: 高阶
tags: [结构化输出, 业务校验]
summary: JSON 解析、模式校验、业务约束和事实核验是不同关卡，结构化结果只能作为待验证输入。
updated: '2026-11-11'
order: 3
---

# JSON 合法为什么不等于业务正确？

## 直接回答

JSON 合法只说明文本符合语法。字段符合模式，也只能证明形状和部分取值约束正确，不能证明订单存在、金额正确、操作者有权限或退款仍可执行。模型生成的对象必须经过语法、模式、业务和事实四道检查，才能作为业务命令的候选参数。

反序列化成功不是可信边界。即使供应商提供原生结构约束，也不能把“输出一定像订单”解释成“订单内容一定真实”。是否支持某种约束，应以实际模型和端点验证为准。

## 实际场景

客服提取到订单号、退款金额和原因，返回的金额是正数且字段齐全。但是用户只支付了部分款项，另一次退款已经在处理中；单看这段 JSON 无法发现累计退款将超额。订单号来自另一位用户时，更不能靠模型解释“这应该是他的订单”来放行。

应用要用登录态确定用户身份，查询当前订单与已退款金额，核实可退额度，再显示确认页。用户确认后仍要在写入时重新检查状态，避免确认到执行之间发生变化。

## 原理与取舍

第一层解析检查语法及资源限制，例如嵌套深度和内容大小。第二层模式校验检查必填字段、类型、枚举、未知字段和格式。第三层检查业务关系，例如开始日期早于结束日期、退款不超过余额。第四层用可信数据核对事实及权限。

不同层的失败处理应不同。格式问题可在预算内重试一次或请求重新生成；无权限直接拒绝；资料不足先追问；状态冲突刷新数据。把所有失败都交给模型反复“修正”，可能把本来不存在的字段修成看似合理的假值。

要区分空字符串、零、空列表和未知。金额建议以最小货币单位的整数或精确小数承载，并显式指定币种；模型推断的货币不能偷偷成为业务默认值。日期也要说明时区和允许精度。

## 实现示例

Java21纯逻辑示例：只展示对象进入写入流程前的一部分校验。

```java
record RefundDraft(String orderId, long amountCents) {}
record OrderSnapshot(String id, String owner, long refundableCents) {}

static void validate(RefundDraft draft, OrderSnapshot order,
                     String authenticatedUser) {
    if (draft == null || order == null
            || !order.id().equals(draft.orderId())) {
        throw new IllegalArgumentException("订单不匹配");
    }
    if (!order.owner().equals(authenticatedUser)) {
        throw new SecurityException("无订单权限");
    }
    if (draft.amountCents() <= 0
            || draft.amountCents() > order.refundableCents()) {
        throw new IllegalArgumentException("退款金额越界");
    }
}
```

此处快照由可信服务提供，身份由认证上下文提供；不能让模型同时生成两者来“自证正确”。该校验不代替数据库事务中的额度检查，也不包含幂等、用户确认与支付通道对账。

## 常见坑

- 把模式校验失败自动降级成自由文本，再由下游猜字段。
- 使用浮点金额，或者把解析失败的金额默认为零。
- 只校验字段自身，忽略字段之间以及与数据库状态之间的约束。
- 将模型自报的置信度当作事实核验结果。

## 验证清单

- [ ] 合法 JSON 但订单不存在、金额超限和跨用户访问均被拦截。
- [ ] 缺失值与真实零值可区分，额外字段处理有明确规则。
- [ ] 重试次数受限，失败响应不会进入写操作队列。
- [ ] 业务提交阶段重新校验最新状态并保留审计记录。

## 关联项目与参考

已核对 [Spring AI 结构化输出控制器](https://github.com/ibqy/spring-ai-teaching-demo/blob/main/src/main/java/com/xb/springai/controller/demo03/Demo03StructuredOutputController.java)：实际方法用 `entity` 映射演员电影及代码审查对象。

教学简化与生产差距：源码展示的是映射入口，没有证明演员作品事实或代码评分正确。注释里的进阶模式不是当前方法已执行的验证链；本文不据此声称框架已经完成业务校验。
