import { DeepPartial } from "fvtt-types/utils";
import { SheetFlow } from "@/module/flows/SheetFlow";
import { SR5BaseItemSheetData } from "../SR5ItemSheet";
import { SR5ApplicationMixin, SR5ApplicationMixinTypes } from "@/module/handlebars/SR5ApplicationMixin";

import ItemSheet = foundry.applications.sheets.ItemSheet;

interface SR5SkillSheetData extends SR5BaseItemSheetData {
}

/**
 * Item Sheet implementation for the skill item type.
 * 
 * This handles different behavior for skill types:
 * - skills
 * - skill groups
 * - skill sets
 */
export class SR5SkillSheet<T extends SR5BaseItemSheetData = SR5SkillSheetData> extends SR5ApplicationMixin(ItemSheet)<T>{
    // TODO: taMiF - any should be replaced by correct DEFAULT_OPTIONS declaration?
    //               are we using DEFAULT_OPTIONS inerhitance?
    static override DEFAULT_OPTIONS: any = {
        // TODO: tamIf - What is the point of these classes?
        classes: ['item', 'named-sheet'],
        actions: {}
    }

    static override PARTS = {
        header: {
            template: SheetFlow.templateBase('item/header'),
            scrollable: ['.scrollable']
        },
        tabs: {
            template: SheetFlow.templateBase('common/primary-tab-group'),
            scrollable: ['.scrollable']
        },
        description: {
            template: SheetFlow.templateBase('item/tabs/description'),
            scrollable: ['.scrollable']
        },
        details: {
            template: SheetFlow.templateBase('item/tabs/details'),
            scrollable: ['.scrollable']
        },
        footer: {
            template: SheetFlow.templateBase('item/footer'),
            scrollable: ['.scrollable']
        },
    }

    static override TABS = {
        primary: {
            // TODO: tamIf use description as default tab / whatever is default on other item sheets
            initial: 'details',
            tabs: [
                { id: 'description', label: 'SR5.Tabs.Item.Description', cssClass: '' },
                { id: 'details', label: 'SR5.Tabs.Item.Details', cssClass: '' },
            ]
        }
    }

    override async _prepareContext(options: DeepPartial<SR5ApplicationMixinTypes.RenderOptions> & { isFirstRender: boolean }) {
        const context = await super._prepareContext(options) as T;
        // TODO: this can be abstracted into a base item base sheet or better yet to context.document
        context.item = this.document;

        // TODO: Implement a SR5baseItemSheet to share stuff between SR5ItemSheet and more type specific sheets
        context.primaryTabs = this._prepareTabs('primary');

        return context;
    }
};