import { createSignal, Show } from 'solid-js';
import { X, Maximize2, Minimize2, Sparkles, Bot, MessageCircle } from 'lucide-solid';
import { ChatProvider } from '@langgraph-js/sdk/solid';
import { Chat } from './Chat';

export const FloatingChat = () => {
    const [isOpen, setIsOpen] = createSignal(true);
    const [isMaximized, setIsMaximized] = createSignal(false);

    const toggleChat = () => setIsOpen(!isOpen());
    const toggleMaximize = () => setIsMaximized(!isMaximized());

    return (
        <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            {/* Chat Window */}
            <Show when={isOpen()}>
                <div
                    class={`bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden border border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
                        isMaximized()
                            ? 'fixed inset-4 w-auto h-auto z-[60]'
                            : 'w-[440px] h-[700px] max-h-[calc(100vh-120px)]'
                    }`}
                >
                    {/* Internal Header for Floating Window Control */}
                    <div class="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
                        <div class="flex items-center gap-2.5">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-sm">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-gray-900 leading-none mb-1">AI Assistant</h3>
                                <div class="flex items-center gap-1.5">
                                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span class="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-1">
                            <button
                                onClick={toggleMaximize}
                                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                title={isMaximized() ? 'Exit Fullscreen' : 'Fullscreen'}
                            >
                                {isMaximized() ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button
                                onClick={toggleChat}
                                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Content */}
                    <div class="flex-1 overflow-hidden relative bg-gray-50/30">
                        <ChatProvider
                            apiUrl={new URL('/api/langgraph', location as any as string).toString()}
                            showHistory={false}
                            fallbackToAvailableAssistants={true}
                        >
                            <Chat />
                        </ChatProvider>
                    </div>
                </div>
            </Show>

            {/* Floating Toggle Button */}
            <button
                onClick={toggleChat}
                class={`group relative flex items-center justify-center w-16 h-16 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all duration-500 ${
                    isOpen()
                        ? 'bg-gray-900 rotate-90 scale-90 rounded-full'
                        : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:scale-95'
                }`}
            >
                <Show
                    when={isOpen()}
                    fallback={
                        <div class="relative">
                            <MessageCircle class="text-white w-7 h-7" />
                            <Sparkles
                                class="text-yellow-200 w-4 h-4 absolute -top-2 -right-2 animate-pulse"
                                fill="currentColor"
                            />
                        </div>
                    }
                >
                    <X class="text-white w-6 h-6" />
                </Show>

                {/* Notification Badge */}
                <Show when={!isOpen()}>
                    <span class="absolute -top-1.5 -right-1.5 flex h-6 w-6">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-6 w-6 bg-red-500 border-2 border-white text-[11px] font-bold text-white items-center justify-center">
                            1
                        </span>
                    </span>
                </Show>

                {/* Hover Label */}
                <Show when={!isOpen()}>
                    <div class="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                        Need help? Chat with AI
                        <div class="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                </Show>
            </button>
        </div>
    );
};
