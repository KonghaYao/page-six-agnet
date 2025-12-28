import { History, Settings, ChevronDown } from 'lucide-solid'

interface ChatHeaderProps {
	showHistory: boolean
	onToggleHistory: () => void
	showSettings: boolean
	onToggleSettings: () => void
	title?: string
}

export const ChatHeader = (props: ChatHeaderProps) => {
	return (
		<header class="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
			<div class="flex items-center gap-2">
				<button 
					onClick={props.onToggleHistory}
					class={`p-2 rounded-lg transition-colors ${
						props.showHistory ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
					}`}
				>
					<History size={20} />
				</button>
				
				<div class="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
					<span class="font-semibold text-[15px] text-gray-800">{props.title || 'Page Agent'}</span>
					<ChevronDown size={14} class="text-gray-400 group-hover:text-gray-600" />
				</div>
			</div>

			<div class="flex items-center gap-2">
				<button 
					onClick={props.onToggleSettings}
					class={`p-2 rounded-lg transition-colors ${
						props.showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
					}`}
				>
					<Settings size={20} />
				</button>
			</div>
		</header>
	)
}
