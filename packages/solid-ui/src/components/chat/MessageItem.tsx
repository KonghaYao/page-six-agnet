import { Show, For, createSignal } from 'solid-js';
import { Copy, Check } from 'lucide-solid';
import { getMessageContent, ToolRenderData, type RenderMessage } from '@langgraph-js/sdk';
import { useChat } from '@langgraph-js/sdk/solid';

interface MessageItemProps {
    message: RenderMessage;
    invisible?: boolean;
}

const CopyButton = (props: { onCopy: () => void; copied: boolean; isHuman: boolean }) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            props.onCopy();
        }}
        class={`absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            props.isHuman
                ? 'hover:bg-blue-500 text-blue-200 hover:text-white'
                : 'hover:bg-gray-50 text-gray-300 hover:text-emerald-500'
        }`}
        title="Copy"
    >
        {props.copied ? (
            <Check size={12} class={props.isHuman ? 'text-white' : 'text-emerald-500'} />
        ) : (
            <Copy size={12} />
        )}
    </button>
);

const RoleIndicator = (props: { role: string; isHuman: boolean; dotColor?: string }) => (
    <div
        class={`flex items-center mb-1 gap-2 transition-opacity duration-300 ${
            props.isHuman ? 'flex-row-reverse' : ''
        }`}
    >
        <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">{props.role}</span>
        <Show when={!props.isHuman}>
            <div class={`w-1 h-1 rounded-full ${props.dotColor || 'bg-gray-300'}`} />
        </Show>
    </div>
);

const HumanMessage = (props: { message: RenderMessage; copied: boolean; onCopy: () => void }) => (
    <div class="max-w-4xl mx-auto px-6 flex flex-col items-end relative">
        <RoleIndicator role="Human" isHuman={true} />
        <div class="relative px-4 py-2.5 rounded-xl transition-all duration-300 border group-hover:-translate-y-px bg-blue-600 text-white border-blue-500 rounded-tr-none">
            <div class="prose prose-sm max-w-none text-[13.5px] font-medium leading-normal whitespace-pre-wrap wrap-break-word text-blue-50 selection:bg-blue-400">
                {getMessageContent(props.message.content)}
            </div>
            <CopyButton onCopy={props.onCopy} copied={props.copied} isHuman={true} />
        </div>
    </div>
);

const AIMessage = (props: { message: RenderMessage; copied: boolean; onCopy: () => void }) => (
    <div class="max-w-4xl mx-auto px-6 flex flex-col items-start relative">
        <RoleIndicator role="Agent" isHuman={false} dotColor="bg-emerald-500" />
        <div
            class="relative px-4 py-2.5 rounded-xl transition-all duration-300 border group-hover:-translate-y-px bg-white/70 backdrop-blur-lg border-gray-100 text-gray-800 rounded-tl-none"
            style={{
                'backdrop-filter': 'blur(12px)',
                '-webkit-backdrop-filter': 'blur(12px)',
            }}
        >
            <div class="prose prose-sm max-w-none text-[13.5px] font-medium leading-normal whitespace-pre-wrap wrap-break-word text-gray-700 selection:bg-emerald-50">
                {getMessageContent(props.message.content)}
            </div>

            <Show when={(props.message as any).tool_calls?.length > 0}>
                <div class="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-gray-50">
                    <For each={(props.message as any).tool_calls}>
                        {(toolCall: any) => (
                            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-50 rounded-md transition-colors cursor-default">
                                <div class="w-1 h-1 rounded-full bg-emerald-400" />
                                <span class="text-[9px] font-bold text-gray-400 hover:text-emerald-600 uppercase tracking-tight">
                                    {toolCall.name}
                                </span>
                            </div>
                        )}
                    </For>
                </div>
            </Show>

            <CopyButton onCopy={props.onCopy} copied={props.copied} isHuman={false} />
        </div>
    </div>
);

const ToolMessage = (props: {
    message: RenderMessage;
    copied: boolean;
    onCopy: () => void;
    getToolUIRender: (name: string) => any;
    currentStatus: () => string;
}) => (
    <div class="max-w-4xl mx-auto px-6 flex flex-col items-start relative">
        <RoleIndicator role="Process" isHuman={false} dotColor="bg-amber-400" />
        <div
            class="relative px-4 py-2.5 rounded-xl transition-all duration-300 border group-hover:-translate-y-px bg-white/70 backdrop-blur-lg border-gray-100 text-gray-800 rounded-tl-none"
            style={{
                'backdrop-filter': 'blur(12px)',
                '-webkit-backdrop-filter': 'blur(12px)',
            }}
        >
            <div class="prose prose-sm max-w-none text-[13.5px] font-medium leading-normal whitespace-pre-wrap wrap-break-word text-gray-700 selection:bg-emerald-50">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                        <span class="text-gray-900 font-bold tracking-tight">
                            {props.message.name || 'Unknown Tool'}
                        </span>
                        <div
                            class={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                (props.message as any).status === 'error'
                                    ? 'bg-red-50 text-red-500'
                                    : 'bg-emerald-50 text-emerald-600'
                            }`}
                        >
                            {(props.message as any).status || 'Success'}
                        </div>
                    </div>

                    <div class="text-[11px] text-gray-400 font-normal leading-tight italic">
                        {
                            new ToolRenderData<{ description: string }, {}>(
                                props.message,
                                null as any,
                            ).getInputRepaired()?.description
                        }
                    </div>
                </div>
            </div>
            <CopyButton onCopy={props.onCopy} copied={props.copied} isHuman={false} />
        </div>

        <Show when={props.message.name && props.currentStatus() === 'interrupted'}>
            {props.getToolUIRender(props.message.name!)(props.message)}
        </Show>
    </div>
);

export const MessageItem = (props: MessageItemProps) => {
    const { getToolUIRender, currentStatus } = useChat();
    const [copied, setCopied] = createSignal(false);

    const handleCopy = () => {
        const content = getMessageContent(props.message.content);
        if (content) {
            navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div class={'group w-full py-2.5 transition-all ' + (props.invisible ? 'hidden' : '')}>
            <Show when={props.message.type === 'human'}>
                <HumanMessage message={props.message} copied={copied()} onCopy={handleCopy} />
            </Show>
            <Show when={props.message.type === 'ai'}>
                <AIMessage message={props.message} copied={copied()} onCopy={handleCopy} />
            </Show>
            <Show when={props.message.type === 'tool'}>
                <ToolMessage
                    message={props.message}
                    copied={copied()}
                    onCopy={handleCopy}
                    getToolUIRender={getToolUIRender}
                    currentStatus={currentStatus}
                />
            </Show>
        </div>
    );
};
