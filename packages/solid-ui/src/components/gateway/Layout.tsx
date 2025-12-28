import type { ParentProps } from 'solid-js'
import {
	LayoutDashboard,
	Route,
	Activity,
	Settings,
	ShieldCheck,
	Bell,
	Search,
	User,
} from 'lucide-solid'

interface LayoutProps extends ParentProps {
	currentTab: string
	setTab: (tab: string) => void
}

export const Layout = (props: LayoutProps) => {
	const menuItems = [
		{ id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
		{ id: 'routes', label: '路由管理', icon: Route },
		{ id: 'logs', label: '访问日志', icon: Activity },
		{ id: 'settings', label: '系统设置', icon: Settings },
	]

	return (
		<div class="flex h-screen bg-gray-50 text-gray-900 font-sans">
			{/* Sidebar */}
			<aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
				<div class="p-6 flex items-center gap-3">
					<div class="bg-blue-600 p-2 rounded-lg">
						<ShieldCheck class="w-6 h-6 text-white" />
					</div>
					<h1 class="font-bold text-xl tracking-tight">AI Gateway</h1>
				</div>

				<nav class="flex-1 px-4 py-4 space-y-1">
					{menuItems.map((item) => (
						<button
							onClick={() => props.setTab(item.id)}
							class={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
								props.currentTab === item.id
									? 'bg-blue-50 text-blue-600'
									: 'text-gray-600 hover:bg-gray-100'
							}`}
						>
							<item.icon class="w-5 h-5" />
							<span class="font-medium">{item.label}</span>
						</button>
					))}
				</nav>

				<div class="p-4 border-t border-gray-100">
					<div class="flex items-center gap-3 px-3 py-2 text-gray-600 cursor-pointer hover:bg-gray-50 rounded-md">
						<User class="w-5 h-5" />
						<span class="font-medium text-sm">管理员账户</span>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<div class="flex-1 flex flex-col overflow-hidden">
				{/* Header */}
				<header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
					<div class="flex items-center gap-4 bg-gray-100 px-3 py-1.5 rounded-full w-96">
						<Search class="w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="搜索路由、日志..."
							class="bg-transparent border-none outline-none text-sm w-full"
						/>
					</div>

					<div class="flex items-center gap-4">
						<button class="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
							<Bell class="w-5 h-5" />
							<span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
						</button>
						<div class="h-8 w-px bg-gray-200"></div>
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
								AD
							</div>
						</div>
					</div>
				</header>

				{/* Content Area */}
				<main class="flex-1 overflow-y-auto p-8">{props.children}</main>
			</div>
		</div>
	)
}
