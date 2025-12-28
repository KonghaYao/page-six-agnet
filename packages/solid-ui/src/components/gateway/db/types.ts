// 路由类型
export interface Route {
  id: string;
  name: string;
  path: string;
  target: string;
  status: 'active' | 'paused';
  requests: number;
  createdAt: number;
  updatedAt: number;
}

// 日志类型
export interface Log {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  path: string;
  status: number;
  time: number; // timestamp
  latency: number; // milliseconds
  size: number; // bytes
  routeId?: string;
  requestBody?: string;
  responseBody?: string;
}

// 设置类型
export interface Settings {
  id: string;
  gatewayName: string;
  timeout: number;
  maxRetries: number;
  enableAuth: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  rateLimitEnabled: boolean;
  rateLimitPerSecond: number;
  updatedAt: number;
}

