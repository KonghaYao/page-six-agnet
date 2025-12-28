import { createSignal, Show, For, createMemo, onMount, onCleanup } from 'solid-js';
import { ArrowUp, Plus, History, X, Clock } from 'lucide-solid';
import { getExtraPrompt } from './tools';
import { useChat } from '@langgraph-js/sdk/solid';

interface ChatInputProps {
    disabled?: boolean;
}

export const ChatInput = (props: ChatInputProps) => {
    const chat = useChat();
    const [inputValue, setInputValue] = createSignal('');
    const [isComposing, setIsComposing] = createSignal(false);
    const [showHistory, setShowHistory] = createSignal(false);
    const [historySearch, setHistorySearch] = createSignal('');
    let inputRef: HTMLTextAreaElement | undefined;
    let historyPanelRef: HTMLDivElement | undefined;

    const handleSendMessage = (content: string) => {
        chat.sendMessage([{ type: 'human', content }], {
            extraParams: { extraPrompt: getExtraPrompt() },
        });
        setShowHistory(false);
    };

    const handleSubmit = (e?: Event) => {
        e?.preventDefault();
        const message = inputValue().trim();
        if (message && !props.disabled && !isComposing()) {
            handleSendMessage(message);
            setInputValue('');
            if (inputRef) {
                inputRef.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            setShowHistory(false);
        }
    };

    const handleInput = () => {
        if (inputRef) {
            inputRef.style.height = 'auto';
            inputRef.style.height = `${Math.min(inputRef.scrollHeight, 200)}px`;
        }
    };

    const handleSelectHistory = (item: any) => {
        chat.toHistoryChat(item);
        setShowHistory(false);
        setInputValue('');
        if (inputRef) {
            inputRef.blur();
        }
    };

    // Filter history based on search
    const filteredHistory = createMemo(() => {
        const search = historySearch().toLowerCase().trim();
        if (!search) {
            return chat.historyList();
        }
        return chat.historyList().filter((item) => {
            const title = ((item as any).title || item.thread_id || '').toLowerCase();
            return title.includes(search);
        });
    });

    // Close history panel when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
        if (
            historyPanelRef &&
            !historyPanelRef.contains(e.target as Node) &&
            inputRef &&
            !inputRef.contains(e.target as Node) &&
            !(e.target as HTMLElement).closest('button[title="History"]')
        ) {
            setShowHistory(false);
        }
    };

    onMount(() => {
        document.addEventListener('mousedown', handleClickOutside);
    });

    onCleanup(() => {
        document.removeEventListener('mousedown', handleClickOutside);
    });

    return (
        <div class="w-full relative px-2 py-4 flex flex-col items-center pointer-events-none">
            {/* Ambient Aura behind the input with dynamic colors */}
            <div
                class="ambient-aura"
                style={{
                    '--aura-color': props.disabled ? '#10b981' : '#3b82f6',
                    '--aura-color-alt': props.disabled ? '#34d399' : '#8b5cf6',
                    '--aura-color-3': props.disabled ? '#059669' : '#06b6d4',
                    width: '100%',
                    'max-width': '500px',
                    height: '60px',
                }}
            />

            <div class="w-full max-w-xl flex flex-col gap-3 relative">
                {/* History Panel - Above Input */}
                <Show when={showHistory() && chat.historyList().length > 0}>
                    <div
                        ref={historyPanelRef}
                        class="w-full glass-panel rounded-2xl shadow-2xl pointer-events-auto z-50 max-h-[400px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 mb-2"
                    >
                        {/* Search Header */}
                        <div class="px-4 py-3 border-b border-gray-100/50 flex items-center gap-2">
                            <Clock size={16} class="text-gray-400 shrink-0" />
                            <input
                                type="text"
                                class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                                placeholder="Search history..."
                                value={historySearch()}
                                onInput={(e) => setHistorySearch(e.currentTarget.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setShowHistory(false);
                                    }
                                }}
                            />
                            <button
                                onClick={() => setShowHistory(false)}
                                class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* History List */}
                        <div class="flex-1 overflow-y-auto py-1 custom-scrollbar">
                            <Show
                                when={filteredHistory().length > 0}
                                fallback={
                                    <div class="flex flex-col items-center justify-center py-8 px-6 text-gray-400 text-center">
                                        <History size={24} class="mb-2 opacity-50" />
                                        <p class="text-xs font-medium">No matching history</p>
                                    </div>
                                }
                            >
                                <For each={filteredHistory()}>
                                    {(item) => (
                                        <button
                                            class={`w-full flex items-center justify-between px-3 py-1.5 mx-1 my-0.5 rounded-lg text-left transition-all group ${
                                                chat.currentChatId() === item.thread_id
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                            onClick={() => handleSelectHistory(item)}
                                        >
                                            <div class="flex-1 min-w-0 flex items-center gap-2">
                                                <Show when={chat.currentChatId() === item.thread_id}>
                                                    <div class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                                </Show>
                                                <div class="flex-1 min-w-0">
                                                    <div
                                                        class={`text-xs font-medium truncate ${
                                                            chat.currentChatId() === item.thread_id
                                                                ? 'text-blue-700'
                                                                : 'text-gray-700'
                                                        }`}
                                                    >
                                                        {(item as any).title || item.thread_id}
                                                    </div>
                                                </div>
                                                <div class="text-[10px] text-gray-400 shrink-0 ml-2">
                                                    {new Date(
                                                        (item as any).created_at || Date.now(),
                                                    ).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </For>
                            </Show>
                        </div>

                        {/* Footer */}
                        <div class="px-4 py-2 border-t border-gray-100/50 bg-gray-50/30">
                            <div class="text-xs text-gray-500 text-center">
                                {filteredHistory().length}{' '}
                                {filteredHistory().length === 1 ? 'conversation' : 'conversations'}
                            </div>
                        </div>
                    </div>
                </Show>

                {/* Input Form */}
                <div class="w-full flex items-center gap-3">
                    <form
                        class="flex-1 relative flex items-center glass-panel rounded-2xl pointer-events-auto transition-all duration-300 focus-within:scale-[1.02] group"
                        onSubmit={handleSubmit}
                    >
                        {/* History button */}
                        <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory())}
                            class={`absolute left-3 z-10 p-1.5 rounded-lg transition-all duration-200 ${
                                showHistory()
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                            title="History"
                        >
                            <History size={16} />
                        </button>

                        {/* New Chat button */}
                        <button
                            type="button"
                            onClick={() => {
                                chat.createNewChat();
                                setShowHistory(false);
                            }}
                            class="absolute left-11 z-10 p-1.5 rounded-lg transition-all duration-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            title="New Session"
                        >
                            <Plus size={16} />
                        </button>

                        <textarea
                            ref={inputRef}
                            class="w-full min-h-[44px] max-h-[120px] py-3 pl-20 pr-12 bg-transparent border-none resize-none outline-none text-[14px] leading-relaxed text-gray-800 placeholder-gray-400 disabled:opacity-50"
                            placeholder="Ask anything..."
                            value={inputValue()}
                            onInput={(e) => {
                                setInputValue(e.currentTarget.value);
                                handleInput();
                            }}
                            onKeyDown={handleKeyDown}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            disabled={props.disabled}
                            rows={1}
                        />

                        <div class="absolute right-2 flex items-center">
                            <button
                                type="submit"
                                class={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ${
                                    inputValue().trim() && !props.disabled
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                                disabled={!inputValue().trim() || props.disabled}
                            >
                                <ArrowUp size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] opacity-40">
                Page Agent Ready
            </div>
        </div>
    );
};
