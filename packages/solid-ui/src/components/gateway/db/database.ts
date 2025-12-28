import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { routeSchema } from './schema';
import { logSchema } from './schema';
import { settingsSchema } from './schema';

// 添加查询构建器插件（支持 sort、limit 等方法）
addRxPlugin(RxDBQueryBuilderPlugin);

export interface GatewayDatabase {
    routes: any; // RxCollection<Route>
    logs: any; // RxCollection<Log>
    settings: any; // RxCollection<Settings>
}

type DatabaseInstance = Awaited<ReturnType<typeof createRxDatabase<GatewayDatabase>>>;

let dbInstance: DatabaseInstance | null = null;
let initPromise: Promise<DatabaseInstance> | null = null;

/**
 * 初始化数据库
 */
export async function initDatabase(): Promise<DatabaseInstance> {
    if (dbInstance) {
        return dbInstance;
    }

    // 如果正在初始化，等待初始化完成
    if (initPromise) {
        return initPromise;
    }

    // 开始初始化
    initPromise = (async () => {
        try {
            dbInstance = await createRxDatabase<GatewayDatabase>({
                name: 'gateway_db',
                storage: getRxStorageDexie(),
                ignoreDuplicate: true, // 如果数据库已存在，忽略错误并复用
            });

            // 创建集合（如果不存在）
            try {
                await dbInstance.addCollections({
                    routes: {
                        schema: routeSchema,
                    },
                    logs: {
                        schema: logSchema,
                    },
                    settings: {
                        schema: settingsSchema,
                    },
                });
            } catch (error: any) {
                // 如果集合已存在，忽略错误
                if (!error?.message?.includes('already exists') && !error?.message?.includes('already added')) {
                    console.warn('部分集合可能已存在:', error);
                }
            }

            return dbInstance;
        } catch (error: any) {
            initPromise = null;
            // 如果 ignoreDuplicate 选项不存在，捕获 DB8 错误
            if (error?.code === 'DB8' || error?.rxdb?.code === 'DB8' || error?.message?.includes('DB8')) {
                // 数据库已存在，清除错误并重新尝试（使用不同的方法）
                console.warn('数据库已存在，尝试重新初始化...');
                // 等待一小段时间，让之前的实例完全关闭
                await new Promise((resolve) => setTimeout(resolve, 200));
                // 重新初始化
                return await initDatabase();
            }
            throw error;
        }
    })();

    return initPromise;
    // }

    // // 初始化默认设置
    // const existingSettings = await dbInstance.settings.findOne('singleton').exec()
    // if (!existingSettings) {
    // 	await dbInstance.settings.insert({
    // 		id: 'singleton',
    // 		gatewayName: 'AI Gateway',
    // 		timeout: 30000,
    // 		maxRetries: 3,
    // 		enableAuth: true,
    // 		logLevel: 'info',
    // 		rateLimitEnabled: false,
    // 		rateLimitPerSecond: 100,
    // 		updatedAt: Date.now(),
    // 	})
    // }

    // return dbInstance
}

/**
 * 获取数据库实例
 */
export async function getDatabase(): Promise<DatabaseInstance> {
    if (!dbInstance) {
        return await initDatabase();
    }
    return dbInstance;
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
    if (dbInstance) {
        await dbInstance.destroy();
        dbInstance = null;
    }
}
