import { For, createEffect, Show } from 'solid-js'
import { useChat } from '@langgraph-js/sdk/solid'
import { MessageItem } from './MessageItem'
import { Sparkles } from 'lucide-solid'

export const MessageList = () => {
	const chat = useChat()
	const { renderMessages } = useChat()
	let messagesEndRef: HTMLDivElement | undefined

	const scrollToBottom = () => {
		if (messagesEndRef) {
			messagesEndRef.scrollIntoView({ behavior: 'smooth' })
		}
	}

	createEffect(() => {
		console.log(renderMessages())
		if (chat.renderMessages().length > 0) {
			setTimeout(scrollToBottom, 100)
		}
	})

	return (
		<div class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth">
			{/* Empty State / Welcome */}
			<Show when={chat.renderMessages().length === 0 && !chat.loading?.()}>
				<div class="flex-1 flex flex-col items-center justify-end pb-8 px-8 text-center animate-fadeIn pointer-events-none">
					<div class="glass-panel p-10 rounded-[40px] max-w-lg pointer-events-auto relative overflow-hidden group">
						{/* Background Decorative Light */}
						<div class="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-700" />

						<div class="relative z-10">
							<div class="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20">
								<Sparkles size={32} class="text-white" />
							</div>
							<h1 class="text-3xl font-black text-gray-900 mb-4 tracking-tight">
								How can I help you today?
							</h1>
							<p class="text-gray-500 text-[16px] leading-relaxed font-medium">
								I'm your AI agent, ready to help you browse, analyze, and interact with web pages.
							</p>
						</div>
					</div>
				</div>
			</Show>

			<div class="flex flex-col w-full">
				<For each={chat.renderMessages()}>{(message) => <MessageItem message={message} />}</For>

				{/* Loading State - Cleaner Skeleton */}
				<Show when={chat.loading?.()}>
					<div class="w-full py-8 border-t border-gray-50">
						<div class="max-w-3xl mx-auto px-6 flex gap-5 md:gap-7 animate-pulse">
							<div class="shrink-0 w-9 h-9 rounded-full bg-gray-100" />
							<div class="flex-1 space-y-4 py-1">
								<div class="h-2.5 bg-gray-100 rounded-full w-1/4" />
								<div class="space-y-2">
									<div class="h-2 bg-gray-50 rounded-full" />
									<div class="h-2 bg-gray-50 rounded-full w-5/6" />
								</div>
							</div>
						</div>
					</div>
				</Show>

				<div ref={messagesEndRef} class="h-32 shrink-0" />
			</div>
		</div>
	)
}
