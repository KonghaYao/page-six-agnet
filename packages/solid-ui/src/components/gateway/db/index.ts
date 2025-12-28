// 数据库初始化和连接
export { initDatabase, getDatabase, closeDatabase } from './database';
export type { GatewayDatabase } from './database';

// Schema 定义
export { routeSchema, logSchema, settingsSchema } from './schema';

// 类型定义
export type { Route, Log, Settings } from './types';

// 路由操作
export {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  toggleRouteStatus,
  incrementRouteRequests,
  subscribeRoutes,
} from './routes';

// 日志操作
export {
  getAllLogs,
  queryLogs,
  createLog,
  createLogs,
  deleteLog,
  clearAllLogs,
  deleteOldLogs,
  getLogStats,
  subscribeLogs,
} from './logs';

// 设置操作
export {
  getSettings,
  updateSettings,
  resetSettings,
  subscribeSettings,
} from './settings';

// SolidJS Hook
export { useDatabase } from './useDatabase';
