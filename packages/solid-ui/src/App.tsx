import { MagicChat } from './components/chat'
import { Gateway } from './components/gateway'
import { ChatProvider } from '@langgraph-js/sdk/solid'

function App() {
	return (
		<div class="h-screen w-full relative bg-gray-50">
			{/* Main Content: Gateway System */}
			<Gateway />

			{/* Magic AI Assistant (Bottom Centered) */}
			<ChatProvider
				apiUrl={new URL('/api/langgraph', location as any as string).toString()}
				showHistory={false}
				fallbackToAvailableAssistants={true}
			>
				<MagicChat />
			</ChatProvider>
		</div>
	)
}

export default App
