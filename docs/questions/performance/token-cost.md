---
id: P02
title: 一次请求的真实成本怎么算
category: performance
level: 基础
tags: [Token计量, 成本, 预算]
summary: 按请求汇总每次实际尝试的分类用量和非模型费用，估算只用于预算，最终费用需对账。
updated: '2026-11-11'
order: 2
---

# 一次请求的真实成本怎么算

## 直接回答

一次用户请求的成本不等于最后一条模型响应的 Token 数。应汇总规划、检索改写、生成、评审、记忆压缩以及重试和降级等实际调用，再加向量化、重排、外部工具、存储与网络费用。模型费用按供应商当时的计费项目、单价、单位和币种计算；未知用量必须标为待对账，不能静默记零。

生产设计建议：把预算估算、运行计量和账单结算分成三层。估算用于决定是否接单，响应元数据用于及时归集，供应商账单用于校准差异，三者不应共用一个含义模糊的“成本”字段。

## 实际场景

助手为一条问题先规划再调用工具，工具失败后又重试，最后由评审模型确认答案。用户只收到一段文字，但多次请求都可能产生费用。取消界面等待也不代表供应商停止计算，因此失败和取消同样要保留调用记录。

ai-platform 的网关用请求估算值或默认值计输入量，并按输入量的一半计输出量，这是教学近似。TokenMeter 将输入输出相加后乘同一个千 Token 单价，也不是通用账单模型。不能把示例返回的 costTokens 当真实扣费凭据。

## 原理与取舍

先建立请求与尝试的层级：用户请求标识下有多个调用标识，每次重试各有尝试号和供应商请求标识。统计重试成本不能去重掉真实发生的调用；同一条计量事件被重复投递则应去重，否则报表会重复收费。

输入、输出、缓存读取及其他计费项目要按供应商契约互斥归类，避免把已包含在输入量中的缓存量重复相加。价格版本、模型实际名称、币种、用量来源和采集时间都需保留；仅保存累计金额无法解释后续价格变更。

本地估算可以帮助预留预算，但并发请求应原子预占，完成后按实际情况释放或补记。对账之前保留不确定额度，防止多个请求同时看到余额充足。共享基础设施费用宜单独展示分摊口径，不要伪装成供应商直接收费。

## 实现示例

Java21纯逻辑示例：仅计算两个已确认、互不重叠的计费项目，单价由调用方按真实合同传入，不包含任何供应商价格假设。

```java
import java.math.BigDecimal;

record Usage(long input, long output) {
    Usage {
        if (input < 0 || output < 0) {
            throw new IllegalArgumentException("用量不能为负");
        }
    }
}

final class CostMath {
    static BigDecimal calculate(Usage u, BigDecimal inputPerMillion,
                                BigDecimal outputPerMillion) {
        return inputPerMillion.multiply(BigDecimal.valueOf(u.input()))
            .add(outputPerMillion.multiply(BigDecimal.valueOf(u.output())))
            .movePointLeft(6);
    }
}
```

此例不负责缺失用量、币种换算或账单舍入。生产账本应在明确的结算边界统一舍入，并记录原始分类用量；不要在每个微小片段上截断金额再累计。

## 常见坑

- 将预算参数当作供应商实测用量，造成展示准确但依据错误。
- 只记成功的最后一次调用，遗漏失败尝试、工具费用和后台压缩。
- 缓存命中就宣称请求成本为零，忽略缓存服务及基础设施费用。
- 使用浮点累计账款，或把不同币种金额直接相加。

## 验证清单

- 对含重试、降级和取消的请求逐项核对调用次数与计量事件。
- 模拟用量缺失和重复事件，确认分别进入待对账和幂等处理流程。
- 用账单样本核对单位、价格版本与舍入规则，差异要可解释。
- 验证并发预算预占与失败释放，并检查是否可能无限透支。

## 关联项目与参考

- [TokenMeter 源码](https://github.com/ibqy/ai-platform-demo/blob/main/src/main/java/com/xb/platform/observe/TokenMeter.java)：教学单价与内存累计。
- [UsageCapturingChatModel 源码](https://github.com/ibqy/agent-orchestration-demo/blob/main/src/main/java/com/xb/agent/observe/UsageCapturingChatModel.java)：读取响应 tokenUsage，异常时记录空用量。它展示采集入口，不证明已有完整账本或完成账单核验。
