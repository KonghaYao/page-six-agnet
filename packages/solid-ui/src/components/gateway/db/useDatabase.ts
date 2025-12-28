import { onMount, onCleanup } from 'solid-js';
import { initDatabase, closeDatabase } from './database';

/**
 * SolidJS Hook: 初始化数据库
 */
export function useDatabase() {
    onMount(async () => {
        await initDatabase();
    });

    onCleanup(async () => {
        // 注意：通常不需要关闭数据库，除非应用完全卸载
        // await closeDatabase();
    });
}
