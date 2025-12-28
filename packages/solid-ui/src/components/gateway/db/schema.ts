import type { RxJsonSchema } from 'rxdb';

// 路由表 Schema
export const routeSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
    },
    path: {
      type: 'string',
    },
    target: {
      type: 'string',
    },
    status: {
      type: 'string',
      enum: ['active', 'paused'],
      default: 'active',
    },
    requests: {
      type: 'number',
      default: 0,
    },
    createdAt: {
      type: 'number',
    },
    updatedAt: {
      type: 'number',
    },
  },
  required: ['id', 'name', 'path', 'target', 'status'],
  indexes: ['name', 'path', 'status'],
};

// 日志表 Schema
export const logSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    method: {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
    path: {
      type: 'string',
    },
    status: {
      type: 'number',
    },
    time: {
      type: 'number', // timestamp
    },
    latency: {
      type: 'number', // milliseconds
    },
    size: {
      type: 'number', // bytes
    },
    routeId: {
      type: 'string', // 关联的路由 ID
    },
    requestBody: {
      type: 'string', // JSON string
    },
    responseBody: {
      type: 'string', // JSON string
    },
  },
  required: ['id', 'method', 'path', 'status', 'time'],
  indexes: ['time', 'path', 'status', 'routeId'],
};

// 设置表 Schema（单例模式，只有一个文档）
export const settingsSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      default: 'singleton',
    },
    gatewayName: {
      type: 'string',
      default: 'AI Gateway',
    },
    timeout: {
      type: 'number',
      default: 30000,
    },
    maxRetries: {
      type: 'number',
      default: 3,
    },
    enableAuth: {
      type: 'boolean',
      default: true,
    },
    logLevel: {
      type: 'string',
      enum: ['debug', 'info', 'warn', 'error'],
      default: 'info',
    },
    rateLimitEnabled: {
      type: 'boolean',
      default: false,
    },
    rateLimitPerSecond: {
      type: 'number',
      default: 100,
    },
    updatedAt: {
      type: 'number',
    },
  },
  required: ['id'],
};

