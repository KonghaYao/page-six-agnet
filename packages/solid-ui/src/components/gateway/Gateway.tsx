import { createSignal, Switch, Match, onMount } from 'solid-js'
import { Layout } from './Layout'
import { Dashboard } from './pages/Dashboard'
import { Routes } from './pages/Routes'
import { Logs } from './pages/Logs'
import { Settings } from './pages/Settings'

// 在开发模式下加载数据注入工具
if (import.meta.env.DEV) {
	import('./db/seed-browser')
}

export const Gateway = () => {
	const [currentTab, setCurrentTab] = createSignal('dashboard')

	return (
		<Layout currentTab={currentTab()} setTab={setCurrentTab}>
			<Switch>
				<Match when={currentTab() === 'dashboard'}>
					<Dashboard />
				</Match>
				<Match when={currentTab() === 'routes'}>
					<Routes />
				</Match>
				<Match when={currentTab() === 'logs'}>
					<Logs />
				</Match>
				<Match when={currentTab() === 'settings'}>
					<Settings />
				</Match>
			</Switch>
		</Layout>
	)
}
