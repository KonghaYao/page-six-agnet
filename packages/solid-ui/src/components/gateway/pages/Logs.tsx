import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { Filter, Download, Search, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-solid';
import { useDatabase } from '../db/useDatabase';
import { subscribeLogs, clearAllLogs } from '../db/logs';
import type { Log } from '../db/types';

export const Logs = () => {
    useDatabase();
    const [logs, setLogs] = createSignal<Log[]>([]);
    const [loading, setLoading] = createSignal(false);

    let unsubscribe: (() => void) | null = null;

    onMount(async () => {
        // 订阅最近 1000 条日志
        unsubscribe = await subscribeLogs((logsList) => {
            setLogs(logsList);
        }, 1000);
    });

    onCleanup(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatLatency = (ms: number) => {
        if (ms < 1) {
            return `${Math.round(ms * 1000)}μs`;
        } else if (ms < 1000) {
            return `${Math.round(ms)}ms`;
        } else {
            return `${(ms / 1000).toFixed(2)}s`;
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0B';
        if (bytes < 1024) {
            return `${bytes}B`;
        } else if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)}KB`;
        } else {
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        }
    };

    const handleClearLogs = async () => {
        if (!confirm('确定要清空所有日志吗？此操作不可恢复。')) {
            return;
        }
        setLoading(true);
        try {
            await clearAllLogs();
        } catch (error) {
            console.error('清空日志失败:', error);
            alert('清空日志失败');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const logsData = logs();
        const json = JSON.stringify(logsData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gateway-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">访问日志</h2>
                    <p class="text-gray-500">查看所有经过网关的流量详情</p>
                </div>
                <div class="flex gap-3">
                    <button
                        onClick={handleClearLogs}
                        disabled={loading() || logs().length === 0}
                        class="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 class="w-4 h-4" />
                        <span>清空</span>
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={logs().length === 0}
                        class="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download class="w-4 h-4" />
                        <span>导出</span>
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Show when={logs().length === 0}>
                    <div class="p-12 text-center text-gray-500">暂无日志记录</div>
                </Show>
                <Show when={logs().length > 0}>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-6 py-4 text-sm font-semibold text-gray-600">时间</th>
                                    <th class="px-6 py-4 text-sm font-semibold text-gray-600">方法</th>
                                    <th class="px-6 py-4 text-sm font-semibold text-gray-600">路径</th>
                                    <th class="px-6 py-4 text-sm font-semibold text-gray-600">状态</th>
                                    <th class="px-6 py-4 text-sm font-semibold text-gray-600">延迟</th>
                                    <th class="px-6 py-4 text-sm font-semibold text-gray-600">响应大小</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 font-mono text-sm">
                                {logs().map((log) => (
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {formatTime(log.time)}
                                        </td>
                                        <td class="px-6 py-4">
                                            <span
                                                class={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    log.method === 'POST'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : log.method === 'GET'
                                                          ? 'bg-green-100 text-green-700'
                                                          : log.method === 'PUT'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : log.method === 'DELETE'
                                                              ? 'bg-red-100 text-red-700'
                                                              : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {log.method}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-gray-700">{log.path}</td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-2">
                                                {log.status >= 200 && log.status < 300 ? (
                                                    <CheckCircle2 class="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle class="w-4 h-4 text-red-500" />
                                                )}
                                                <span
                                                    class={
                                                        log.status >= 200 && log.status < 300
                                                            ? 'text-green-700'
                                                            : 'text-red-700'
                                                    }
                                                >
                                                    {log.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-gray-500">
                                            <div class="flex items-center gap-1.5">
                                                <Clock class="w-3 h-3" />
                                                {formatLatency(log.latency)}
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-gray-500">{formatSize(log.size)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Show>
            </div>
        </div>
    );
};
