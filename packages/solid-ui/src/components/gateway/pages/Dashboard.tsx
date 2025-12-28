import { createSignal } from 'solid-js';
import { ArrowUpRight, ArrowDownRight, Zap, Clock, AlertTriangle, Server } from 'lucide-solid';

export const Dashboard = () => {
    const stats = [
        {
            label: '总请求数',
            value: '1,284,392',
            trend: '+12.5%',
            isUp: true,
            icon: Zap,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            label: '平均延迟',
            value: '124ms',
            trend: '-2.1%',
            isUp: false,
            icon: Clock,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            label: '错误率',
            value: '0.04%',
            trend: '+0.01%',
            isUp: true,
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
        },
        {
            label: '活跃节点',
            value: '12',
            trend: '稳定',
            isUp: true,
            icon: Server,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
        },
    ];

    return (
        <div class="space-y-8">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">仪表盘概览</h2>
                <p class="text-gray-500">实时监控您的网关流量和系统健康状态</p>
            </div>

            {/* Stats Grid */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between mb-4">
                            <div class={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon class="w-6 h-6" />
                            </div>
                            <div
                                class={`flex items-center text-xs font-medium ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {stat.trend}
                                {stat.isUp ? (
                                    <ArrowUpRight class="w-3 h-3 ml-0.5" />
                                ) : (
                                    <ArrowDownRight class="w-3 h-3 ml-0.5" />
                                )}
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div class="text-sm text-gray-500 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts / Placeholder for more info */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
                    <h3 class="font-bold text-lg mb-4">流量趋势 (24h)</h3>
                    <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                        <span class="text-gray-400 italic">图表组件待集成...</span>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 class="font-bold text-lg mb-4">节点状态</h3>
                    <div class="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span class="text-sm font-medium">Node-{i.toString().padStart(2, '0')}</span>
                                </div>
                                <span class="text-xs text-gray-400">99.9% Up</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
