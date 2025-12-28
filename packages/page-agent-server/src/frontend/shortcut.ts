import { PageAgentContext, Shortcut } from '.';

export const ClickElementByIndexShortcut: Shortcut = {
    name: 'click_element_by_index',
    description: `
// 推荐：以 index 点击元素，index 为页面信息中的 index
await context.shortcuts.click_element_by_index(index);
`,
    execute: async function (this: PageAgentContext, index: number) {
        return this.page.clickElement(index);
    },
};
export const FillInputShortcut: Shortcut = {
    name: 'fill_input',
    description: `
// 填充输入框
await context.shortcuts.fill_input(index, input);
`,
    async execute(this: PageAgentContext, index: number, input: string) {
        return await this.page.inputText(index, input);
    },
};

export const getBrowserStateShortcut: Shortcut = {
    name: 'getBrowserState',
    description: `
// 获取页面中的信息
const browserState: string = await context.shortcuts.getBrowserState();
`,
    async execute(this: PageAgentContext) {
        const pageUrl = await this.page.getCurrentUrl();
        const pageTitle = await this.page.getPageTitle();
        const pi = await this.page.getPageInfo();
        const viewportExpansion = await this.page.getViewportExpansion();

        // this.mask.wrapper.style.pointerEvents = 'none'
        await this.page.updateTree();
        // this.mask.wrapper.style.pointerEvents = 'auto'

        const simplifiedHTML = await this.page.getSimplifiedHTML();

        await this.page.cleanUpHighlights();

        let prompt = `<browser_state>
Current Page: [${pageTitle}](${pageUrl})

Page info: ${pi.viewport_width}x${pi.viewport_height}px viewport, ${pi.page_width}x${
            pi.page_height
        }px total page size, ${pi.pages_above.toFixed(1)} pages above, ${pi.pages_below.toFixed(
            1,
        )} pages below, ${pi.total_pages.toFixed(1)} total pages, at ${(pi.current_page_position * 100).toFixed(
            0,
        )}% of page

${
    viewportExpansion === -1
        ? 'Interactive elements from top layer of the current page (full page):'
        : 'Interactive elements from top layer of the current page inside the viewport:'
}

		`;

        // Page header info
        const has_content_above = pi.pixels_above > 4;
        if (has_content_above && viewportExpansion !== -1) {
            prompt += `... ${pi.pixels_above} pixels above (${pi.pages_above.toFixed(
                1,
            )} pages) - scroll to see more ...\n`;
        } else {
            prompt += `[Start of page]\n`;
        }

        // Current viewport info
        prompt += simplifiedHTML;
        prompt += `\n`;

        // Page footer info
        const has_content_below = pi.pixels_below > 4;
        if (has_content_below && viewportExpansion !== -1) {
            prompt += `... ${pi.pixels_below} pixels below (${pi.pages_below.toFixed(
                1,
            )} pages) - scroll to see more ...\n`;
        } else {
            prompt += `[End of page]\n`;
        }

        prompt += `</browser_state>\n`;
        console.log(prompt);
        return prompt;
    },
};
