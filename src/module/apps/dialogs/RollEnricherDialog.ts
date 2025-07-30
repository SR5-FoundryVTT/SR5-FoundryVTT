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
            content: "",      // bleibt leer, wird vom Template befüllt
            buttons        // Buttons hier  
        };

        super(data, options);

        switch (data.templateData.type) {
            case "action":
                data.templateData.explanation = "So funktioniert ein rollAction <br> Aktuell eingestelltes Compendium:" + game.settings.get(SYSTEM_NAME, FLAGS.RollActionDefaultPack) as string;
                data.templateData.result = "@RollAction[[]]";
                break;
            case "macro":
                data.templateData.explanation = "So funktioniert ein rollMacro <br> Aktuell eingestelltes Compendium:" + game.settings.get(SYSTEM_NAME, FLAGS.RollMacroDefaultPack) as string;
                data.templateData.result = "@RollMacro[[]]";
                break;
            case "attribute":
                data.templateData.explanation = "So funktioniert ein rollAttribute";
                data.templateData.result = "@RollAttribute[[]]";
                break;
            case "skill":
                data.templateData.explanation = "So funktioniert ein rollSkill";
                data.templateData.result = "@RollSkill[[]]";
                break;
            case "teamwork":
                data.templateData.explanation = "So funktioniert ein rollTeamwork";
                data.templateData.result = "@RollTeamwork[[]]";
                data.templateData.invalidResult = false;
                break;
            case "test":
                data.templateData.explanation = "So funktioniert ein rollTest";
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
        // @ts-expect-error width:auto
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

        const fields: HTMLElement[] = html
            .find('input, textarea, select, button')
            .toArray();

        html.on('keydown', 'input', (event) => {
            const ev = event as JQuery.KeyDownEvent;
            if (ev.key === 'Enter') {
                ev.preventDefault();

                // 3) Aktuelles Feld lokalisieren
                const idx = fields.indexOf(ev.currentTarget as HTMLElement);
                if (idx === -1) return;

                // 4) Nächsten Index berechnen
                let nextIdx: number;
                if (ev.key === 'Enter') {
                    nextIdx = idx + 1;
                } else {
                    // Tab (mit Shift → rückwärts)
                    nextIdx = ev.shiftKey ? idx - 1 : idx + 1;
                }
                // wrap-around
                if (nextIdx < 0) nextIdx = fields.length - 1;
                if (nextIdx >= fields.length) nextIdx = 0;

                // 5) Fokus setzen
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


    async dropHandler(event: JQuery.TriggeredEvent, html: JQuery<HTMLElement>) {
        event.preventDefault();
        const dragEvent = event.originalEvent as DragEvent;
        const dropData = JSON.parse(dragEvent.dataTransfer?.getData("text/plain") ?? "{}");
        const templateData = this.data.templateData;
        console.log(dropData);

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
                templateData.skill = dropData.data.skill.name.trim() ? dropData.data.skill.name : game.i18n.localize(SR5.activeSkills[dropData.data.skillId] as Translation);
                templateData.attribute = game.i18n.localize(dropData.data.skill.attribute as Translation)
                if (templateData.skill?.trim()) {
                    templateData.opposedSkill = dropData.data.skill.name.trim() ? dropData.data.skill.name : game.i18n.localize(SR5.activeSkills[dropData.data.skillId] as Translation);
                    templateData.opposedAttribute = game.i18n.localize(dropData.data.skill.attribute as Translation)
                }
                break;
            case 'Macro': // set name, compendium
                const macro = await fromUuid(dropData.uuid) as Macro

                templateData.name = macro.name?.trim() ?? "";
                setCompendium(macro.uuid);
                break;
            case 'Actor': // set attributeList, skillList
                const actor = await fromUuid(dropData.uuid) as SR5Actor;
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
