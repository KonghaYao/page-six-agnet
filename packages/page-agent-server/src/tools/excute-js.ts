import { tool } from 'langchain';
import { z } from 'zod';

export const execute_javascript = tool(
    () => {
        return '';
    },
    {
        name: 'execute_javascript',
        description: `Execute JavaScript code on the current page. Supports async/await syntax. Use with caution!
Your js code must contain a main function.


example:

async function main(context) {
	// all your logic code here
	// you can use shortcut in context
	const log = ""
	log += "Hello world"
	return log
}
			`,
        schema: z.object({
            description: z.string().describe('what you want to do'),
            js_code: z.string(),
            wait_after_run: z.number().optional().default(2).describe('wait for x seconds after running the code'),
            wait_before_run: z.number().optional().default(0).describe('wait for x seconds before running the code'),
        }),
    },
);

export const get_browser_state = tool(
    () => {
        return '';
    },
    {
        name: 'get_browser_state',
        description: `Get the browser state.`,
        schema: z.object({
            description: z.string().describe('what you want to do'),
        }),
    },
);
