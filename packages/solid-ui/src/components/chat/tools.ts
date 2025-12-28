import { PageAgentContext } from '../../../../page-agent-server/src/frontend';
export const pageAgent = new PageAgentContext({});
console.log(pageAgent);
pageAgent.initShortcuts();
export const registerTools = () => {
    return [...pageAgent.initTools()];
};
export const getExtraPrompt = () => {
    return pageAgent.toShortcutUsagePrompt();
};
