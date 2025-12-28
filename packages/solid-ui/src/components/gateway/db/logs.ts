import { getDatabase } from './database';
import type { Log } from './types';

/**
 * 获取所有日志
 */
export async function getAllLogs(limit?: number): Promise<Log[]> {
    const db = await getDatabase();
    let query = db.logs.find().sort({ time: 'desc' });

    if (limit) {
        query = query.limit(limit);
    }

    const docs = await query.exec();
    return docs.map((doc) => doc.toJSON() as Log);
}

/**
 * 根据条件查询日志
 */
export async function queryLogs(filters: {
    path?: string;
    status?: number;
    method?: string;
    routeId?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
}): Promise<Log[]> {
    const db = await getDatabase();
    let query = db.logs.find();

    if (filters.path) {
        query = query.where('path').equals(filters.path);
    }
    if (filters.status !== undefined) {
        query = query.where('status').equals(filters.status);
    }
    if (filters.method) {
        query = query.where('method').equals(filters.method);
    }
    if (filters.routeId) {
        query = query.where('routeId').equals(filters.routeId);
    }
    if (filters.startTime) {
        query = query.where('time').gte(filters.startTime);
    }
    if (filters.endTime) {
        query = query.where('time').lte(filters.endTime);
    }

    query = query.sort({ time: 'desc' });

    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    const docs = await query.exec();
    return docs.map((doc) => doc.toJSON() as Log);
}

/**
 * 创建日志
 */
export async function createLog(log: Omit<Log, 'id'>): Promise<Log> {
    const db = await getDatabase();
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newLog: Log = {
        ...log,
        id,
    };

    await db.logs.insert(newLog);
    return newLog;
}

/**
 * 批量创建日志
 */
export async function createLogs(logs: Omit<Log, 'id'>[]): Promise<Log[]> {
    const db = await getDatabase();
    const newLogs: Log[] = logs.map((log) => ({
        ...log,
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }));

    await db.logs.bulkInsert(newLogs);
    return newLogs;
}

/**
 * 删除日志
 */
export async function deleteLog(id: string): Promise<void> {
    const db = await getDatabase();
    const doc = await db.logs.findOne(id).exec();

    if (doc) {
        await doc.remove();
    }
}

/**
 * 清空所有日志
 */
export async function clearAllLogs(): Promise<void> {
    const db = await getDatabase();
    await db.logs.remove();
}

/**
 * 删除旧日志（保留最近 N 条）
 */
export async function deleteOldLogs(keepCount: number): Promise<void> {
    const db = await getDatabase();
    const allLogs = await db.logs.find().sort({ time: 'desc' }).exec();

    if (allLogs.length > keepCount) {
        const toDelete = allLogs.slice(keepCount);
        await Promise.all(toDelete.map((doc) => doc.remove()));
    }
}

/**
 * 获取统计信息
 */
export async function getLogStats(): Promise<{
    total: number;
    success: number;
    error: number;
    avgLatency: number;
    totalSize: number;
}> {
    const db = await getDatabase();
    const allLogs = await db.logs.find().exec();

    const total = allLogs.length;
    const success = allLogs.filter((doc) => doc.status >= 200 && doc.status < 300).length;
    const error = total - success;
    const avgLatency =
        allLogs.length > 0 ? allLogs.reduce((sum, doc) => sum + (doc.latency || 0), 0) / allLogs.length : 0;
    const totalSize = allLogs.reduce((sum, doc) => sum + (doc.size || 0), 0);

    return {
        total,
        success,
        error,
        avgLatency: Math.round(avgLatency),
        totalSize,
    };
}

/**
 * 订阅日志变化
 */
export async function subscribeLogs(callback: (logs: Log[]) => void, limit?: number): Promise<() => void> {
    const db = await getDatabase();

    let query = db.logs.find().sort({ time: 'desc' });
    if (limit) {
        query = query.limit(limit);
    }

    const subscription = query.$.subscribe((docs) => {
        callback(docs.map((doc) => doc.toJSON() as Log));
    });

    return () => subscription.unsubscribe();
}
