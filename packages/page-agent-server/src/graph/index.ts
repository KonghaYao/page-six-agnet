import { MessagesAnnotation, START, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { ask_user_with_options_config, humanInTheLoopMiddleware } from '@langgraph-js/auk';
import { AIMessage, BaseMessage, createAgent } from 'langchain';

import { system_prompt } from '../prompt/system_prompt';
import { execute_javascript, get_browser_state } from '../tools/excute-js';

const State = MessagesAnnotation;

const workflow = async (state: any) => {
    const agent = createAgent({
        model: new ChatOpenAI({
            model: 'qwen-plus',
            useResponsesApi: false,
        }),
        systemPrompt: system_prompt,
        tools: [execute_javascript, get_browser_state],
        middleware: [
            humanInTheLoopMiddleware({
                interruptOn: {
                    ...ask_user_with_options_config.interruptOn,
                    execute_javascript: {
                        allowedDecisions: ['respond', 'reject'],
                    },
                    get_browser_state: {
                        allowedDecisions: ['respond', 'reject'],
                    },
                },
            }),
        ],
        stateSchema: State,
    });
    const response = await agent.invoke(state);
    return response;
};

export const graph = new StateGraph(State).addNode('workflow', workflow).addEdge(START, 'workflow').compile();
