import { FormDialog, FormDialogData, FormDialogOptions } from "./FormDialog";
import { SR5Actor } from "../../actor/SR5Actor";
import { AttributeEntry, LimitEntry, LimitKey, SkillEntry, SkillGroup, TeamworkData, TeamworkFlow } from "../../actor/flows/TeamworkFlow";
import { SR5 } from "../../config";

import { Translation } from "../../utils/strings";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { Helpers } from "@/module/helpers";
import { SR5Item } from "@/module/item/SR5Item";

export interface RollEnricherDialogData extends Omit<FormDialogData, "templateData"> {
    templateData: {
        type: "action" | "attribute" | "macro" | "skill" | "teamwork" | "test",
        name?: string,
        label?: string,
        compendium?: string,
        skill?: string,
        skillList: string[];
        threshold?: number,
        attribute?: string,
        attribute2?: string,
        attributeList: string[];
        testType?: 'success' | 'extended' | 'opposed',
        limit?: string,
        interval?: string,
        opposedSkill?: string,
        opposedAttribute?: string,
        opposedAttribute2?: string,
        opposedLimit?: string,
        allowOtherSkills?: boolean,
        explanation: string;
        secondAttribute?: string;
        opposedSecondAttribute?: string;
        result: string;
        invalidResult?: boolean;
        notAllowOtherSkillsSetting: boolean;
    }
}

/**
 * A specialized FormDialog for configuring and enriching roll messages across multiple contexts.
 *
 * Depending on the provided type ("action", "attribute", "macro", "skill", "teamwork", "success", "extended", or "opposed"),
 * this dialog:
 *  - Renders the appropriate HTML template with input fields for the selected context.
 *  - Populates drop-down lists (skills, attributes) based on game data.
 *  - Supports drag-and-drop of items, skills, macros, and actors to auto-fill fields.
 *  - Validates and processes user input, then returns structured data for insertion or execution of the roll.
 */
export class RollEnricherDialog extends FormDialog {
    override data: RollEnricherDialogData;
    private _submitted = false;

    constructor(type: "action" | "attribute" | "macro" | "skill" | "teamwork" | "success" | "extended" | "opposed",
        // @ts-expect-error // TODO: default option value with all the values...
        options: FormDialogOptions = {}) {
        options.applyFormChangesOnSubmit = true;

        const buttons = {
            roll: {
                label: "SR5.Dialogs.Common.Insert",
                callback: (html: JQuery<HTMLElement>) => {
                    this._submitted = true;
                    this.close();
                }
            },
            cancel: {
                label: game.i18n.localize("SR5.Dialogs.Common.Cancel"),
                callback: () => {
                    this._submitted = false;
                    this.close();
                }
            }
        };

        const data: RollEnricherDialogData = {
            templateData: {
                invalidResult: true,
                type: type === "success" || type === "extended" || type === "opposed" ? "test" : type,
                testType: type === "success" || type === "extended" || type === "opposed" ? type : undefined,
                notAllowOtherSkillsSetting: !(game.settings.get(SYSTEM_NAME, FLAGS.AllowDifferentSkillForTeamworkTests) as boolean),
                result: "",
                explanation: "",
                attributeList: [],
                skillList: []
            },
            templatePath: "systems/shadowrun5e/dist/templates/apps/dialogs/roll-enricher-dialog.html",
            title: `@Roll${Helpers.capitalizeFirstLetter(type === "success" || type === "extended" || type === "opposed" ? "test" : type)}`,
            content: "",
            buttons
        };

        super(data, options);

        switch (data.templateData.type) {
            case "action":
                // data.templateData.explanation = "So funktioniert ein rollAction <br> Aktuell eingestelltes Compendium:" + game.settings.get(SYSTEM_NAME, FLAGS.RollActionDefaultPack) as string;
                data.templateData.explanation = "SR5.DIALOG.RollEnricherHelper.ActionExplanation"
                data.templateData.result = "@RollAction[[]]";
                break;
            case "macro":
                data.templateData.explanation = "SR5.DIALOG.RollEnricherHelper.MacroExplanation"
                data.templateData.result = "@RollMacro[[]]";
                break;
            case "attribute":
                data.templateData.explanation = "SR5.DIALOG.RollEnricherHelper.AttributeExplanation";
                data.templateData.result = "@RollAttribute[[]]";
                break;
            case "skill":
                data.templateData.explanation = "SR5.DIALOG.RollEnricherHelper.SkillExplanation";
                data.templateData.result = "@RollSkill[[]]";
                break;
            case "teamwork":
                data.templateData.explanation = "SR5.DIALOG.RollEnricherHelper.TeamworkExplanation";
                data.templateData.result = "@RollTeamwork[[]]";
                data.templateData.invalidResult = false;
                break;
            case "test":
                switch (data.templateData.testType) {
                    case "success":
                        data.templateData.explanation = "SR5.DIALOG.RollEnricherHelper.SuccessExplanation";
                        break;
                    case "extended":
                        data.templateData.explanation = "SR5.DIALOG.RollEnricherHelper.ExtendedExplanation";
                        break;
                    case "opposed":
                        data.templateData.explanation = "SR5.DIALOG.RollEnricherHelper.OpposedExplanation";
                        break;
                    default:
                        break;
                }
                data.templateData.result = "@RollTest[[]]";
                break;
            default:
                break;
        }
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'roll-enricher-dialog';
        options.classes = ['sr5', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        // @ts-expect-error
        options.width = 'auto';
        return options;
    }

    override get templateContent(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/roll-enricher-dialog.html';
    }

    override getData(): FormDialogData {
        return this.data;
    }

    override activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.on("drop", event => this.dropHandler(event, html));

        const copyIcon = html.find<HTMLSpanElement>(".copy-icon");
        copyIcon.on("click", () => {
            const text = html.find<HTMLElement>(".result-text").text();
        });

        const fields: HTMLElement[] = html
            .find('input, textarea, select, button')
            .toArray();

        html.on('keydown', 'input', (event) => {
            const ev = event as JQuery.KeyDownEvent;
            if (ev.key === 'Enter') {
                ev.preventDefault();

                const idx = fields.indexOf(ev.currentTarget as HTMLElement);
                if (idx === -1) return;

                let nextIdx: number;
                if (ev.key === 'Enter') {
                    nextIdx = idx + 1;
                } else {
                    nextIdx = ev.shiftKey ? idx - 1 : idx + 1;
                }
                if (nextIdx < 0) nextIdx = fields.length - 1;
                if (nextIdx >= fields.length) nextIdx = 0;

                const next = fields[nextIdx];
                (next as HTMLElement).focus();
            }
        });
    }


    override get title(): string {
        return "@Roll Helper";
    }

    override get buttons() {
        return {
            roll: {
                label: "SR5.Dialogs.Common.Insert",
                callback: (html: JQuery<HTMLElement>) => {
                    this._submitted = true;
                    this.close();
                }
            },
            cancel: {
                label: game.i18n.localize("SR5.Dialogs.Common.Cancel"),
                callback: () => {
                    this._submitted = false;
                    this.close();
                }
            }
        };
    }


    override onAfterClose(html: JQuery<HTMLElement>): string | undefined {
        if (!this._submitted) return undefined;
        return this.data.templateData.result;
    }


    override _emptySelection(): object {
        return super._emptySelection();
    }

    override async _onChangeInput(event: InputEvent): Promise<void> {
        await super._onChangeInput(event);

        const data = this.data.templateData;
        const input = event.target as HTMLInputElement;
        const name = input.name;
        const val = input.value.trim();

        if (data.type === "test") {
            if (name === "skill" && val) {
                data.attribute = "";
            }
            else if (name === "attribute" && val) {
                data.skill = "";
            }
        }

        this.updateResult();
    }

    /**
     * Handles drop events on the dialog to import data from dragged entities.
     *
     * Supports drops of:
     *  - Items: extracts action data (skill, attributes, limits, thresholds) and sets template fields.
     *  - Skills: sets (opposed)skill and (opposed)attribute fields based on the dropped skill.
     *  - Macros: sets the macro name and compendium pack.
     *  - Actors: populates attributeList and skillList for the selected actor.
     *
     * @param event The jQuery-triggered drop event carrying a DragEvent with serialized data.
     * @param html  The jQuery-wrapped HTML element of the dialog, used to access this.data.templateData.
     * @returns     A Promise that resolves once the template data has been updated and the dialog re-rendered.
     */
    async dropHandler(event: JQuery.TriggeredEvent, html: JQuery<HTMLElement>) {
        event.preventDefault();
        let dropData;

        try {
            const dragEvent = event.originalEvent as DragEvent;
            dropData = JSON.parse(dragEvent.dataTransfer?.getData("text/plain") ?? "{}");
        } catch (err: any) {
            console.error("Could not parse drag data", err);
            return;
        }

        const templateData = this.data.templateData;

        // If the dropped UUID comes from a non-default compendium pack for this type, update templateData.compendium
        function setCompendium(uuid) {
            const parts = uuid.split(".");
            if (parts[0] === "Compendium" && (templateData.type === "action" || templateData.type === "macro")) {
                const defaultPack = game.settings.get(SYSTEM_NAME, templateData.type === "action" ? FLAGS.RollActionDefaultPack : FLAGS.RollMacroDefaultPack) as string;
                const packKey = `${parts[1]}.${parts[2]}`;
                if (packKey !== defaultPack) {
                    templateData.compendium = packKey;
                }
            }
        }

        switch (dropData.type) {
            case 'Item': // set name, compendium, (opposed)attribute, (opposed)attribute2, threshold, (opposed)skill, (opposed)limit
                const item = await fromUuid(dropData.uuid) as SR5Item
                if (!item) return;
                const action = item?.getAction();

                if (action) {
                    templateData.attribute = game.i18n.localize(SR5.attributes[action.attribute ?? ""] as Translation);
                    templateData.attribute2 = game.i18n.localize(SR5.attributes[action.attribute2 ?? ""] as Translation);
                    templateData.skill = game.i18n.localize(SR5.activeSkills[action.skill ?? ""] as Translation);
                    templateData.threshold = action.threshold.base;
                    templateData.limit = game.i18n.localize(SR5.limits[action.limit.attribute ?? ""] as Translation);
                    templateData.opposedSkill = game.i18n.localize(SR5.activeSkills[action.opposed.skill ?? ""] as Translation);
                    templateData.opposedAttribute = game.i18n.localize(SR5.attributes[action.opposed.attribute ?? ""] as Translation);
                    templateData.opposedAttribute2 = game.i18n.localize(SR5.attributes[action.opposed.attribute2 ?? ""] as Translation);
                    templateData.opposedLimit = game.i18n.localize(SR5.limits[action.opposed.limit.attribute ?? ""] as Translation);
                }

                templateData.name = item.name?.trim() ?? "";
                setCompendium(item.uuid);
                break;
            case 'Skill': // set (opposed)skill, (opposed)attribute
                if (!dropData.data?.skill) return;
                const { name, attribute } = dropData.data.skill;

                templateData.skill = name.trim() ? name : game.i18n.localize(SR5.activeSkills[dropData.data.skillId] as Translation);
                templateData.attribute = game.i18n.localize(attribute as Translation)
                if (templateData.skill?.trim()) {
                    templateData.opposedSkill = name.trim() ? name : game.i18n.localize(SR5.activeSkills[dropData.data.skillId] as Translation);
                    templateData.opposedAttribute = game.i18n.localize(attribute as Translation)
                }
                break;
            case 'Macro': // set name, compendium
                const macro = await fromUuid(dropData.uuid) as Macro
                if(!macro) return;

                templateData.name = macro.name?.trim() ?? "";
                setCompendium(macro.uuid);
                break;
            case 'Actor': // set attributeList, skillList
                const actor = await fromUuid(dropData.uuid) as SR5Actor;
                if(!actor) return;
                templateData.attributeList = Object
                    .values(actor.getAttributes())
                    .filter(a => !a.hidden)
                    .map(a => game.i18n.localize(a.label as Translation));
                templateData.skillList = Object
                    .entries(actor.getSkills() as any)
                    .flatMap(([category, group]: [string, any]) =>
                        Object
                            .values(group as any)
                            .filter((skill: any) => !skill.hidden)
                            .map((skill: any) =>
                                category === "active" && skill.label
                                    ? game.i18n.localize(skill.label as Translation)
                                    : skill.name
                            )
                    )
                    .sort((a: string, b: string) => a.localeCompare(b));
                break;
            default:
                break;
        }
        this.updateResult();
        await this.render();
    }

    /**
 * Updates the live result string based on current template data selections.
 *
 * @returns void
 */
    async updateResult() {
        const data = this.data.templateData;
        const label = data.label?.trim() ? `{${data.label}}` : "";
        let attribute
        let threshold
        let skill
        let limit

        switch (data.type) {
            case 'action':
            case 'macro':
                data.invalidResult = !data.name?.trim();
                const name = data.name?.trim() ?? "";
                const compendium = data.compendium && data.compendium !== "" ? ` | ${data.compendium}` : "";
                data.result = `@Roll${Helpers.capitalizeFirstLetter(data.type)}[[${name}${compendium}]]${label}`;
                break;

            case 'attribute':
                data.invalidResult = !data.attribute?.trim();
                attribute = data.attribute?.trim() ?? "";
                threshold = (data.threshold ?? 0) > 0 ? ` ${data.threshold}` : ""
                data.result = `@RollAttribute[[${attribute}${threshold}]]${label}`;
                break;

            case 'skill':
                data.invalidResult = !data.skill?.trim();
                skill = data.skill?.trim() ?? "";
                threshold = (data.threshold ?? 0) > 0 ? ` ${data.threshold}` : ""
                data.result = `@RollAttribute[[${skill}${threshold}]]${label}`;
                break;

            case 'teamwork':
                const hasSkill = !!data.skill?.trim();
                const hasOthers = !!(data.attribute?.trim() || data.limit?.trim() || (data.threshold ?? 0) > 0 || data.allowOtherSkills);
                data.invalidResult = !hasSkill && hasOthers;
                skill = hasSkill ? !hasOthers ? data.skill : `skill=${data.skill}` : "";
                attribute = data.attribute?.trim() ? ` | attribute=${data.attribute}` : "";
                limit = data.limit?.trim() ? ` | limit=${data.limit}` : "";
                threshold = (data.threshold ?? 0) > 0 ? ` | threshold=${data.threshold}` : ""
                const allowOtherSkills = data.allowOtherSkills ? " | X" : "";
                data.result = `@RollTeamwork[[${skill}${attribute}${threshold}${allowOtherSkills}]]${label}`;
                break;

            case 'test':
                skill = data.skill?.trim() ?? "";
                attribute = data.attribute?.trim() ?? "";
                const firstAttribute = skill?.trim() ? skill : attribute;
                const secondAttribute = data.secondAttribute?.trim() ?? ""
                limit = data.limit?.trim() ? ` [${data.limit}]` : "";
                switch (data.testType) {
                    case 'success':
                        data.invalidResult = !((!!data.skill?.trim() && !!data.attribute?.trim()) || !!data.secondAttribute?.trim());
                        threshold = (data.threshold ?? 0) > 0 ? `(${data.threshold})` : ""
                        data.result = `@RollTest[[${firstAttribute} + ${secondAttribute}${limit}${threshold}]]${label}`;
                        break;
                    case 'extended':
                        data.invalidResult = !(
                            (data.threshold ?? 0) > 0 &&
                            !!data.interval?.trim() && (
                                (!!data.skill?.trim() && !!data.attribute?.trim()) || !!data.secondAttribute?.trim()
                            ));
                        const threshold_interval = `(${data.threshold ?? ""}, ${data.interval ?? ""})`
                        data.result = `@RollTest[[${firstAttribute} + ${secondAttribute}${limit}${threshold_interval}]]${label}`;
                        break;
                    case 'opposed':
                        data.invalidResult = !(
                            (
                                (!!data.skill?.trim() && !!data.attribute?.trim()) ||
                                (!!data.attribute?.trim() && !!data.attribute2?.trim())
                            ) && (
                                (!!data.opposedSkill?.trim() && !!data.opposedAttribute?.trim()) ||
                                (!!data.opposedAttribute?.trim() && !!data.opposedAttribute2?.trim())
                            ));
                        const opposedLimit = data.opposedLimit?.trim() ? ` [${data.opposedLimit}]` : "";
                        const opposedSkill = data.opposedSkill?.trim() ?? "";
                        const opposedAttribute = data.opposedAttribute?.trim() ?? "";
                        const firstOpposedAttribute = opposedSkill?.trim() ? opposedSkill : opposedAttribute;
                        const opposedSecondAttribute = data.opposedSecondAttribute?.trim() ?? ""
                        data.result = `@RollTest[[${firstAttribute} + ${secondAttribute}${limit} ${game.i18n.localize("SR5.DIALOG.RollEnricherHelper.Versus")} ${firstOpposedAttribute} + ${opposedSecondAttribute}${opposedLimit}]]${label}`;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

        const textElement = this.element.find<HTMLSpanElement>(".result-text");
        textElement.text(data.result)
            .toggleClass("invalid-result", data.invalidResult || false);
    }
}
