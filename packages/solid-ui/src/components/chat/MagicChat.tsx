import { createEffect } from 'solid-js';
import { useChat } from '@langgraph-js/sdk/solid';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { registerTools } from './tools';
import { MagicMessages } from './MagicChatList';

const MagicChatContent = () => {
    const chat = useChat();

    return (
        <div class="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-end font-sans pb-6">
            {/* Subtle Vignette for Atmosphere */}
            <div class="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/5 pointer-events-none" />

            {/* Message History area - Better spacing and fade */}
            <div
                class="w-full max-w-4xl flex flex-col justify-end overflow-hidden pointer-events-none relative z-10 max-h-[70vh] mb-4"
                style={{
                    'mask-image': 'linear-gradient(to bottom, transparent, black 15%)',
                    '-webkit-mask-image': 'linear-gradient(to bottom, transparent, black 15%)',
                }}
            >
                {/* Actual scrollable list is interactive */}
                <div class="pointer-events-auto overflow-y-auto px-4 custom-scrollbar">
                    <MagicMessages />
                </div>
            </div>

            {/* Bottom Action Bar - Simplified as the button is now inside ChatInput */}
            <div class="w-full max-w-4xl flex items-center justify-center px-6 pointer-events-auto relative z-20">
                <div class="flex-1 max-w-3xl">
                    <ChatInput disabled={chat.loading?.()} />
                </div>
            </div>
        </div>
    );
};

export const MagicChat = () => {
    const { client, setTools } = useChat();

    createEffect(() => {
        const currentClient = client();
        if (currentClient) {
            setTools(registerTools() as any);
        }
    });

    return <MagicChatContent />;
};
