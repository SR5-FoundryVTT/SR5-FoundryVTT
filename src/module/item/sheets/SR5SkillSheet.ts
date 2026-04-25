import { DeepPartial } from "fvtt-types/utils";
import { SheetFlow } from "@/module/flows/SheetFlow";
import { SR5ApplicationMixin, SR5ApplicationMixinTypes } from "@/module/handlebars/SR5ApplicationMixin";
import { SR5BaseItemSheetData } from "../SR5ItemSheet";
import { SkillSelectionFlow } from '@/module/flows/SkillSelectionFlow';
import { SkillItemFlow } from '../flows/SkillItemFlow';
import { SR5Item } from "../SR5Item";
import { Helpers } from "@/module/helpers";
import { SR5 } from "@/module/config";
import { SkillSetReferenceData, SkillSetSourceFlow } from "@/module/flows/SkillSetSourceFlow";
import { SkillRules } from "@/module/rules/SkillRules";
import { SkillNamingFlow } from '@/module/flows/SkillNamingFlow';
import ItemSheet = foundry.applications.sheets.ItemSheet;
import { SkillSetSyncFlow } from "@/module/flows/SkillSetSyncFlow";

interface SR5SkillSheetData extends SR5BaseItemSheetData {
    // config style name to translation mappings.
    skills: Record<string, string>
    // active skills for skill selections.
    activeSkills: Record<string, string>
    // groups for skill group selections.
    groups: Record<string, string>
    // attributes for attribute selections.
    attributes: Record<string, string>
    // limits for limit selections.
    limits: Record<string, string>
    // Skill Set specific compendium warning around default actor type config.
    showCompendiumWarning: boolean
    // Whether the skill attribute can be edited, based on the skill category.
    canEditSkillAttribute: boolean
    // Whether the skill defaulting can be edited, based on the skill category.
    canEditSkillDefaulting: boolean
    // Whether the skill can be native, based on the skill category.
    canBeNative: boolean
    // Taken directly from an owning actor to show the derived value.
    skillValue?: number
    // Whether this skill has a derived value as an actor owned skill.
    hasSkillValue: boolean
    // The source skill set reference.
    sourceSkillSet?: SkillSetReferenceData | null
    // What to display as the skill name, depending on mode.
    displayName: string
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

    static override DEFAULT_OPTIONS = {
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
            addSetSkillSpecialization: this.#addSetSkillSpecialization,
            removeSetSkill: this.#removeSetSkill,
            removeSetSkillSpecialization: this.#removeSetSkillSpecialization,
            addSetGroup: this.#addSetGroup,
            removeSetGroup: this.#removeSetGroup,
            logSetDifferences: this.#logActorDifferences,
        },
        dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
    }

    static override PARTS = {
        header: {
            template: SheetFlow.templateBase('item/header/skill'),
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
            initial: 'description',
            tabs: [
                { id: 'description', label: 'SR5.Tabs.Item.Description', cssClass: '' },
                { id: 'details', label: 'SR5.Tabs.Item.Details', cssClass: '' },
            ]
        }
    }

    /**
     * TODO: Refactor method to differentiate between skill types (skill, group, set) to avoid over preparation
     *       of unnecessary data.
     */
    override async _prepareContext(options: DeepPartial<SR5ApplicationMixinTypes.RenderOptions> & { isFirstRender: boolean }) {
        const context = await super._prepareContext(options) as T;
        context.item = this.document;

        if (this.item.system.description)
            context.descriptionHTML = await this.enrichEditorFieldToHTML(this.item.system.description.value);

        context.primaryTabs = this._prepareTabs('primary');

        const actor = this.document.actor || undefined;
        context.skills = await SkillSelectionFlow.getSkillSelection(actor);
        context.activeSkills = await SkillSelectionFlow.getSkillSelection(actor, {
            categories: ['active'],
            selectedSkills: [this.document.system.skill.action.opposed.skill],
            valueType: 'key',
        });
        context.groups = await SkillSelectionFlow.getSkillgroupSelection();
        context.attributes = Helpers.sortConfigValuesByTranslation(SR5.attributes);
        context.limits = Helpers.sortConfigValuesByTranslation(SR5.limits);
        // Default skill-set actor type is only meaningful for compendium-stored skill items.
        context.showCompendiumWarning = !this.document.pack;
        context.canEditSkillAttribute = this.canEditSkillAttribute();
        context.canEditSkillDefaulting = this.canEditSkillDefaulting();
        context.canBeNative = this.canBeNative();
        context.skillValue = this.getActorSkillValue();
        context.hasSkillValue = context.skillValue !== undefined;
        context.sourceSkillSet = await this.getSourceSkillSet();
        context.displayName = this.getDisplayName();

        return context;
    }

    /**
     * As skill items use their name as a i18n localization key segment, we need to show users the translated name
     * and the actual name. The simplest approach is showing the translation in playmode and the actual name in edit mode.
     */
    getDisplayName() {
        if (this.document.system.type === 'group') {
            return SkillNamingFlow.localizeSkillgroupName(this.document.name);
        }

        if (this.document.system.type === 'set') {
            return SkillNamingFlow.localizeSkillsetName(this.document.name);
        }

        return SkillNamingFlow.localizeSkillName(this.document.name);
    }

    protected override async _onDrop(event: DragEvent) {
        const data = foundry.applications.ux.TextEditor.getDragEventData(event) as { uuid?: string } | null;
        if (!data) return;

        const targetElement = event.target as HTMLElement | null;
        if (targetElement?.closest('[name="system.description.source"]') && data.uuid) {
            await this.item.setSource(data.uuid);
        }
    }

    async getSourceSkillSet(): Promise<SR5SkillSheetData['sourceSkillSet']> {
        const sourceUuid = foundry.utils.getProperty(this.document, 'system.source.uuid') as string;
        return await SkillSetSourceFlow.prepareSkillSetReference(sourceUuid);
    }

    canEditSkillAttribute() {
        if (this.document.system.type !== 'skill') return true;
        return !SkillRules.fixedCategoryValues(this.document.system.skill.category);
    }

    canEditSkillDefaulting() {
        if (this.document.system.type !== 'skill') return true;
        return !SkillRules.fixedCategoryValues(this.document.system.skill.category);
    }

    canBeNative() {
        if (this.document.system.type !== 'skill') return true;
        return SkillRules.canBeNativeCategory(this.document.system.skill.category);
    }

    /**
     * To allow showing the derived skill value of this skill on an owned actor,
     * derive that value by taking the actors SkillField.
     */
    getActorSkillValue() {
        if (this.document.system.type !== 'skill') return;
        const actor = this.document.actor;
        if (!actor) return;

        const skill = actor.getSkillById(this.document.id!);
        if (!skill) return;
        return skill.value;
    }

    /**
     * Add a new entry to the skill specializations array.
     * @param this 
     */
    static async #addSpecialization(this: SR5SkillSheet) {
        await SkillItemFlow.addSpecialization(this.document);
    }

    /**
     * Remove an entry from the skill specializations array.
     * @param this
     * @param event
     */
    static async #removeSpecialization(this: SR5SkillSheet, event: Event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillItemFlow.removeSpecialization(this.document, index);
    }

    /**
     * Add a new skill entry to the skill group.
     */
    static async #addGroupSkill(this: SR5SkillSheet) {
        await SkillItemFlow.addGroupSkill(this.document);
    }

    /**
     * Remove a skill entry from the skill group.
     */
    static async #removeGroupSkill(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillItemFlow.removeGroupSkill(this.document, index);
    }

    /**
     * Add a new skill entry to the skill set.
     */
    static async #addSetSkill(this: SR5SkillSheet) {
        await SkillItemFlow.addSetSkill(this.document);
    }

    /**
     * Remove a skill entry from the skill set.
     */
    static async #removeSetSkill(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillItemFlow.removeSetSkill(this.document, index);
    }

    /**
     * Add a specialization entry to a skill within the skill set.
     */
    static async #addSetSkillSpecialization(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillItemFlow.addSetSkillSpecialization(this.document, index);
    }

    /**
     * Remove a specialization entry from a skill within the skill set.
     */
    static async #removeSetSkillSpecialization(this: SR5SkillSheet, event: Event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const action = SheetFlow.closestAction(event.target);
        const index = parseInt(action?.dataset.index ?? '-1');
        const specializationIndex = parseInt(action?.dataset.specializationIndex ?? '-1');
        if (index === -1 || specializationIndex === -1) return;
        await SkillItemFlow.removeSetSkillSpecialization(this.document, index, specializationIndex);
    }

    /**
     * Add a new group entry to the skill set.
     */
    static async #addSetGroup(this: SR5SkillSheet) {
        await SkillItemFlow.addSetGroup(this.document);
    }

    /**
     * Remove a group entry from the skill set.
     */
    static async #removeSetGroup(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index === -1) return;
        await SkillItemFlow.removeSetGroup(this.document, index);
    }

    /**
     * Console log differences between an actor skill set and an actual skill set.
     */
    static async #logActorDifferences(this: SR5SkillSheet, event: Event) {
        event.preventDefault();
        const skillSet = this.document;
        if (!skillSet.isType('skill') || skillSet.system.type !== 'set') return;

        ui.notifications.info('SR5.Skill.Set.DifferencesLoggedInConsole', { localize: true });
        await SkillSetSyncFlow.logGlobalActorsDifferences(skillSet);
    }
};