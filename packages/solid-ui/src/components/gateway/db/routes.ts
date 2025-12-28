import { getDatabase } from './database';
import type { Route } from './types';

/**
 * 获取所有路由
 */
export async function getAllRoutes(): Promise<Route[]> {
  const db = await getDatabase();
  const docs = await db.routes.find().exec();
  return docs.map((doc) => doc.toJSON() as Route);
}

/**
 * 根据 ID 获取路由
 */
export async function getRouteById(id: string): Promise<Route | null> {
  const db = await getDatabase();
  const doc = await db.routes.findOne(id).exec();
  return doc ? (doc.toJSON() as Route) : null;
}

/**
 * 创建路由
 */
export async function createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt' | 'requests'>): Promise<Route> {
  const db = await getDatabase();
  const now = Date.now();
  const id = `route_${now}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newRoute: Route = {
    ...route,
    id,
    requests: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.routes.insert(newRoute);
  return newRoute;
}

/**
 * 更新路由
 */
export async function updateRoute(id: string, updates: Partial<Omit<Route, 'id' | 'createdAt'>>): Promise<Route> {
  const db = await getDatabase();
  const doc = await db.routes.findOne(id).exec();
  
  if (!doc) {
    throw new Error(`Route with id ${id} not found`);
  }

  await doc.update({
    ...updates,
    updatedAt: Date.now(),
  });

  return doc.toJSON() as Route;
}

/**
 * 删除路由
 */
export async function deleteRoute(id: string): Promise<void> {
  const db = await getDatabase();
  const doc = await db.routes.findOne(id).exec();
  
  if (doc) {
    await doc.remove();
  }
}

/**
 * 切换路由状态（active/paused）
 */
export async function toggleRouteStatus(id: string): Promise<Route> {
  const db = await getDatabase();
  const doc = await db.routes.findOne(id).exec();
  
  if (!doc) {
    throw new Error(`Route with id ${id} not found`);
  }

  const newStatus = doc.status === 'active' ? 'paused' : 'active';
  await doc.update({
    status: newStatus,
    updatedAt: Date.now(),
  });

  return doc.toJSON() as Route;
}

/**
 * 增加路由请求计数
 */
export async function incrementRouteRequests(id: string): Promise<void> {
  const db = await getDatabase();
  const doc = await db.routes.findOne(id).exec();
  
  if (doc) {
    await doc.update({
      requests: (doc.requests || 0) + 1,
      updatedAt: Date.now(),
    });
  }
}

/**
 * 订阅路由变化
 */
export async function subscribeRoutes(callback: (routes: Route[]) => void): Promise<() => void> {
  const db = await getDatabase();
  
  // 初始查询
  const query = db.routes.find();
  const subscription = query.$.subscribe((docs) => {
    callback(docs.map((doc) => doc.toJSON() as Route));
  });

  return () => subscription.unsubscribe();
}

