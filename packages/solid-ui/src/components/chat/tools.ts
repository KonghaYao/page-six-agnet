import {
	PageAgentContext,
	ClickElementByIndexShortcut,
	GetPageInfoShortcut,
	FillInputShortcut,
} from '../../../../page-agent-server/src/frontend'
export const pageAgent = new PageAgentContext({})
console.log(pageAgent)
pageAgent.addShortcuts([ClickElementByIndexShortcut, GetPageInfoShortcut, FillInputShortcut])
export const registerTools = () => {
	return [...pageAgent.initTools()]
}
export const getExtraPrompt = () => {
	return pageAgent.toShortcutUsagePrompt()
}
