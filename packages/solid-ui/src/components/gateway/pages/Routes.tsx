import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { Plus, Search, MoreVertical, Play, Pause, Trash2, ExternalLink, X } from 'lucide-solid';
import { useDatabase } from '../db/useDatabase';
import { subscribeRoutes, createRoute, toggleRouteStatus, deleteRoute } from '../db/routes';
import type { Route } from '../db/types';

export const Routes = () => {
    useDatabase();
    const [routes, setRoutes] = createSignal<Route[]>([]);
    const [showCreateModal, setShowCreateModal] = createSignal(false);
    const [newRoute, setNewRoute] = createSignal({
        name: '',
        path: '',
        target: '',
        status: 'active' as 'active' | 'paused',
    });
    const [loading, setLoading] = createSignal(false);

    let unsubscribe: (() => void) | null = null;

    onMount(async () => {
        unsubscribe = await subscribeRoutes((routesList) => {
            setRoutes(routesList);
        });
    });

    onCleanup(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    const handleCreateRoute = async () => {
        const route = newRoute();
        if (!route.name || !route.path || !route.target) {
            alert('请填写所有必填字段');
            return;
        }

        setLoading(true);
        try {
            await createRoute({
                name: route.name,
                path: route.path,
                target: route.target,
                status: route.status,
            });
            setShowCreateModal(false);
            setNewRoute({ name: '', path: '', target: '', status: 'active' });
        } catch (error) {
            console.error('创建路由失败:', error);
            alert('创建路由失败');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleRouteStatus(id);
        } catch (error) {
            console.error('切换状态失败:', error);
            alert('操作失败');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除这个路由吗？')) {
            return;
        }
        try {
            await deleteRoute(id);
        } catch (error) {
            console.error('删除路由失败:', error);
            alert('删除失败');
        }
    };

    const formatRequests = (count: number) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    return (
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">路由管理</h2>
                    <p class="text-gray-500">配置和管理您的 API 转发路径</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus class="w-4 h-4" />
                    <span>新建路由</span>
                </button>
            </div>

            {/* Table Container */}
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Show when={routes().length === 0}>
                    <div class="p-12 text-center text-gray-500">暂无路由，点击"新建路由"开始添加</div>
                </Show>
                <Show when={routes().length > 0}>
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">服务名称</th>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">匹配路径</th>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">转发目标</th>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">状态</th>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">总请求</th>
                                <th class="px-6 py-4 text-sm font-semibold text-gray-600">操作</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            {routes().map((route) => (
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-4">
                                        <span class="font-medium text-gray-900">{route.name}</span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <code class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                            {route.path}
                                        </code>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer text-sm">
                                            {route.target}
                                            <ExternalLink class="w-3 h-3" />
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div
                                            class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                route.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {route.status === 'active' ? '运行中' : '已暂停'}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-500">{formatRequests(route.requests)}</td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <button
                                                onClick={() => handleToggleStatus(route.id)}
                                                class="text-gray-400 hover:text-blue-600 transition-colors"
                                                title={route.status === 'active' ? '暂停' : '启动'}
                                            >
                                                {route.status === 'active' ? (
                                                    <Pause class="w-4 h-4" />
                                                ) : (
                                                    <Play class="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(route.id)}
                                                class="text-gray-400 hover:text-red-600 transition-colors"
                                                title="删除"
                                            >
                                                <Trash2 class="w-4 h-4" />
                                            </button>
                                            <button class="text-gray-400 hover:text-gray-600 transition-colors">
                                                <MoreVertical class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Show>
            </div>

            {/* Create Modal */}
            <Show when={showCreateModal()}>
                <div class="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-xl p-6 w-full max-w-md">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-gray-900">新建路由</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                class="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X class="w-5 h-5" />
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">服务名称</label>
                                <input
                                    type="text"
                                    value={newRoute().name}
                                    onInput={(e) => setNewRoute({ ...newRoute(), name: e.currentTarget.value })}
                                    placeholder="例如: OpenAI Proxy"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">匹配路径</label>
                                <input
                                    type="text"
                                    value={newRoute().path}
                                    onInput={(e) => setNewRoute({ ...newRoute(), path: e.currentTarget.value })}
                                    placeholder="例如: /v1/chat/completions"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">转发目标</label>
                                <input
                                    type="text"
                                    value={newRoute().target}
                                    onInput={(e) => setNewRoute({ ...newRoute(), target: e.currentTarget.value })}
                                    placeholder="例如: https://api.openai.com"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">初始状态</label>
                                <select
                                    value={newRoute().status}
                                    onChange={(e) =>
                                        setNewRoute({
                                            ...newRoute(),
                                            status: e.currentTarget.value as 'active' | 'paused',
                                        })
                                    }
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="active">运行中</option>
                                    <option value="paused">已暂停</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleCreateRoute}
                                disabled={loading()}
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading() ? '创建中...' : '创建'}
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
};
