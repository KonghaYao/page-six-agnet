import { PageController, PageControllerConfig } from '@page-agent/page-controller';
import { createExecuteJSTool, createGetBrowserStateTool } from './tools';
import { ClickElementByIndexShortcut, FillInputShortcut, getBrowserStateShortcut } from './shortcut';

export type PageAgentConfig = PageControllerConfig;

export interface Shortcut {
    name: string;
    description: string;
    execute: (this: PageAgentContext, ...args: any[]) => Promise<any>;
}

export class PageAgentContext {
    page: PageController;
    private config: PageAgentConfig;
    constructor(config: PageAgentConfig) {
        this.page = new PageController(config);
        this.config = config;
    }
    /**
     * 初始化所有的工具
     */
    initTools() {
        return [createExecuteJSTool(this), createGetBrowserStateTool(this)];
    }
    shortcuts: Record<string, Shortcut> = {};
    initShortcuts() {
        this.addShortcuts([ClickElementByIndexShortcut, FillInputShortcut, getBrowserStateShortcut]);
    }
    addShortcuts(shortcuts: Shortcut[]) {
        shortcuts.forEach((i) => {
            this.shortcuts[i.name] = i;
        });
    }
    toShortcutUsagePrompt() {
        const shortcuts = Object.values(this.shortcuts)
            .map((i) => {
                return `<shortcut name="${i.name}">
<description>
${i.description}
</description>
</shortcut>`;
            })
            .join('\n');
        return `<shortcuts>
${shortcuts}
</shortcuts>`;
    }
    toSafeJSObject() {
        return {
            page: this.page,
            shortcuts: Object.fromEntries(
                Object.entries(this.shortcuts).map(([k, v]) => {
                    return [k, v.execute.bind(this)];
                }),
            ),
        };
    }
}
