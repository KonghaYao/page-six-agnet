/**
 * 浏览器端数据注入脚本
 * 在浏览器控制台中运行：
 *
 * import { seedAll } from './db/seed-browser';
 * await seedAll({ routes: 5, logs: 100 });
 */

import { seedAll, seedRoutes, seedLogs, seedSettings, clearAllData } from './seed';

// 将函数挂载到 window 对象，方便在控制台中使用
if (typeof window !== 'undefined') {
    (window as any).gatewaySeed = {
        /**
         * 注入所有随机数据
         * @example await window.gatewaySeed.all({ routes: 5, logs: 100 })
         */
        all: seedAll,

        /**
         * 只注入路由数据
         * @example await window.gatewaySeed.routes(5)
         */
        routes: seedRoutes,

        /**
         * 只注入日志数据
         * @example await window.gatewaySeed.logs(100)
         */
        logs: seedLogs,

        /**
         * 更新设置
         * @example await window.gatewaySeed.settings()
         */
        settings: seedSettings,

        /**
         * 清空所有数据
         * @example await window.gatewaySeed.clear()
         */
        clear: clearAllData,
    };

    console.log(`
🎲 Gateway 数据注入工具已加载！

使用方法：
  // 注入 5 条路由和 100 条日志
  await window.gatewaySeed.all({ routes: 5, logs: 100 })
  
  // 只注入路由
  await window.gatewaySeed.routes(10)
  
  // 只注入日志
  await window.gatewaySeed.logs(200)
  
  // 更新设置
  await window.gatewaySeed.settings()
  
  // 清空所有数据
  await window.gatewaySeed.clear()
  `);
}

export { seedAll, seedRoutes, seedLogs, seedSettings, clearAllData };
