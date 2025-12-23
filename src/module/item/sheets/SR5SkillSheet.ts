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
    static override DEFAULT_OPTIONS: any = {
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
        footer: {
            template: SheetFlow.templateBase('item/footer'),
            scrollable: ['.scrollable']
        },
    }

    override async _prepareContext(options: DeepPartial<SR5ApplicationMixinTypes.RenderOptions> & { isFirstRender: boolean }) {
        const context = await super._prepareContext(options) as T;

        return context;
    }
};