import { SR5 } from "../../config";
import { parseDropData } from "../../utils/sheets";
import { SR5ApplicationMixin } from '@/module/handlebars/SR5ApplicationMixin';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { Helpers } from '@/module/helpers';

const { DocumentSheetV2 } = foundry.applications.api;
const { FilePicker } = foundry.applications.apps;

export class SkillEditSheet extends SR5ApplicationMixin(DocumentSheetV2)<SR5Actor> {
    skillId: string;

    constructor(options, skillId: string) {
        super(options);
        this.skillId = skillId;
    }

    override async _prepareContext(options) {
        const data = await super._prepareContext(options);
        data.actor = this.document;

        data.skillFields = this._getSkillFields(data.systemFields);

        // skill property will hold a direct skill reference
        data['skillId'] = this.skillId;
        data['skill'] = this.document.getSkill(this.skillId);
        data['skill_name'] = this._updateString();
        data['editable_name'] = this._allowSkillNameEditing();
        data['editable_canDefault'] = true;
        data['editable_attribute'] = true;
        data['attributes'] = this._getSkillAttributesForSelect();
        data['canBeNative'] = this.canBeNative;

        data.primaryTabs = this._prepareTabs('primary');

        return data;
    }

    readonly canBeNative: boolean = false;

    _updateString() {
        return `system.skills.active.${this.skillId}`;
    }

    static override DEFAULT_OPTIONS = {
        classes: ['actor', 'skill', 'named-sheet'],
        position: {
            width: 550,
            height: 400,
        },
        actions: {
            addSpecialization: SkillEditSheet.#addSpecialization,
            removeSpecialization: SkillEditSheet.#removeSpecialization,
            rollSkill: SkillEditSheet.#rollSkill,
            editImage: SkillEditSheet.#editImage,
            addBonus: SkillEditSheet.#addBonus,
            removeBonus: SkillEditSheet.#removeBonus,
        }
    }

    static override PARTS: any = {
        header: {
            template: SheetFlow.templateBase('actor/apps/skill/header'),
        },
        tabs: {
            template: SheetFlow.templateBase('common/primary-tab-group'),
        },
        description: {
            template: SheetFlow.templateBase('actor/apps/skill/tabs/description'),
        },
        details: {
            template: SheetFlow.templateBase('actor/apps/skill/tabs/details'),
        },
        footer: {
            template: SheetFlow.templateBase('actor/apps/skill/footer'),
        },
    }

    static override TABS: any = {
        primary: {
            initial: 'description',
            tabs: [
                { id: 'description', label: 'Description', cssClass: '' },
                { id: 'details', label: 'Details', cssClass: '' },
            ]
        },

    }

    static async #editImage(this: SkillEditSheet, event: PointerEvent) {
        event.preventDefault();
        if (!(event.target instanceof HTMLElement)) return;

        await new FilePicker({
            type: 'image',
            callback: (path) => {
                console.log(path);
                if (path) {
                    const key = `${this._updateString()}.img`
                    void this.document.update({ [key] : path });
                }
            }
        }).render(true);
    }

    static async #addBonus(this: SkillEditSheet, event: PointerEvent) {
        event.preventDefault();
        if (!(event.target instanceof HTMLElement)) return;
        const skill = this.document.getSkill(this.skillId);
        if (skill) {
            const bonus = skill.bonus.slice();
            bonus.push({key: 'NewBonus', value: 0});
            const key = `${this._updateString()}.bonus`
            await this.document.update({ [key] : bonus });
        }
    }

    static async #removeBonus(this: SkillEditSheet, event: PointerEvent) {
        event.preventDefault();
        if (!(event.target instanceof HTMLElement)) return;

        const canDelete = await Helpers.confirmDeletion();
        if (!canDelete) return;

        const skill = this.document.getSkill(this.skillId);
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (skill && index >= 0) {
            const bonus = skill.bonus.slice();
            bonus.splice(index, 1);
            const key = `${this._updateString()}.bonus`
            await this.document.update({ [key] : bonus });
        }
    }

    static async #addSpecialization(this: SkillEditSheet, event: PointerEvent) {
        event.preventDefault();
        if (!(event.target instanceof HTMLElement)) return;
        const skill = this.document.getSkill(this.skillId);
        if (skill) {
            const specs = skill.specs.slice();
            specs.push(game.i18n.localize('SR5.NewSpecialization'));
            const key = `${this._updateString()}.specs`
            void this.document.update({ [key] : specs });
        }
    }

    static async #removeSpecialization(this: SkillEditSheet, event: PointerEvent) {
        event.preventDefault();
        if (!(event.target instanceof HTMLElement)) return;

        const canDelete = await Helpers.confirmDeletion();
        if (!canDelete) return;

        const skill = this.document.getSkill(this.skillId);
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (skill && index >= 0) {
            const specs = skill.specs.slice();
            specs.splice(index, 1);
            const key = `${this._updateString()}.specs`
            void this.document.update({ [key] : specs });
        }
    }

    static async #rollSkill(this: SkillEditSheet, event: PointerEvent) {
        event.preventDefault();
        if (!(event.target instanceof HTMLElement)) return;
        await this.document.rollSkill(this.skillId);
    }

    async _onDrop(event: DragEvent) {
        if (!game.items || !game.actors || !game.scenes) return;

        event.preventDefault();
        event.stopPropagation();

        // Parse drop data.
        const data = parseDropData(event);
        if (!data) return;

        await this.document.update({[`${this._updateString()}.link`]: data.uuid});
    }

    /** Enhance attribute selection by an empty option to allow newly created skills to have no attribute selected.
     */
    _getSkillAttributesForSelect() {
        return {...SR5.attributes, '': ''};
    }

    _allowSkillNameEditing(): boolean {
        const skill = this.document.getSkill(this.skillId);
        // Typescript sees string here? Double negate for boolean type cast...
        return !!((!skill?.name && !skill?.label) || (skill?.name && !skill?.label));
    }

    _getSkillFields(systemFields) {
        return systemFields.skills.fields.active.element.fields;
    }
}
