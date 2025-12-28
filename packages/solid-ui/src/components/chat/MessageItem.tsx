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
    <div class={`flex items-center   gap-2 ${props.isHuman ? 'flex-row-reverse' : ''}`}>
        <div class={`w-1.5 h-1.5 rounded-full ${props.dotColor || 'bg-gray-300'}`} />
        <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{props.role}</span>
    </div>
);

const HumanMessage = (props: { message: RenderMessage; copied: boolean; onCopy: () => void }) => (
    <div class="w-full flex flex-col items-start group">
        <RoleIndicator role="Human" isHuman={false} dotColor="bg-blue-400" />
        <div class="w-full pl-3.5 border-l-2 border-blue-500/20 ml-0.5 ">
            <div class="relative py-1">
                <div class="text-[13px] font-medium leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
                    {getMessageContent(props.message.content)}
                </div>
                <CopyButton onCopy={props.onCopy} copied={props.copied} isHuman={true} />
            </div>
        </div>
    </div>
);

const AIMessage = (props: { message: RenderMessage; copied: boolean; onCopy: () => void }) => (
    <div class="w-full flex flex-col items-start group">
        <RoleIndicator role="Agent" isHuman={false} dotColor="bg-emerald-500" />
        <div class="w-full pl-3.5 border-l-2 border-emerald-500/20 ml-0.5">
            <div class="relative py-1">
                <div class="text-[13.5px] font-medium leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
                    {getMessageContent(props.message.content).trim()}
                </div>
                <CopyButton onCopy={props.onCopy} copied={props.copied} isHuman={false} />
            </div>
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
    <div class="w-full flex flex-col items-start group ">
        <div
            class={
                'w-full pl-3.5 border-l-2 ml-0.5 ' +
                ((props.message as any).status === 'error' ? 'border-red-500/20' : 'border-emerald-500/20')
            }
        >
            <div class="relative flex items-center gap-2 py-1.5  rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all group-hover:border-gray-200">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <span class="text-[9px] font-semibold uppercase tracking-widest bg-emerald-500 text-white rounded px-1.5 py-0.5 shrink-0 mr-2">
                        {props.message.name || 'Tool'}
                    </span>
                    <span class="text-[12px] text-gray-500 truncate italic">
                        {
                            new ToolRenderData<{ description: string }, {}>(
                                props.message,
                                null as any,
                            ).getInputRepaired()?.description
                        }
                    </span>
                </div>
                <CopyButton onCopy={props.onCopy} copied={props.copied} isHuman={false} />
            </div>

            <Show when={props.message.name && props.currentStatus() === 'interrupted'}>
                <div class="mt-2 w-full pl-2 border-l-2 border-emerald-100">
                    {props.getToolUIRender(props.message.name!)(props.message)}
                </div>
            </Show>
        </div>
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
        <div class={'group w-full transition-all  ' + (props.invisible ? 'hidden' : '')}>
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
