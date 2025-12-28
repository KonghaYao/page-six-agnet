import { createSignal, onMount, onCleanup, Show } from 'solid-js'
import { Save, RefreshCcw, Shield, Network, Database, Lock } from 'lucide-solid'
import { useDatabase } from '../db/useDatabase'
import { subscribeSettings, updateSettings, resetSettings } from '../db/settings'
import type { Settings as SettingsType } from '../db/types'

export const Settings = () => {
	useDatabase()
	const [settings, setSettings] = createSignal<SettingsType | null>(null)
	const [loading, setLoading] = createSignal(false)
	const [saving, setSaving] = createSignal(false)

	let unsubscribe: (() => void) | null = null

	onMount(async () => {
		unsubscribe = await subscribeSettings((settingsData) => {
			setSettings(settingsData)
		})
	})

	onCleanup(() => {
		if (unsubscribe) {
			unsubscribe()
		}
	})

	const handleSave = async () => {
		const currentSettings = settings()
		if (!currentSettings) return

		setSaving(true)
		try {
			await updateSettings({
				gatewayName: currentSettings.gatewayName,
				timeout: currentSettings.timeout,
				maxRetries: currentSettings.maxRetries,
				enableAuth: currentSettings.enableAuth,
				logLevel: currentSettings.logLevel,
				rateLimitEnabled: currentSettings.rateLimitEnabled,
				rateLimitPerSecond: currentSettings.rateLimitPerSecond,
			})
			alert('设置已保存')
		} catch (error) {
			console.error('保存设置失败:', error)
			alert('保存设置失败')
		} finally {
			setSaving(false)
		}
	}

	const handleReset = async () => {
		if (!confirm('确定要恢复默认设置吗？')) {
			return
		}
		setLoading(true)
		try {
			await resetSettings()
			alert('已恢复默认设置')
		} catch (error) {
			console.error('重置设置失败:', error)
			alert('重置设置失败')
		} finally {
			setLoading(false)
		}
	}

	const updateField = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
		const current = settings()
		if (current) {
			setSettings({ ...current, [key]: value })
		}
	}

	const toggleSwitch = (key: keyof SettingsType) => {
		const current = settings()
		if (current) {
			updateField(key, !current[key])
		}
	}

	const currentSettings = () => settings()

	return (
		<div class="max-w-4xl space-y-8">
			<div>
				<h2 class="text-2xl font-bold text-gray-900">系统设置</h2>
				<p class="text-gray-500">配置网关核心参数及安全性选项</p>
			</div>

			<Show when={currentSettings()}>
				<div class="space-y-6">
					{/* Basic Settings */}
					<section class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<div class="p-6 border-b border-gray-100 flex items-center gap-3">
							<Network class="w-5 h-5 text-blue-600" />
							<h3 class="font-bold text-gray-900">核心配置</h3>
						</div>
						<div class="p-6 space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="space-y-2">
									<label class="text-sm font-medium text-gray-700">网关名称</label>
									<input
										type="text"
										value={currentSettings()!.gatewayName}
										onInput={(e) => updateField('gatewayName', e.currentTarget.value)}
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
									/>
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-gray-700">默认超时 (ms)</label>
									<input
										type="number"
										value={currentSettings()!.timeout}
										onInput={(e) => updateField('timeout', parseInt(e.currentTarget.value) || 0)}
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
									/>
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-gray-700">最大重试次数</label>
									<input
										type="number"
										value={currentSettings()!.maxRetries}
										onInput={(e) => updateField('maxRetries', parseInt(e.currentTarget.value) || 0)}
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
									/>
								</div>
								<div class="space-y-2">
									<label class="text-sm font-medium text-gray-700">日志级别</label>
									<select
										value={currentSettings()!.logLevel}
										onChange={(e) =>
											updateField('logLevel', e.currentTarget.value as SettingsType['logLevel'])
										}
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
									>
										<option value="debug">Debug</option>
										<option value="info">Info</option>
										<option value="warn">Warn</option>
										<option value="error">Error</option>
									</select>
								</div>
							</div>
						</div>
					</section>

					{/* Security Settings */}
					<section class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<div class="p-6 border-b border-gray-100 flex items-center gap-3">
							<Shield class="w-5 h-5 text-emerald-600" />
							<h3 class="font-bold text-gray-900">安全选项</h3>
						</div>
						<div class="p-6 space-y-6">
							<div class="flex items-center justify-between">
								<div>
									<div class="font-medium text-gray-900">启用身份验证</div>
									<div class="text-sm text-gray-500">所有传入请求都必须携带合法的 API Key</div>
								</div>
								<button
									onClick={() => toggleSwitch('enableAuth')}
									class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
										currentSettings()!.enableAuth ? 'bg-blue-600' : 'bg-gray-200'
									}`}
								>
									<span
										class={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
											currentSettings()!.enableAuth ? 'translate-x-6' : 'translate-x-1'
										}`}
									/>
								</button>
							</div>

							<div class="flex items-center justify-between">
								<div>
									<div class="font-medium text-gray-900">限流保护 (Rate Limiting)</div>
									<div class="text-sm text-gray-500">开启后将根据配置限制每秒请求数</div>
								</div>
								<button
									onClick={() => toggleSwitch('rateLimitEnabled')}
									class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
										currentSettings()!.rateLimitEnabled ? 'bg-blue-600' : 'bg-gray-200'
									}`}
								>
									<span
										class={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
											currentSettings()!.rateLimitEnabled ? 'translate-x-6' : 'translate-x-1'
										}`}
									/>
								</button>
							</div>

							<Show when={currentSettings()!.rateLimitEnabled}>
								<div class="pl-4 border-l-2 border-blue-200">
									<label class="text-sm font-medium text-gray-700">每秒请求限制</label>
									<input
										type="number"
										value={currentSettings()!.rateLimitPerSecond}
										onInput={(e) =>
											updateField('rateLimitPerSecond', parseInt(e.currentTarget.value) || 0)
										}
										class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
									/>
								</div>
							</Show>
						</div>
					</section>

					{/* Action Buttons */}
					<div class="flex items-center justify-end gap-3 pt-4">
						<button
							onClick={handleReset}
							disabled={loading()}
							class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<RefreshCcw class="w-4 h-4" />
							<span>恢复默认</span>
						</button>
						<button
							onClick={handleSave}
							disabled={saving()}
							class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Save class="w-4 h-4" />
							<span>{saving() ? '保存中...' : '保存更改'}</span>
						</button>
					</div>
				</div>
			</Show>

			<Show when={!currentSettings()}>
				<div class="p-12 text-center text-gray-500">加载设置中...</div>
			</Show>
		</div>
	)
}
