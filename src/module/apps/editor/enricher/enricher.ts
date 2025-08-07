import { TeamworkFlow } from "./../../../actor/flows/TeamworkFlow";
import { SR5Actor } from "./../../../actor/SR5Actor";
import { SR5 } from "./../../../config";
import { SYSTEM_NAME, FLAGS } from "./../../../constants";
import { DataDefaults } from "./../../../data/DataDefaults";
import { SR5Item } from "./../../../item/SR5Item";
import { TestCreator } from "./../../../tests/TestCreator";

// import { FLAGS, SYSTEM_NAME } from '../constants';
type ActorAttribute = Shadowrun.ActorAttribute;
type ActionRollData = Shadowrun.ActionRollData;

export interface TestAttributes {
    skill?: string;
    attribute?: string;
    attribute2?: string;
    limit?: string | number;
    threshold?: string;
    interval?: string;
    opposedSkill?: string;
    opposedAttribute?: string;
    opposedAttribute2?: string;
    opposedLimit?: string | number;
    name?: string;
    actorUuid?: string;
    packKey?: string;
    label: string;
    value: string;
    allowOtherSkills?: boolean;
    testType: "success" | "opposed" | "extended" | "teamwork" | "action" | "macro" | "invalid";
}

/**
 * Utility class to enrich entries with interactive roll links.
 *
 * Supported keywords: `RollAction`, `RollAttribute`, `RollMacro`, `RollSkill`,
 * `RollTeamwork`, `RollTest`.
 */
export class RollEnricher {

    static get keywords() {
        return ["RollAction", "RollAttribute", "RollMacro", "RollSkill", "RollTeamwork", "RollTest"]
    };

    static toLowerUnderscore(str) {
        return str.replace(/ /g, '_').toLowerCase();
    }

    /**
 * Initialize and register all text‐editor enrichers for custom roll markup.
 *
 * Parses specialized strings using {@link RollEnricher.parseTeamworkString} and
 * {@link RollEnricher.parseTestString}.
 */
    static setEnricher() {
        const typePattern = `(${RollEnricher.keywords.join("|")})`; // 1: keyword
        const opening = "\\[\\[";
        const valuePattern = "([\\s\\S]*?)"; // 2: content

        const closing = "\\]\\](?!\\])";
        const labelPattern = "(?:\\{([^}]+)\\})?"; // 3: optional label

        // Build the enricher regex:
        //   group 1 = keyword (one of RollEnrichers.keywords)
        //   group 2 = inner content (everything between [[ and ]])
        //   group 3 = optional label (enclosed in {…})
        const pattern = new RegExp(`@${typePattern}${opening}${valuePattern}${closing}${labelPattern}`, "g");

        //@ts-expect-error
        CONFIG.TextEditor.enrichers.push(
            {
                pattern: pattern,
                enricher: (match: RegExpMatchArray, options: any) => {
                    try {
                        const type = match[1]
                        const value = match[2].replace(/<\/?[^>]+>/g, "").trim() as string
                        let label = match[3] || value.replace(/_/g, " ");

                        if (!value.trim() && !label.trim()) label = match[0];

                        const testAttributes: TestAttributes = { label: label, testType: "success", value: value }

                        let parts;

                        switch (type) {
                            case "RollAttribute":
                            case "RollSkill":
                                parts = value.split(/\s+/);

                                if (parts.length < 1) {
                                    testAttributes.testType = "invalid";
                                    break;
                                }

                                let lastPart = parts.at(-1);
                                if (typeof lastPart === "string" && /^\d+$/.test(lastPart)) {
                                    testAttributes.threshold = lastPart;
                                    parts.pop();
                                }

                                type === "RollAttribute" ? testAttributes.attribute = parts.join(" ") : testAttributes.skill = parts.join(" ");
                                break;

                            case "RollTeamwork":
                                Object.assign(testAttributes, this.parseTeamworkString(testAttributes));
                                break;

                            case "RollTest":
                                Object.assign(testAttributes, this.parseTestString(testAttributes));
                                break;

                            case "RollAction":
                            case "RollMacro":
                                parts = value.split("|");
                                if (parts.length < 1) {
                                    testAttributes.testType = "invalid";
                                    break;
                                }

                                testAttributes.testType = type === "RollAction" ? "action" : "macro";
                                testAttributes.name = parts[0];

                                let packKey: string | undefined;

                                if (parts.length === 2) {
                                    packKey = parts[1];
                                } else {
                                    switch (testAttributes.testType) {
                                        case "action":
                                            packKey = testAttributes.packKey = game.settings.get(SYSTEM_NAME, FLAGS.RollActionDefaultPack) as string;
                                            break;
                                        case "macro":
                                            packKey = testAttributes.packKey = game.settings.get(SYSTEM_NAME, FLAGS.RollMacroDefaultPack) as string;
                                            break;
                                        default:
                                            packKey = undefined
                                            break;
                                    }
                                };

                                testAttributes.packKey = (typeof packKey === "string" && game.packs.has(packKey)) ? packKey : undefined;

                                break;

                            default:
                                testAttributes.testType = "invalid";
                                break;
                        }

                        if (testAttributes.testType === "invalid") {
                            console.warn(`Invalid test format: ${type}`);
                            return null;
                        }

                        const $link = $(`<a class="sr5-roll-request">${label}<em class="fas fa-comment-alt" style="margin-left: 5px;"></em></a>`);

                        if (options.relativeTo.uuid) {
                            const fullUuid = options.relativeTo.uuid.split(".");
                            const actorIndex = options.relativeTo.uuid.split(".").indexOf("Actor");
                            if (actorIndex >= 0 && fullUuid.length > actorIndex + 1) {
                                testAttributes.actorUuid = `Actor.${fullUuid[actorIndex + 1]}`;
                            }
                        }

                        const attrs = this.buildRollRequestAttributes(testAttributes);

                        for (const [key, value] of Object.entries(attrs)) {
                            $link.attr(key, value);
                        }

                        return $link[0];
                    } catch (err: any) {
                        console.error("RollEnricher error on match", match[0], err);
                        return document.createTextNode(match[0]);
                    }
                }
            },
        )
    }

    /**
 * Handle click events on enriched roll links in journal entries.
 *
 * @param ev - The jQuery click event triggered on the roll link element.
 */
    static async handleClick(ev: JQuery.TriggeredEvent) {
        const user = game.user;
        if (!user) return;
        try {
            const dataset = ev.currentTarget.dataset;

            const actorUuid = dataset.actorUuid;

            const actor = await this.findActor(actorUuid);

            if ($(ev.target).hasClass('fa-comment-alt')) {
                ev.preventDefault();
                ev.stopPropagation();

                const speaker = actor ? { actor: actor.id } : { alias: user.name };

                const templateData = RollEnricher.deconstructRollRequestAttributes(dataset);

                if (actor) templateData["actor"] = { name: actor.name, img: actor.img, uuid: actor.uuid };

                const html = await renderTemplate('systems/shadowrun5e/dist/templates/chat/rollRequest.html', templateData);

                await ChatMessage.create({
                    user: game.user?.id,
                    speaker: speaker,
                    content: html
                });
            } else {
                const testAttributes: TestAttributes = RollEnricher.deconstructRollRequestAttributes(dataset);
                switch (testAttributes.testType) {

                    case "opposed":
                    case "extended":
                    case "success":
                        await RollEnricher.rollTest(testAttributes);
                        break;

                    case "teamwork":
                        await TeamworkFlow.initiateTeamworkTest({
                            actor,
                            skill: TeamworkFlow.constructSkillEntry({ id: testAttributes.skill ?? "" }),
                            attribute: TeamworkFlow.constructAttributeEntry(testAttributes.attribute as ActorAttribute | undefined),
                            threshold: testAttributes.threshold ? Number(testAttributes.threshold) : undefined,
                            allowOtherSkills: Boolean(testAttributes.allowOtherSkills),
                            limit: TeamworkFlow.constructLimitEntry(testAttributes.limit)
                        });
                        break;

                    case "action":
                        await RollEnricher.rollAction(testAttributes);
                        break;

                    case "macro":
                        await RollEnricher.executeMacro(testAttributes);
                        break;

                    default:
                        console.warn(`Unhandled testType: ${testAttributes.testType}`);
                }
            }
        } catch (err: any) {
            console.error("RollEnricher: unexpected error", err, ev);
        }
    }

    /**
 * Execute a test for the given attributes.
 *
 * @param testAttributes - Parsed roll/test parameters (actorUuid, attribute(s), skill, limit, threshold, testType, label, etc.)
 */
    static async rollTest(testAttributes: TestAttributes) {
        const user = game.user;
        if (!user || !testAttributes) return;

        let actor = await this.findActor(testAttributes.actorUuid);
        if (!actor) {
            ui.notifications?.error("No actor found to perform this test.");
            return;
        }

        try {
            //TODO: Implement opposed limit and interval
            const testData = DataDefaults.actionRollData({
                attribute: this.getAttributeKeyByLabel(testAttributes.attribute),
                attribute2: this.getAttributeKeyByLabel(testAttributes.attribute2),
                skill: actor.getSkillByLabel(`${testAttributes.skill}`)?.id ?? '',
                limit: {
                    value: (testAttributes.limit && Number.isInteger(+testAttributes.limit)) ? +testAttributes.limit : 0,
                    base: (testAttributes.limit && Number.isInteger(+testAttributes.limit)) ? +testAttributes.limit : 0,
                    attribute: this.getLimitKeyByLabel(`${testAttributes.limit}`) ?? ''
                },
                threshold: {
                    value: (testAttributes.threshold && Number.isInteger(+testAttributes.threshold)) ? +testAttributes.threshold : 0,
                    base: (testAttributes.threshold && Number.isInteger(+testAttributes.threshold)) ? +testAttributes.threshold : 0
                },
                extended: testAttributes.testType === "extended",
                opposed: {
                    test: testAttributes.testType === "opposed" ? 'OpposedTest' : '',
                    attribute: this.getAttributeKeyByLabel(testAttributes.opposedAttribute),
                    attribute2: this.getAttributeKeyByLabel(testAttributes.opposedAttribute2),
                    skill: actor.getSkillByLabel(`${testAttributes.opposedSkill}`)?.id ?? '',
                }
            });

            const test = await TestCreator.fromAction(testData, actor);
            if (test) test.data.title = testAttributes.label;
            await test?.execute();
        } catch (err: any) {
            console.error("rollTest error:", err);
        }
    }

    /**
 * Execute a macro using the provided parameters.
 *
 * Looks up the macro by name either in the specified compendium (`packKey`)
 * or in the world’s macro directory, then executes it.
 *
 * @param testAttributes - Parameters for macro execution, including:
 *   - `name`: The name of the macro to run
 *   - `packKey`: (Optional) The compendium key where the macro resides
 */
    static async executeMacro(testattributes: TestAttributes) {
        const macroName = testattributes.name?.trim();
        const packKey = testattributes.packKey?.trim();

        if (!macroName) {
            ui.notifications?.warn("No macro name provided.");
            return;
        }

        try {
            let macro: Macro | undefined;

            if (packKey) {
                const pack = game.packs.get(packKey);

                if (!pack) {
                    ui.notifications?.error(`Compendium '${packKey}' not found.`);
                    return;
                }

                const index = await pack.getIndex();
                const entry = index.find(e => e.name === macroName);
                if (!entry) {
                    ui.notifications?.error(`Macro '${macroName}' not found in compendium '${packKey}'.`);
                    return;
                }

                const document = await pack.getDocument(entry._id);
                if (document instanceof Macro) {
                    macro = document;
                } else {
                    ui.notifications?.error("The found document is not a Macro.");
                    return;
                }
            } else {
                macro = game.macros?.getName(macroName);
                if (!macro) {
                    ui.notifications?.error(`Macro '${macroName}' not found in the world.`);
                    return;
                }
            }

            await macro.execute();
        } catch (error) {
            console.error(`Error executing macro '${macroName}' from '${packKey ?? "world"}':`, error);
        }
    }

    /**
 * Execute an action roll using the provided attributes.
 *
 * Fetches the action by name from the specified compendium (if `packKey` is given)
 * or from the actor’s own items, then creates and executes the corresponding test.
 *
 * @param testAttributes - Parameters for the action roll, including:
 *   - `name`: The action name to look up
 *   - `packKey`: (Optional) The compendium key to search
 *   - `actorUuid`: The UUID of the actor performing the action
 */
    static async rollAction(testAttributes: TestAttributes) {
        const actionName = testAttributes.name?.trim();
        if (!actionName) {
            ui.notifications?.warn("No action name provided.");
            return;
        }
        const packKey = testAttributes.packKey?.trim();

        console.log(`Attempting to roll action: ${actionName} from ${packKey}`);

        const actor = await this.findActor(testAttributes.actorUuid);
        if (!actor) {
            ui.notifications?.error("No actor found to perform this action.");
            return;
        }

        try {
            let action: ActionRollData | undefined;
            let test;

            if (packKey) {
                const pack = game.packs.get(packKey);

                if (!pack) {
                    ui.notifications?.error(`Compendium '${packKey}' not found.`);
                    return;
                }

                const index = await pack.getIndex();

                for (const e of index) {
                    if (e.name !== actionName) continue;

                    const doc = await pack.getDocument(e._id);
                    if (doc instanceof SR5Item && doc.getAction() !== undefined) {
                        action = doc.getAction();
                        break;
                    }
                }

                if (!action) {
                    ui.notifications?.error(`No valid action '${actionName}' found in compendium '${packKey}'.`);
                    return;
                }

                test = await TestCreator.fromAction(action, actor);
            } else {
                const item = actor.items.find(i => i.name === actionName && i.getAction() !== undefined)
                    ?? game.items?.find(i => i.name === actionName && i.getAction() !== undefined);
                if (!item) {
                    ui.notifications?.error(`Action '${actionName}' not found on actor '${actor.name}' or in the sidebar.`);
                    return;
                }

                test = await TestCreator.fromItem(item, actor);
            }

            await test?.execute();
        } catch (error) {
            console.error(`Error executing action '${actionName}' from '${packKey ?? "world"}':`, error);
        }
    }

    /**
 * Find the appropriate actor for rolls or actions.
 *
 * Attempts to resolve an actor by UUID (if provided) with OWNER permission,
 * then falls back to a single controlled token’s actor, and finally to the
 * user’s assigned character. Returns undefined if no valid actor is found.
 *
 * @param actorUuid - Optional UUID of the actor to look up.
 * @returns The resolved actor or undefined.
 */
    static async findActor(actorUuid?: string): Promise<SR5Actor | undefined> {
        const user = game.user;
        if (!user) return;

        // 1: character by given uuid
        if (actorUuid) {
            const document = await fromUuid(actorUuid);
            if (document instanceof CONFIG.Actor.documentClass) {
                const actor = document as SR5Actor;
                if (actor.testUserPermission(user, "OWNER")) return actor;
            }
        }

        // 2: character by selected token
        const controlled = canvas.tokens?.controlled ?? [];
        if (controlled.length === 1) {
            const tokenActor = controlled[0].actor;
            if (tokenActor?.testUserPermission(user, "OWNER")) return tokenActor as SR5Actor;
        }

        // 3: user assigned character
        if (user.character) {
            return user.character as SR5Actor;
        }

        return undefined;
    }

    /**
 * Parse a teamwork roll string to extract and validate parameters.
 *
 * @param testAttributes - The attributes object with a raw `value` to parse.
 * @returns The updated `TestAttributes` with teamwork parameters applied.
 */
    static parseTeamworkString(testAttributes: TestAttributes) {
        try {
            const result = testAttributes;
            const raw = (result.value || '').trim();

            if (!raw) {
                result.testType = "teamwork";
                return result;
            }

            const tokens = raw
                .split('|')
                .map(s => s.trim())
                .filter(s => !!s);

            const seen = new Set<string>();

            let skill: string | undefined;
            result.allowOtherSkills = false;
            delete result.attribute;
            delete result.threshold;
            delete result.limit;

            for (const tok of tokens) {
                // X-Flag?
                if (/^x$/i.test(tok)) {
                    if (seen.has('x')) {
                        return ui.notifications?.error(`The "x" flag (allowOtherSkills) may only be specified once in a teamwork roll string.`);
                    }
                    seen.add('x');
                    result.allowOtherSkills = true;
                    continue;
                }

                // key=val?
                const [keyRaw, val] = tok.split('=');
                if (val !== undefined) {
                    const key = keyRaw.toLowerCase();
                    if (seen.has(key)) {
                        return ui.notifications?.error(`The parameter "${keyRaw}" was specified multiple times in your teamwork roll string; each parameter may only appear once.`);
                    }
                    seen.add(key);

                    switch (key) {
                        case 'skill':
                            skill = val;
                            break;
                        case 'attribute':
                            result.attribute = val;
                            break;
                        case 'threshold':
                            if (!/^\d+$/.test(val)) {
                                return ui.notifications?.error(`In a teamwork roll string, the threshold value must be an integer, but received: ${val}`);
                            }
                            result.threshold = val;
                            break;
                        case 'limit':
                            result.limit = val;
                            break;
                        default:
                            return ui.notifications?.error(`Invalid teamwork parameter: "${keyRaw}" is not recognized.`);
                    }
                    continue;
                }

                // empty Token → Skill
                if (!skill) {
                    seen.add('skill');
                    skill = tok;
                    continue;
                }

                return ui.notifications?.error(`Invalid token in teamwork roll string: "${tok}". Each entry must be either 'x' or a key=value pair like skill=…, attribute=…, threshold=… or limit=….`);
            }

            if (!skill) {
                return ui.notifications?.error(`In a teamwork roll string with parameters, at least one skill must be specified; an empty parameter list (e.g. @RollTeamwork[[]]) is allowed without a skill.`);
            }
            result.skill = skill;
            result.testType = "teamwork";
            return result;
        } catch (err: any) {
            console.error("parseTeamworkString error:", err);
            return { ...testAttributes, testType: "invalid" };
        }
    }

    /**
     * Parse a roll-test string and populate the corresponding TestAttributes.
     *
     * Supports three formats:
     * - Success tests: `"skill/attribute + attribute [limit] (threshold)"`
     * - Extended tests: `"skill/attribute + attribute [limit] (threshold, interval)"`
     * - Opposed tests: `"skill/attribute + attribute [limit] vs opposedSkill/Attribute + opposedAttribute [opposedLimit]"`
     *
     * @param testAttributes - The initial TestAttributes containing a raw `value` string.
     * @returns The same TestAttributes object with fields (`skill`, `attribute`, `limit`,
     * `threshold`, `interval`, `opposedSkill`, `opposedAttribute`, `opposedLimit`, `testType`)
     * filled in according to the parsed format.
     */
    static parseTestString(testAttributes: TestAttributes): TestAttributes {
        const result = testAttributes;
        const rawString = (result.value || "").trim();

        // Helper: parse one side of a test
        const parsePart = (part: string) => {
            const match = part.match(/^([^+]+)\s*\+\s*([^\[\(]+)(?:\s*\[(.*?)\])?$/);
            if (!match) return null;

            return {
                skillOrAttribute: match[1].trim(),
                secondAttribute: match[2].trim(),
                limit: match[3]?.trim()
            };
        };

        try {
            // Extended Test: (...)(threshold, interval)
            const extendedMatch = rawString.match(/^(.+?)\s*\((\d+)\s*,\s*([^)]+)\)$/);
            if (extendedMatch) {
                const part = parsePart(extendedMatch[1]);
                if (part) {
                    result.skill = part.skillOrAttribute;
                    result.attribute = part.secondAttribute;
                    result.limit = part.limit;
                    result.threshold = extendedMatch[2];
                    result.interval = extendedMatch[3].trim();
                    result.testType = "extended";
                    return result;
                } else {
                    console.warn("parseTestString: could not parse extended part:", extendedMatch[1]);
                }
            }

            // Opposed Test: ... vs ...
            const opposedMatch = rawString.split(/\s+(?:gegen|versus|vs\.?)\s+/i);
            if (opposedMatch.length === 2) {
                const left = parsePart(opposedMatch[0]);
                const right = parsePart(opposedMatch[1]);
                if (left && right) {
                    result.skill = left.skillOrAttribute;
                    result.attribute = left.secondAttribute;
                    result.limit = left.limit;

                    result.opposedSkill = right.skillOrAttribute;
                    result.opposedAttribute = right.secondAttribute;
                    result.opposedLimit = right.limit;

                    result.testType = "opposed";
                    return result;
                } else {
                    console.warn("parseTestString: could not parse opposed parts:", opposedMatch);
                }
            }

            // Success Test: optional threshold in ()
            const successMatch = rawString.match(/^(.+?)\s*(?:\((\d+)\))?$/);
            if (successMatch) {
                const part = parsePart(successMatch[1]);
                if (part) {
                    result.skill = part.skillOrAttribute;
                    result.attribute = part.secondAttribute;
                    result.limit = part.limit;
                    result.threshold = successMatch[2];
                    result.testType = "success";
                    return result;
                } else {
                    console.warn("parseTestString: could not parse success part:", successMatch[1]);
                }
            }

            console.warn("parseTestString: unrecognized format:", rawString);
            result.testType = "invalid";
            return result;
        } catch (err: any) {
            console.error("parseTestString error:", err, rawString);
            result.testType = "invalid";
            return result;
        }
    }

    /**
 * Serialize roll/test parameters into HTML data attributes for link elements.
 *
 * Iterates over known `TestAttributes` fields and, for each non-empty value,
 * adds the corresponding `data-` attribute (e.g. `data-skill`, `data-attribute`,
 * `data-threshold`, etc.). Always includes `data-request` for the test type,
 * plus `label` and `title` for display.
 *
 * @param data - The {@link TestAttributes} object containing roll/test parameters.
 * @returns A record of HTML attribute names to stringified values for insertion.
 */
    static buildRollRequestAttributes(data: TestAttributes): Record<string, string> {

        const attrs: Record<string, string> = {
            label: data.label,
            title: data.label,
            "data-request": data.testType
        };

        const fields: [keyof TestAttributes, string][] = [
            ["skill", "data-skill"],
            ["attribute", "data-attribute"],
            ["attribute2", "data-attribute2"],
            ["limit", "data-limit"],
            ["threshold", "data-threshold"],
            ["interval", "data-interval"],
            ["opposedSkill", "data-opposedSkill"],
            ["opposedAttribute", "data-opposedAttribute"],
            ["opposedAttribute2", "data-opposedAttribute2"],
            ["opposedLimit", "data-opposedLimit"],
            ["name", "data-name"],
            ["actorUuid", "data-actor-uuid"],
            ["packKey", "data-packKey"],
            ["label", "data-label"],

        ];

        for (const [key, attr] of fields) {
            const value = data[key] != null ? `${data[key]}`.trim() : "";;
            if (typeof value === "string" && value !== "" && value !== "0") {
                attrs[attr] = value;
            }
        }

        return attrs;
    }

    /**
 * Parse element dataset into a TestAttributes object.
 *
 * Reads standard `data-*` attributes (skill, attribute, limit, threshold, interval,
 * opposedSkill, opposedAttribute, name, actorUuid, packKey, allowOtherSkills, etc.),
 * plus `label` and `request` type, and maps them to the corresponding fields on
 * {@link TestAttributes}.
 *
 * @param dataset - The {@link DOMStringMap} from an HTML element’s dataset.
 * @returns A {@link TestAttributes} object populated with values from the dataset.
 */
    static deconstructRollRequestAttributes(dataset: DOMStringMap): TestAttributes {
        const testAttributes: TestAttributes = {
            label: dataset.label ?? "",
            testType: dataset.request as TestAttributes["testType"] ?? "invalid",
            value: ""
        };

        const keyMap: Record<string, keyof Omit<TestAttributes, "label" | "testType">> = {
            skill: "skill",
            attribute: "attribute",
            attribute2: "attribute2",
            limit: "limit",
            threshold: "threshold",
            interval: "interval",
            opposedskill: "opposedSkill",
            opposedattribute: "opposedAttribute",
            opposedattribute2: "opposedAttribute2",
            opposedlimit: "opposedLimit",
            name: "name",
            actoruuid: "actorUuid",
            packkey: "packKey",
            allowOtherSkills: "allowOtherSkills"
        };

        for (const [key, value] of Object.entries(dataset)) {
            const mappedKey = keyMap[key.toLowerCase()];
            if (mappedKey && typeof value === "string" && mappedKey !== "allowOtherSkills") {
                testAttributes[mappedKey] = value;
            } else if (mappedKey === "allowOtherSkills") {
                testAttributes[mappedKey] = true;
            }
        }

        return testAttributes;
    }

    /**
 * Find the internal attribute key corresponding to a localized label.
 *
 * Iterates over the SR5.attributes mapping (excluding certain non-rollable keys),
 * normalizes both the localized name and the search string, and returns the matching
 * attribute key. Returns an empty string if no match is found.
 *
 * @param searchedFor - The localized attribute label to look up.
 * @returns The matching {@link ActorAttribute} key, or an empty string if none found.
 */
    static getAttributeKeyByLabel(searchedFor?: string): ActorAttribute {
        if (!searchedFor) return '';

        const disallowedKeys = ['pilot', 'force', 'initiation', 'submersion', 'rating'];

        for (const [key, i18nKey] of Object.entries(SR5.attributes)) {
            if (disallowedKeys.includes(key)) continue;

            const translated = game.i18n.localize(i18nKey);
            if (this.normalizeLabel(translated) === this.normalizeLabel(searchedFor)) {
                return key as ActorAttribute;
            }
        }

        return '';
    }

    /**
 * Look up the internal limit key for a localized limit label.
 *
 * Iterates over the `SR5.limits` mapping, localizes each entry via `game.i18n.localize`,
 * normalizes labels using `normalizeLabel`, and returns the matching key.
 *
 * @param searchedFor - The localized limit label to resolve.
 * @returns The corresponding limit key from {@link SR5.limits}, or an empty string if none matches.
 */
    static getLimitKeyByLabel(searchedFor?: string): Shadowrun.Limit {
        if (!searchedFor) return '';

        for (const [key, i18nKey] of Object.entries(SR5.limits)) {
            const translated = game.i18n.localize(i18nKey);
            if (this.normalizeLabel(translated) === this.normalizeLabel(searchedFor)) {
                return key as keyof typeof SR5.limits;
            }
        }

        return '';
    }

    static normalizeLabel(label: string): string {

        if (typeof label !== 'string') return "";

        return label
            .toLowerCase()
            .trim()
            .replace(/[\s_\-–—]+/g, "");
    }
}

