import { getDatabase } from './database';
import type { Settings } from './types';

const SETTINGS_ID = 'singleton';

/**
 * 获取设置
 */
export async function getSettings(): Promise<Settings> {
  const db = await getDatabase();
  let doc = await db.settings.findOne(SETTINGS_ID).exec();
  
  if (!doc) {
    // 如果不存在，创建默认设置
    const defaultSettings: Settings = {
      id: SETTINGS_ID,
      gatewayName: 'AI Gateway',
      timeout: 30000,
      maxRetries: 3,
      enableAuth: true,
      logLevel: 'info',
      rateLimitEnabled: false,
      rateLimitPerSecond: 100,
      updatedAt: Date.now(),
    };
    await db.settings.insert(defaultSettings);
    doc = await db.settings.findOne(SETTINGS_ID).exec();
  }
  
  return doc!.toJSON() as Settings;
}

/**
 * 更新设置
 */
export async function updateSettings(updates: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
  const db = await getDatabase();
  let doc = await db.settings.findOne(SETTINGS_ID).exec();
  
  if (!doc) {
    // 如果不存在，先创建
    await getSettings();
    doc = await db.settings.findOne(SETTINGS_ID).exec();
  }
  
  await doc!.update({
    ...updates,
    updatedAt: Date.now(),
  });

  return doc!.toJSON() as Settings;
}

/**
 * 重置设置为默认值
 */
export async function resetSettings(): Promise<Settings> {
  const defaultSettings: Settings = {
    id: SETTINGS_ID,
    gatewayName: 'AI Gateway',
    timeout: 30000,
    maxRetries: 3,
    enableAuth: true,
    logLevel: 'info',
    rateLimitEnabled: false,
    rateLimitPerSecond: 100,
    updatedAt: Date.now(),
  };

  const db = await getDatabase();
  let doc = await db.settings.findOne(SETTINGS_ID).exec();
  
  if (doc) {
    await doc.update(defaultSettings);
  } else {
    await db.settings.insert(defaultSettings);
    doc = await db.settings.findOne(SETTINGS_ID).exec();
  }
  
  return doc!.toJSON() as Settings;
}

/**
 * 订阅设置变化
 */
export async function subscribeSettings(callback: (settings: Settings) => void): Promise<() => void> {
  const db = await getDatabase();
  
  // 确保设置存在
  await getSettings();
  
  const subscription = db.settings.findOne(SETTINGS_ID).$.subscribe((doc) => {
    if (doc) {
      callback(doc.toJSON() as Settings);
    } else {
      // 如果文档不存在，使用默认值
      callback({
        id: SETTINGS_ID,
        gatewayName: 'AI Gateway',
        timeout: 30000,
        maxRetries: 3,
        enableAuth: true,
        logLevel: 'info',
        rateLimitEnabled: false,
        rateLimitPerSecond: 100,
        updatedAt: Date.now(),
      });
    }
  });

  return () => subscription.unsubscribe();
}

