import ApplicationV2 = foundry.applications.api.ApplicationV2;
import { SR5Item } from '@/module/item/SR5Item';
import { SR5Actor } from '@/module/actor/SR5Actor';

export type SR5Tab = ApplicationV2.Tab & { tooltip?: string, hidden?: boolean };

export const registerAppv2Helpers = () => {

    /**
     * Create TabGroup from an object made with _prepareTabs
     * - this is based on the common template from Foundry itself, turned into a Handlebar callback
     */
    Handlebars.registerHelper('tabGroup', function(tabs: Record<string, SR5Tab>) {
        const nav = document.createElement('nav');
        nav.classList.add('sheet-tabs');
        nav.classList.add('tabs');
        nav.setAttribute('aria-roledescription', game.i18n.localize('SHEETS.FormNavLabel'));
        // keep track of tabs that aren't hidden so we know if the tabgroup should be hidden
        let nonHiddenTabs = 0;
        for (const tab of Object.values(tabs)) {
            const link = document.createElement('a');
            link.dataset.action = 'tab';
            link.dataset.group = tab.group;
            link.dataset.tab = tab.id;
            if (tab.cssClass) {
                link.className = tab.cssClass;
            }
            if (tab.tooltip) {
                link.dataset.tooltip = tab.tooltip;
            }
            if (tab.icon) {
                const icon = document.createElement('i');
                icon.className = `${tab.icon} inert`;
                link.appendChild(icon);
            }
            if (tab.hidden) {
                link.className += ' hidden';
            } else {
                nonHiddenTabs += 1;
            }
            if (tab.label) {
                const text = document.createElement('span');
                text.innerText = game.i18n.localize(tab.label);
                link.appendChild(text);
            }
            nav.appendChild(link);
        }
        if (nonHiddenTabs <= 1) {
            nav.classList.add('hidden');
        }
        return new Handlebars.SafeString(nav.outerHTML);
    });

    Handlebars.registerHelper('isType', function(document: SR5Item | SR5Actor | any, ...types: any[]): boolean {
        if (!document) return false;
        if (!(document instanceof SR5Item || document instanceof SR5Actor)) {
            return false;
        }
        // remove options from the captured string
        types.splice(types.length - 1, 1);
        return (document as any).isType(...types);
    })

}
