# Gateway 数据库模块

基于 RxDB 15.x 的浏览器端数据库实现。

## 文件结构

- `database.ts` - 数据库初始化和连接管理
- `schema.ts` - 数据模型定义（routes, logs, settings）
- `types.ts` - TypeScript 类型定义
- `routes.ts` - 路由 CRUD 操作
- `logs.ts` - 日志 CRUD 操作
- `settings.ts` - 设置 CRUD 操作
- `useDatabase.ts` - SolidJS Hook
- `index.ts` - 统一导出

## 使用说明

### 1. 安装依赖

```bash
npm install rxdb
```

### 2. 在组件中使用

```typescript
import { useDatabase } from '../db/useDatabase';
import { subscribeRoutes, createRoute } from '../db/routes';

export const MyComponent = () => {
    useDatabase(); // 初始化数据库

    const [routes, setRoutes] = createSignal<Route[]>([]);

    onMount(async () => {
        const unsubscribe = await subscribeRoutes((routesList) => {
            setRoutes(routesList);
        });

        onCleanup(() => {
            unsubscribe();
        });
    });

    // ...
};
```

## 数据模型

### Routes（路由）

- `id`: string (主键)
- `name`: string
- `path`: string
- `target`: string
- `status`: 'active' | 'paused'
- `requests`: number
- `createdAt`: number
- `updatedAt`: number

### Logs（日志）

- `id`: string (主键)
- `method`: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'
- `path`: string
- `status`: number
- `time`: number (timestamp)
- `latency`: number (milliseconds)
- `size`: number (bytes)
- `routeId`: string (可选)
- `requestBody`: string (可选)
- `responseBody`: string (可选)

### Settings（设置）

- `id`: 'singleton' (单例)
- `gatewayName`: string
- `timeout`: number
- `maxRetries`: number
- `enableAuth`: boolean
- `logLevel`: 'debug' | 'info' | 'warn' | 'error'
- `rateLimitEnabled`: boolean
- `rateLimitPerSecond`: number
- `updatedAt`: number

## API 参考

### Routes

- `getAllRoutes()` - 获取所有路由
- `getRouteById(id)` - 根据 ID 获取路由
- `createRoute(route)` - 创建路由
- `updateRoute(id, updates)` - 更新路由
- `deleteRoute(id)` - 删除路由
- `toggleRouteStatus(id)` - 切换路由状态
- `incrementRouteRequests(id)` - 增加请求计数
- `subscribeRoutes(callback)` - 订阅路由变化

### Logs

- `getAllLogs(limit?)` - 获取所有日志
- `queryLogs(filters)` - 条件查询日志
- `createLog(log)` - 创建日志
- `createLogs(logs)` - 批量创建日志
- `deleteLog(id)` - 删除日志
- `clearAllLogs()` - 清空所有日志
- `deleteOldLogs(keepCount)` - 删除旧日志
- `getLogStats()` - 获取统计信息
- `subscribeLogs(callback, limit?)` - 订阅日志变化

### Settings

- `getSettings()` - 获取设置
- `updateSettings(updates)` - 更新设置
- `resetSettings()` - 重置为默认值
- `subscribeSettings(callback)` - 订阅设置变化

## 注意事项

1. **数据库初始化**: 每个使用数据库的组件都应该调用 `useDatabase()` hook
2. **订阅清理**: 使用 `onCleanup` 确保订阅被正确清理
3. **数据持久化**: 数据存储在浏览器的 IndexedDB 中，刷新页面后数据会保留
4. **错误处理**: 所有异步操作都应该有适当的错误处理

## 测试检查清单

- [ ] 数据库初始化成功
- [ ] 路由 CRUD 操作正常
- [ ] 日志 CRUD 操作正常
- [ ] 设置读写正常
- [ ] 订阅功能正常（实时更新）
- [ ] 数据持久化正常（刷新后数据保留）
- [ ] 错误处理正常
