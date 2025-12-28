import { For, createEffect, createMemo } from 'solid-js';
import { useChat } from '@langgraph-js/sdk/solid';
import { MessageItem } from './MessageItem';

export const MagicMessages = () => {
    const { renderMessages } = useChat();

    createEffect(() => {
        console.log(renderMessages());
    });
    const lastHumanMessage = createMemo(() => {
        return renderMessages().findLast((message) => message.type === 'human');
    });

    return (
        <div class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth">
            {renderMessages().length && (
                <div class="flex flex-col w-full py-4 px-4">
                    <For each={[...renderMessages()].reverse()}>
                        {(message, index) => <MessageItem message={message} />}
                    </For>
                </div>
            )}
        </div>
    );
};
