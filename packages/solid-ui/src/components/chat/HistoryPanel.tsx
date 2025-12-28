import { Show, For } from 'solid-js';
import { X, Trash2, MessageSquare, Plus } from 'lucide-solid';
import { useChat } from '@langgraph-js/sdk/solid';

export const HistoryPanel = () => {
    const chat = useChat();

    return (
        <Show when={chat.showHistory()}>
            <div class="absolute inset-y-0 left-0 w-[280px] z-30 flex flex-col bg-white border-r border-gray-100 shadow-2xl animate-in slide-in-from-left duration-300">
                <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <h3 class="m-0 text-sm font-bold text-gray-900 uppercase tracking-tight">History</h3>
                    <button
                        class="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => chat.toggleHistoryVisible()}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto py-2">
                    <Show
                        when={chat.historyList().length > 0}
                        fallback={
                            <div class="flex flex-col items-center justify-center py-12 px-6 text-gray-400 text-center">
                                <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <MessageSquare size={20} />
                                </div>
                                <p class="text-xs font-medium">No history yet</p>
                            </div>
                        }
                    >
                        <For each={chat.historyList()}>
                            {(item) => (
                                <div
                                    class={`flex items-center px-4 py-3 mx-2 my-0.5 rounded-xl cursor-pointer transition-all group ${
                                        chat.currentChatId() === item.thread_id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => chat.toHistoryChat(item)}
                                >
                                    <div class="flex-1 min-w-0">
                                        <div
                                            class={`text-sm font-medium truncate ${
                                                chat.currentChatId() === item.thread_id
                                                    ? 'text-blue-700'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {(item as any).title || item.thread_id}
                                        </div>
                                    </div>
                                    <button
                                        class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            chat.deleteHistoryChat(item);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </For>
                    </Show>
                </div>

                <div class="p-4 bg-gray-50/50 border-t border-gray-100">
                    <button
                        class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-200"
                        onClick={() => {
                            chat.createNewChat();
                        }}
                    >
                        <Plus size={16} />
                        New Chat
                    </button>
                </div>
            </div>
        </Show>
    );
};
