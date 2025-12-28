import { createEffect, Show, createSignal } from 'solid-js';
import { ChatProvider, useChat } from '@langgraph-js/sdk/solid';
import { ChatInput } from './ChatInput';
import { registerTools } from './tools';
import { MagicMessages } from './MagicChatList';

const MagicChatContent = () => {
    const chat = useChat();
    const { client, setTools } = useChat();
    const [isInputHovered, setIsInputHovered] = createSignal(false);

    createEffect(() => {
        const currentClient = client();
        if (currentClient) {
            setTools(registerTools() as any);
        }
    });

    return (
        <div class="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-end font-sans pb-6">
            {/* Subtle Vignette for Atmosphere */}
            <div class="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/5 pointer-events-none" />

            {/* Message History area - Better spacing and fade */}
            <div
                class={`w-full max-w-xl flex flex-col justify-end overflow-hidden pointer-events-auto relative z-10 transition-all duration-500 ease-in-out px-3 glass-panel rounded-2xl border-0 shadow-sm ${
                    isInputHovered() ? 'max-h-[30vh]' : 'max-h-[10vh]'
                }`}
                onMouseEnter={() => setIsInputHovered(true)}
                onMouseLeave={() => setIsInputHovered(false)}
            >
                <Show when={chat.loading()}>
                    <div class="absolute -top-px left-4 right-4 h-[4px] overflow-hidden rounded-sm">
                        <div class="w-full h-full bg-emerald-500/20 rounded-full">
                            <div class="w-1/3 h-full bg-emerald-500 animate-[loading_1.5s_infinite_ease-in-out] rounded-full" />
                        </div>
                    </div>
                </Show>
                {/* Actual scrollable list is interactive */}
                <div class="pointer-events-auto overflow-y-auto custom-scrollbar no-scroll-bar">
                    <MagicMessages />
                </div>
            </div>

            {/* Bottom Action Bar - Simplified as the button is now inside ChatInput */}
            <div
                class="w-full max-w-xl flex items-center justify-center pointer-events-auto relative z-20"
                onMouseEnter={() => setIsInputHovered(true)}
                onMouseLeave={() => setIsInputHovered(false)}
            >
                <div class="flex-1 max-w-xl">
                    <ChatInput disabled={chat.loading?.()} />
                </div>
            </div>
        </div>
    );
};

export const MagicChat = () => {
    return (
        <ChatProvider
            apiUrl={new URL('/api/langgraph', location as any as string).toString()}
            showHistory={false}
            fallbackToAvailableAssistants={true}
        >
            <MagicChatContent />
        </ChatProvider>
    );
};
