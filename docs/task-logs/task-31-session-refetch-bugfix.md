# Task 31: Fix Session Expiry Not Reflecting in UI

**Phase:** Bugfix (插入修复)
**Date:** 2026-04-03
**Status:** Completed

## Problem

Session 过期后，页面不刷新的情况下 navbar 仍显示登录态。原因是 SessionProvider 使用默认配置，未设置定时刷新，客户端缓存的 session 数据不会主动重新验证。

## What Was Done

在 `SessionProvider` 添加两个配置：
- `refetchInterval={5 * 60}` — 每 5 分钟自动检查 session 有效性
- `refetchOnWindowFocus={true}` — 切换回浏览器窗口时自动检查

session 过期后 `useSession()` 返回 `unauthenticated`，navbar 自动切回游客状态。

## Files Modified

- `src/components/providers.tsx`
