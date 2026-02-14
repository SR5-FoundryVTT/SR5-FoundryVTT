import { DeepPartial } from "fvtt-types/utils";
import { SheetFlow } from "@/module/flows/SheetFlow";
import { SR5BaseItemSheetData } from "../SR5ItemSheet";
import { SR5ApplicationMixin, SR5ApplicationMixinTypes } from "@/module/handlebars/SR5ApplicationMixin";

import ItemSheet = foundry.applications.sheets.ItemSheet;
import { SkillFlow } from "@/module/actor/flows/SkillFlow";
import { SR5Item } from "../SR5Item";

interface SR5SkillSheetData extends SR5BaseItemSheetData {
    // config style name to translation mappings.
    skills: Record<string, string>
    groups: Record<string, string>
}

/**
 * Item Sheet implementation for the skill item type.
 * 
 * This handles different behavior for skill types:
 * - skills
 * - skill groups
 * - skill sets
 */
export class SR5SkillSheet<T extends SR5SkillSheetData = SR5SkillSheetData> extends SR5ApplicationMixin(ItemSheet)<T> {
    declare document: SR5Item<'skill'>;

    // TODO: taMiF - any should be replaced by correct DEFAULT_OPTIONS declaration?
    //               are we using DEFAULT_OPTIONS inerhitance?
    static override DEFAULT_OPTIONS = {
        // TODO: tamIf - What is the point of these classes?
        classes: ['item', 'named-sheet'],
        position: {
            width: 600,
            height: 500,
        },
        actions: {
            addSpecialization: this.#addSpecialization,
            removeSpecialization: this.#removeSpecialization,
            addGroupSkill: this.#addGroupSkill,
            removeGroupSkill: this.#removeGroupSkill,
            addSetSkill: this.#addSetSkill,
            removeSetSkill: this.#removeSetSkill,
            addSetGroup: this.#addSetGroup,
            removeSetGroup: this.#removeSetGroup
        }
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

        if (this.item.system.description)
            context.descriptionHTML = await this.enrichEditorFieldToHTML(this.item.system.description.value);

        // TODO: Implement a SR5baseItemSheet to share stuff between SR5ItemSheet and more type specific sheets
        context.primaryTabs = this._prepareTabs('primary');

        const actor = this.document.actor || undefined;
        context.skills = await SkillFlow.getSkillSelection(actor);
        context.groups = await SkillFlow.getSkillgroupSelection(actor);

        return context;
    }

    /**
     * Add a new entry to the skill specializations array.
     * @param this 
     */
    static async #addSpecialization(this: SR5SkillSheet) {
        await SkillFlow.addSpecialization(this.document);
    }

    /**
     * Remove an entry from the skill specializations array.
     * @param this
     * @param event
     */
    static async #removeSpecialization(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillFlow.removeSpecialization(this.document, index);
    }

    /**
     * Add a new skill entry to the skill group.
     */
    static async #addGroupSkill(this: SR5SkillSheet) {
        await SkillFlow.addGroupSkill(this.document);
    }

    /**
     * Remove a skill entry from the skill group.
     */
    static async #removeGroupSkill(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillFlow.removeGroupSkill(this.document, index);
    }

    /**
     * Add a new skill entry to the skill set.
     */
    static async #addSetSkill(this: SR5SkillSheet) {
        await SkillFlow.addSetSkill(this.document);
    }

    /**
     * Remove a skill entry from the skill set.
     */
    static async #removeSetSkill(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillFlow.removeSetSkill(this.document, index);
    }

    /**
     * Add a new group entry to the skill set.
     */
    static async #addSetGroup(this: SR5SkillSheet) {
        await SkillFlow.addSetGroup(this.document);
    }

    /**
     * Remove a group entry from the skill set.
     */
    static async #removeSetGroup(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillFlow.removeSetGroup(this.document, index);
    }
};