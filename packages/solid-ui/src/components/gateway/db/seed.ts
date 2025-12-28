import { initDatabase } from './database';
import { createRoute, getAllRoutes } from './routes';
import { createLogs } from './logs';
import { getSettings, updateSettings } from './settings';

/**
 * 生成随机路由数据
 */
function generateRandomRoute(index: number) {
  const services = [
    { name: 'OpenAI Proxy', path: '/v1/chat/completions', target: 'https://api.openai.com' },
    { name: 'Anthropic Bridge', path: '/v1/messages', target: 'https://api.anthropic.com' },
    { name: 'Local Ollama', path: '/ollama/*', target: 'http://localhost:11434' },
    { name: 'Vector DB Sync', path: '/upsert', target: 'https://pinecone.io' },
    { name: 'Gemini API', path: '/v1/generate', target: 'https://generativelanguage.googleapis.com' },
    { name: 'Claude API', path: '/v1/complete', target: 'https://api.anthropic.com' },
    { name: 'Custom LLM', path: '/llm/inference', target: 'http://localhost:8080' },
    { name: 'Embedding Service', path: '/embeddings', target: 'https://api.openai.com/v1/embeddings' },
  ];

  const service = services[index % services.length];
  const status = Math.random() > 0.2 ? 'active' : 'paused'; // 80% 概率为 active

  return {
    name: `${service.name} ${index > services.length ? `#${Math.floor(index / services.length) + 1}` : ''}`,
    path: service.path,
    target: service.target,
    status: status as 'active' | 'paused',
  };
}

/**
 * 生成随机日志数据
 */
function generateRandomLog(routeId?: string) {
  const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const paths = [
    '/v1/chat/completions',
    '/v1/messages',
    '/health',
    '/v1/embeddings',
    '/ollama/generate',
    '/config/update',
    '/api/status',
    '/v1/models',
  ];

  const method = methods[Math.floor(Math.random() * methods.length)];
  const path = paths[Math.floor(Math.random() * paths.length)];
  
  // 生成状态码：大部分是成功，少量错误
  let status: number;
  const rand = Math.random();
  if (rand < 0.85) {
    status = 200; // 85% 成功
  } else if (rand < 0.95) {
    status = 400 + Math.floor(Math.random() * 4) * 10; // 4xx 错误
  } else {
    status = 500 + Math.floor(Math.random() * 2) * 10; // 5xx 错误
  }

  // 生成延迟：大部分在 100-2000ms，少量超时
  const latency = Math.random() < 0.9 
    ? Math.floor(Math.random() * 2000) + 50 
    : Math.floor(Math.random() * 5000) + 3000;

  // 生成响应大小
  const size = status === 200 
    ? Math.floor(Math.random() * 50000) + 1000 // 1KB - 50KB
    : Math.floor(Math.random() * 500) + 100; // 100B - 500B

  const now = Date.now();
  const time = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000); // 过去7天内的随机时间

  return {
    method,
    path,
    status,
    time,
    latency,
    size,
    routeId,
  };
}

/**
 * 注入随机路由数据
 */
export async function seedRoutes(count: number = 5) {
  await initDatabase();
  console.log(`开始注入 ${count} 条路由数据...`);

  const existingRoutes = await getAllRoutes();
  if (existingRoutes.length > 0) {
    console.log(`已存在 ${existingRoutes.length} 条路由，跳过注入`);
    return existingRoutes;
  }

  const routes = [];
  for (let i = 0; i < count; i++) {
    const routeData = generateRandomRoute(i);
    const route = await createRoute(routeData);
    routes.push(route);
    console.log(`✓ 创建路由: ${route.name}`);
  }

  console.log(`✓ 成功注入 ${routes.length} 条路由数据`);
  return routes;
}

/**
 * 注入随机日志数据
 */
export async function seedLogs(count: number = 100) {
  await initDatabase();
  console.log(`开始注入 ${count} 条日志数据...`);

  const routes = await getAllRoutes();
  const logs = [];

  // 批量创建日志（每次 50 条）
  const batchSize = 50;
  for (let i = 0; i < count; i += batchSize) {
    const batch: any[] = [];
    const batchCount = Math.min(batchSize, count - i);
    
    for (let j = 0; j < batchCount; j++) {
      // 随机选择一个路由 ID（如果存在路由）
      const routeId = routes.length > 0 
        ? routes[Math.floor(Math.random() * routes.length)].id 
        : undefined;
      
      batch.push(generateRandomLog(routeId));
    }

    const createdLogs = await createLogs(batch);
    logs.push(...createdLogs);
    console.log(`✓ 已创建 ${logs.length}/${count} 条日志`);
  }

  console.log(`✓ 成功注入 ${logs.length} 条日志数据`);
  return logs;
}

/**
 * 更新设置为随机值
 */
export async function seedSettings() {
  await initDatabase();
  console.log('开始更新设置...');

  const settings = await getSettings();
  
  const randomSettings = {
    gatewayName: `Gateway ${Math.floor(Math.random() * 100)}`,
    timeout: [10000, 30000, 60000][Math.floor(Math.random() * 3)],
    maxRetries: [1, 3, 5][Math.floor(Math.random() * 3)],
    enableAuth: Math.random() > 0.5,
    logLevel: ['debug', 'info', 'warn', 'error'][Math.floor(Math.random() * 4)] as 'debug' | 'info' | 'warn' | 'error',
    rateLimitEnabled: Math.random() > 0.5,
    rateLimitPerSecond: [50, 100, 200, 500][Math.floor(Math.random() * 4)],
  };

  await updateSettings(randomSettings);
  console.log('✓ 设置已更新');
  
  return randomSettings;
}

/**
 * 注入所有随机数据
 */
export async function seedAll(options: {
  routes?: number;
  logs?: number;
  settings?: boolean;
} = {}) {
  const { routes = 5, logs = 100, settings = false } = options;

  console.log('🚀 开始注入随机数据...\n');

  try {
    // 注入路由
    if (routes > 0) {
      await seedRoutes(routes);
      console.log('');
    }

    // 注入日志
    if (logs > 0) {
      await seedLogs(logs);
      console.log('');
    }

    // 更新设置
    if (settings) {
      await seedSettings();
      console.log('');
    }

    console.log('✅ 所有数据注入完成！');
  } catch (error) {
    console.error('❌ 数据注入失败:', error);
    throw error;
  }
}

/**
 * 清空所有数据（谨慎使用）
 */
export async function clearAllData() {
  await initDatabase();
  console.log('⚠️  开始清空所有数据...');

  // 清空路由
  const routes = await getAllRoutes();
  for (const route of routes) {
    const { deleteRoute } = await import('./routes');
    await deleteRoute(route.id);
  }
  console.log(`✓ 已删除 ${routes.length} 条路由`);

  // 清空日志
  const { clearAllLogs } = await import('./logs');
  await clearAllLogs();
  console.log('✓ 已清空所有日志');

  // 重置设置
  const { resetSettings } = await import('./settings');
  await resetSettings();
  console.log('✓ 已重置设置');

  console.log('✅ 所有数据已清空');
}

