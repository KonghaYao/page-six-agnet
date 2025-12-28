import { createSignal, createEffect } from 'solid-js';
import { useChat } from '@langgraph-js/sdk/solid';
import { SettingsPanel } from './SettingsPanel';
import { HistoryPanel } from './HistoryPanel';
import { registerTools } from './tools';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

const ChatMessages = () => {
    const chat = useChat();
    const [showSettings, setShowSettings] = createSignal(false);

    return (
        <div class="relative h-full flex bg-white overflow-hidden w-full font-sans text-gray-900">
            {/* Left Sidebar - History (Absolute Overlay) */}
            <HistoryPanel />

            {/* Main Chat Area */}
            <div class="relative flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
                <ChatHeader
                    showHistory={chat.showHistory()}
                    onToggleHistory={() => chat.toggleHistoryVisible()}
                    showSettings={showSettings()}
                    onToggleSettings={() => setShowSettings(!showSettings())}
                />

                <main class="flex-1 relative flex flex-col overflow-hidden">
                    <MessageList />

                    <div class="absolute bottom-0 left-0 right-0 z-10 w-full">
                        <ChatInput disabled={chat.loading?.()} />
                    </div>
                </main>
            </div>

            {/* Right Sidebar - Settings (Absolute Overlay) */}
            <SettingsPanel isOpen={showSettings()} onClose={() => setShowSettings(false)} />
        </div>
    );
};

export const Chat = () => {
    const { client, setTools } = useChat();

    createEffect(() => {
        const currentClient = client();
        if (currentClient) {
            setTools(registerTools() as any);
        }
    });

    return <ChatMessages />;
};
