import { For, createEffect, Show, createMemo } from 'solid-js'
import { useChat } from '@langgraph-js/sdk/solid'
import { MessageItem } from './MessageItem'
import { Sparkles } from 'lucide-solid'

export const MagicMessages = () => {
	const { renderMessages } = useChat()

	createEffect(() => {
		console.log(renderMessages())
	})
	const lastHumanMessage = createMemo(() => {
		return renderMessages().findLast((message) => message.type === 'human')
	})

	return (
		<div class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth">
			<div class="flex flex-col w-full">
				<For each={[...renderMessages()].reverse()}>
					{(message, index) => (
						<MessageItem
							message={message}
							invisible={!(lastHumanMessage() === message || index() === 0)}
						/>
					)}
				</For>
			</div>
		</div>
	)
}
