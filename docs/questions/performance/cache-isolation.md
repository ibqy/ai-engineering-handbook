---
id: P03
title: AI缓存怎么设计才不会串租户或返回旧答案
category: performance
level: 高阶
tags: [缓存, 多租户, 版本隔离]
summary: 缓存键必须覆盖可信权限域与生成版本，命中后仍校验当前权限，失效不能只依赖过期时间。
updated: '2026-11-11'
order: 3
---

# AI缓存怎么设计才不会串租户或返回旧答案

## 直接回答

先授权，再查缓存；键中包含服务端确认的租户、用户或等价权限域、权限版本、知识库版本以及实际生效的生成配置。命中后也要确认当前仍有权访问答案依赖的资料。过期时间只限制存活时长，不能保证权限撤销立即生效，也不能代替知识变更失效。

生产设计建议：分别管理向量缓存、检索缓存和答案缓存。三者共享的条件不同，不能因为向量可复用，就认为检索片段与个性化答案也可以跨用户共享。

## 实际场景

同一公司两名员工问同一个问题，一人有财务目录权限，另一人没有。只有 tenantId 的答案键仍可能泄漏同租户资料。权限被撤销后，旧答案即使尚未过期，也不应继续返回。

已核实 ai-platform 的 LlmCache 使用租户、查询、模型和知识库版本组键；RagResultCache 只有查询和知识库版本，没有租户或权限域。两者都用 ConcurrentHashMap。这是教学边界，不是可直接上线的分布式缓存方案，也不能将后者描述成已经落实检索权限隔离。

## 原理与取舍

答案缓存还依赖提示词模板版本、渲染变量、对话上下文、生成参数和安全策略。网关当前查缓存发生在模板渲染之前，因此不能仅凭其现有键认定不同模板请求不会碰撞。实际发送内容与实际模型版本必须与缓存身份一致。

键宜采用结构化编码后摘要，避免分隔符拼接歧义；敏感查询不宜作为可读键保存。摘要并非匿名化，短查询仍可能被猜测，应按数据等级考虑带密钥摘要和访问控制。脱敏后不同原文可能相同，对个性化业务宁可不缓存，也不要误复用。

检索缓存应保留依赖文档及版本，返回前复核文档权限。知识发布可切换版本命名空间，权限撤销则更新权限版本并拒绝旧条目。生成中的旧请求只能写回其原版本空间，防止失效后又污染新空间。语义缓存还需限定权限域并验证答案适用性，相似问题不代表业务语义等价。

## 实现示例

Java21纯逻辑示例：用类型表达键的必要维度，不代表完整存储或鉴权实现。

```java
record AnswerKey(
    String tenantId,
    String permissionScope,
    String permissionVersion,
    String knowledgeVersion,
    String modelVersion,
    String promptVersion,
    String generationConfigDigest,
    String renderedContextDigest,
    String queryDigest
) {}
```

这些字段应从可信会话、权限服务与发布配置产生，不接受客户端任意声明。实现时还需校验字段完整性、选定无歧义序列化、设置容量和清理策略，并在缓存读取链路执行当前授权判断。

## 常见坑

- 认为线程安全容器自动提供租户安全、跨实例一致性与内存容量上限。
- 只设置过期时间，权限变化后仍允许旧条目继续服务。
- 在未校验身份前查缓存，用缓存命中绕过模型或资料权限检查。
- 将包含私有上下文的最终答案放入全局语义缓存。
- 只失效检索片段，却忘记答案缓存、摘要和历史记忆也依赖旧资料。

## 验证清单

- 同查询跨租户、同租户跨角色访问时，分别验证可见内容与缓存行为。
- 撤销权限后立即重放旧查询，确认旧答案和引用都不能继续取得。
- 更新知识与模板，同时放行旧生成任务，检查回写版本是否混淆。
- 在多实例、重启及容量压力下验证淘汰行为；检查键和值是否泄露敏感信息。

## 关联项目与参考

- [LlmCache 源码](https://github.com/ibqy/ai-platform-demo/blob/main/src/main/java/com/xb/platform/cache/LlmCache.java)。
- [RagResultCache 源码](https://github.com/ibqy/ai-platform-demo/blob/main/src/main/java/com/xb/platform/cache/RagResultCache.java)。
- [网关缓存与模板调用顺序](https://github.com/ibqy/ai-platform-demo/blob/main/src/main/java/com/xb/platform/gateway/AiGatewayService.java)。以上为本地源码核实，生产改造与隔离测试尚未实施。
