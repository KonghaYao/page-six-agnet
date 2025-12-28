import { createUITool, ToolManager } from '@langgraph-js/sdk';
import { PageAgentContext } from '.';
import z from 'zod';

const sleep = (seconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const createExecuteJSTool = (client: PageAgentContext) => {
    return createUITool({
        name: 'execute_javascript',
        description: '',
        parameters: {
            js_code: z.string(),
            wait_after_run: z.number().optional().default(2),
            wait_before_run: z.number().optional().default(0),
        },
        handler: ToolManager.waitForUIDone,
        onlyRender: false,
        render(tool) {
            if (
                tool.client.status === 'interrupted' &&
                tool.state === 'interrupted' &&
                tool.getInputRepaired().js_code
            ) {
                (async () => {
                    try {
                        /** TODO 这里非常危险 */
                        const code = `(()=>{
const console = globalThis.console;
${tool.getInputRepaired().js_code!}
return main;
})()`;
                        console.log(code);
                        await sleep(tool.getInputRepaired().wait_before_run!);
                        const mainFunction = eval(code);
                        const actionResult = await mainFunction(client.toSafeJSObject());
                        console.log(actionResult);
                        await sleep(tool.getInputRepaired().wait_after_run!);
                        if (actionResult === undefined) {
                            tool.sendResumeData({ type: 'respond', message: 'Action result is undefined' });
                        }
                        tool.sendResumeData({ type: 'respond', message: JSON.stringify(actionResult) });
                    } catch (e) {
                        console.error(e);
                        tool.sendResumeData({ type: 'reject', message: (e as Error).message });
                    }
                })();
            }
            return false;
        },
    });
};

export const createGetBrowserStateTool = (client: PageAgentContext) => {
    return createUITool({
        name: 'get_browser_state',
        description: '',
        parameters: {
            description: z.string(),
        },
        handler: ToolManager.waitForUIDone,
        onlyRender: false,
        async render(tool) {
            if (
                tool.client.status === 'interrupted' &&
                tool.state === 'interrupted' &&
                tool.getInputRepaired().description
            ) {
                /** @ts-ignore */
                const browserState = await client.toSafeJSObject().shortcuts.getBrowserState();
                tool.sendResumeData({ type: 'respond', message: browserState });
            }
            return false;
        },
    });
};
