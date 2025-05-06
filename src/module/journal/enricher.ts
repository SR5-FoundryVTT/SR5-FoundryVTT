import { TestCreator } from './../tests/TestCreator';
import { SR5Actor } from "../actor/SR5Actor";
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";

interface TestAttributes {
    skill?: string;
    attribute?: string;
    attribute2?: string;
    limit?: string;
    threshold?: string;
    interval?: string;
    opposedSkill?: string;
    opposedAttribute?: string;
    opposedAttribute2?: string;
    opposedLimit?: string;
    name?: string;
    documentUuid?: string;
    compendiumKey?: string;
    label: string;
    value: string;
    testType: "success" | "opposed" | "extended" | "teamwork" | "action" | "macro" | "invalid";
}

export class JournalEnrichers {

    static get keywords() {
        return ["RollAction", "RollAttribute", "RollMacro", "RollSkill", "RollTeamwork", "RollTest"]
    };

    static toLowerUnderscore(str) {
        return str.replace(/ /g, '_').toLowerCase();
    }

    static setEnrichers() {
        const typePattern = `(${JournalEnrichers.keywords.join("|")})`;
        const opening = "\\[\\[";
        const valuePattern = "((?:[^\\[\\]]|\\[[^\\[\\]]*\\])*)";
        const closing = "\\]\\]";
        const labelPattern = "(?:\\{([^}]+)\\})?";

        //@ts-expect-error
        CONFIG.TextEditor.enrichers.push(
            {
                pattern: new RegExp(`@${typePattern}${opening}${valuePattern}${closing}${labelPattern}`, "g"),
                enricher: (match, options) => {
                    const type = match[1]
                    const value = match[2].trim() as string
                    const label = match[3] || value.replace(/_/g, " "); // Use label if provided, else use action name

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
                            testAttributes.testType = "teamwork";
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
                            if (parts.length === 2) testAttributes.compendiumKey = parts[1];
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

                    const attrs = this.buildRollRequestAttributes(testAttributes);

                    for (const [key, value] of Object.entries(attrs)) {
                        $link.attr(key, value);
                    }

                    return $link[0];
                }
            },
        )
    }

    static setEnricherHooks() {
        const handleClick = (data) => async (ev: JQuery.TriggeredEvent) => {
            const user = game.user;
            if (!user) return;

            const documentUuid = data.document?.uuid;

            const actor = await this.findActor(documentUuid);

            const dataset = ev.currentTarget.dataset;

            if ($(ev.target).hasClass('fa-comment-alt')) {
                ev.preventDefault();
                ev.stopPropagation();

                console.log("Sending test request to chat:", ev.currentTarget.dataset.request, ev.currentTarget.title);

                // --- Speaker-Bestimmung ---
                let speaker = actor ? { actor: actor.id } : { alias: user.name };

                const templateData = JournalEnrichers.deconstructRollRequestAttributes(dataset);

                if (actor) templateData["actor"] = { name: actor.name, img: actor.img, uuid: actor.uuid };

                // // "name" nur setzen, wenn es für action oder macro relevant ist
                // if ((dataset.request === "action" || dataset.request === "macro") && dataset.name?.trim()) {
                //     templateData.name = dataset.name;
                // }

                console.log("handleClick templateData: ", templateData);

                const html = await renderTemplate('systems/shadowrun5e/dist/templates/chat/rollRequest.html', templateData);

                await ChatMessage.create({
                    user: game.user?.id,
                    speaker: speaker,
                    content: html
                });
            } else {
                const testAttributes: TestAttributes = JournalEnrichers.deconstructRollRequestAttributes(dataset);
                switch (testAttributes.testType) {

                    case "opposed":
                    case "extended":
                    case "success":
                        // await JournalEnrichers.rollSuccessTest(testAttributes);
                        break;

                    case "teamwork":
                        // await JournalEnrichers.initiateTeamworkTest(testAttributes)
                        break;

                    case "action":
                        await JournalEnrichers.rollAction(testAttributes);
                        break;

                    case "macro":
                        await JournalEnrichers.executeMacro(testAttributes);
                        break;

                    default:
                        console.warn(`Unhandled testType: ${testAttributes.testType}`);
                }
            }
        };

        ["renderJournalPageSheet", "renderItemSheet", "renderActorSheet"].forEach(hook => {
            Hooks.on(hook, (app, html, data) => {
                html.on("click", ".sr5-roll-request", handleClick(data));
            });
        });

        Hooks.on('renderChatMessage', (app, html, data) => {
            html.on("click", ".sr5-roll-request", handleClick(data));
        });
    }

    static async executeMacro(testattributes: TestAttributes) {
        const macroName = testattributes.name?.trim();
        const compendiumKey = testattributes.compendiumKey?.trim() || "world.macros"; // vollständiger Pfad

        if (!macroName) {
            ui.notifications?.warn("Kein Makroname angegeben.");
            return;
        }

        try {
            const pack = game.packs.get(compendiumKey);
            if (!pack) {
                ui.notifications?.error(`Compendium '${compendiumKey}' nicht gefunden.`);
                return;
            }

            const index = await pack.getIndex();
            const entry = index.find(e => e.name === macroName);
            if (!entry) {
                ui.notifications?.error(`Makro '${macroName}' im Compendium '${compendiumKey}' nicht gefunden.`);
                return;
            }
            const document = await pack.getDocument(entry._id);
            if (document instanceof Macro) {
                await document.execute();
            } else {
                ui.notifications?.error("Das gefundene Dokument ist kein Makro.");
            }

        } catch (error) {
            console.error(`Fehler beim Ausführen von Makro '${macroName}' aus '${compendiumKey}':`, error);
            ui.notifications?.error("Fehler beim Ausführen des Makros. Siehe Konsole für Details.");
        }
    }

    static async rollAction(testattributes: TestAttributes) {
        const user = game.user;
        if (!user || !testattributes.name) return;
        const compendiumKey = testattributes.compendiumKey ?? "actions"; // Use the same compendium key that worked in the macro

        console.log(`Attempting to roll action: ${testattributes.name} from compendium: ${compendiumKey}`);

        let actor = await this.findActor(testattributes.documentUuid);

        if (!actor) {
            ui.notifications?.error("No actor found to perform this action.");
            return;
        }

        try {
            const test = await TestCreator.fromPackAction(compendiumKey, testattributes.name, actor);
            await test?.execute();
        } catch (error) {
            ui.notifications?.error("Error using TestCreator.fromPackAction:", error);
        }
    }

    static async findActor(documentUuid?: string): Promise<SR5Actor | undefined> {
        const user = game.user;
        if (!user) return;

        // 1. Check the UUID directly
        if (documentUuid) {
            const document = await fromUuid(documentUuid);
            if (document instanceof CONFIG.Actor.documentClass) {
                const actor = document as SR5Actor;
                if (actor.testUserPermission(user, "OWNER")) return actor;
            }

            if (document instanceof CONFIG.Item.documentClass) {
                const actor = document.actorOwner as SR5Actor;
                if (actor.testUserPermission(user, "OWNER")) return actor;
            }
        }

        // 2. Check controlled token
        const controlled = canvas.tokens?.controlled ?? [];
        if (controlled.length === 1) {
            const tokenActor = controlled[0].actor;
            if (tokenActor?.testUserPermission(user, "OWNER")) return tokenActor as SR5Actor;
        }

        // 3. Use user's assigned character
        if (user.character) {
            return user.character as SR5Actor;
        }

        return undefined;
    }

    // /**
    //  * This hook listens to roll-request clicks, extracts the data and forwards it to create a chat message
    //  * @param journal The journal where the roll is triggered
    //  * @param html the triggering html
    //  * @param data 
    //  */
    // static async setEnricherHooks(journal, html, data) {
    //     const rolls = {
    //         "Teamwork": "startTeamworkTest",
    //         "RollSkill": "rollSkill",
    //         "RollAttribute": "rollAttribute"
    //     }

    //     html.on("click", ".sr5-roll-request", (ev) => {
    //         const element = ev.currentTarget

    //         const rollType = element.dataset.request
    //         const rollTypeName = "SR5.GMRequest." + rollType;
    //         const rollEntity = element.dataset.skill
    //         let rollEntityName = JournalEnrichers.getRollEntityTranslation(rollType, rollEntity);
    //         const threshold = element.dataset.threshold

    //         const templateData = {
    //             rollType: rolls[rollType],
    //             rollTypeName: rollTypeName,
    //             rollEntity: rollEntity,
    //             rollEntityName: rollEntityName,
    //             threshold: threshold
    //         }

    //         JournalEnrichers.createChatMessage(templateData);
    //     })
    // }

    // /**
    //  * This method provides translations respecting the rollType
    //  * @param type what rollType is requestd
    //  * @param rollEntity what should be rolled
    //  * @returns the translation or rollEntity when the keyword is unknown
    //  */
    // static getRollEntityTranslation(type: string, rollEntity: string) {
    //     if (type === "RollSkill" || type === "RollTeamwork") {
    //         return Helpers.getSkillTranslation(rollEntity)
    //     }

    //     if (type === "RollAttribute") {
    //         return Helpers.getAttributeTranslation(rollEntity)
    //     }

    //     return rollEntity;
    // }

    // static async chatlogRequestHooks(html) {
    //     // setup chat listener messages for each message as some need the message context instead of chatlog context.
    //     html.find('.chat-message').each(async (index, element) => {
    //         element = $(element);
    //         const id = element.data('messageId');
    //         const message = game.messages?.get(id);
    //         if (!message) return;

    //         await this.messageRequestHooks(element)
    //     });
    // }

    // static async messageRequestHooks(html) {
    //     html.find('.sr5-requestAnswer').on('click', async (ev) => {
    //         const element = ev.currentTarget

    //         const rollType = element.dataset.request
    //         const rollEntity = element.dataset.rollentity
    //         const threshold = parseInt(element.dataset.threshold)

    //         let actor = await Helpers.chooseFromAvailableActors()

    //         if (actor == undefined) {
    //             //in a normal running game this should not happen
    //             ui.notifications?.error('SR5.Errors.NoAvailableActorFound', { localize: true });
    //             return
    //         }

    //         actor[rollType](rollEntity, { threshold: { base: threshold, value: threshold } })
    //     })
    // }

    // static async createChatMessage(templateData) {
    //     const html = await renderTemplate('systems/shadowrun5e/dist/templates/chat/rollRequest.html', templateData);

    //     const chatData = {
    //         user: game.user?.id,
    //         speaker: ChatMessage.getSpeaker(),
    //         content: html
    //     };

    //     await ChatMessage.create(chatData)
    // };

    static parseTestString(input: TestAttributes): TestAttributes {
        const result = input;
        const rawString = input.value;

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
            }
        }

        return result;
    }

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
            ["documentUuid", "data-documentUuid"],
            ["compendiumKey", "data-compendiumKey"],
            ["label", "data-label"],

        ];

        for (const [key, attr] of fields) {
            const value = data[key]?.trim();
            if (typeof value === "string" && value !== "" && value !== "0") {
                attrs[attr] = value;
            }
        }

        return attrs;
    }

    static deconstructRollRequestAttributes(dataset: DOMStringMap): TestAttributes {
        const testAttributes: TestAttributes = {
            label: dataset.label ?? "",
            testType: dataset.request as TestAttributes["testType"] ?? "invalid",
            value: ""
        };

        console.log(dataset);

        // Mapping von lowercase keys zu echten Feldnamen
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
            documentuuid: "documentUuid",
            compendiumkey: "compendiumKey"
        };

        for (const [key, value] of Object.entries(dataset)) {
            const mappedKey = keyMap[key.toLowerCase()];
            if (mappedKey && typeof value === "string") {
                testAttributes[mappedKey] = value;
            }
        }

        return testAttributes;
    }

    // static findActorFromElement(currentTarget: HTMLElement): SR5Actor | undefined {
    //     // 1. Chat Card – Versuche zuerst actorId direkt aus der Chatnachricht
    //     const chatMessage = currentTarget.closest<HTMLElement>(".message[data-actor-id], .message[data-token-id]");
    //     const actorId = chatMessage?.dataset.actorId;
    //     if (actorId) {
    //         const actor = game.actors?.get(actorId);
    //         if (actor) return actor;
    //     }

    //     // 1b. Alternativ: Wenn tokenId gesetzt ist, versuche, den Token zu holen
    //     const tokenId = chatMessage?.dataset.tokenId;
    //     if (tokenId && canvas.scene) {
    //         const tokenDoc = canvas.scene.tokens.get(tokenId);
    //         if (tokenDoc) {
    //             const actor = tokenDoc.actor;
    //             if (actor) return actor;
    //         }
    //     }

    //     // 2. Item-Fenster oder Actor/Item-Sheets
    //     const itemElement = currentTarget.closest<HTMLElement>('[data-item-id], .item');
    //     const appElement = itemElement?.closest<HTMLElement>('.window-app');
    //     const appId = parseInt(appElement?.dataset.appid ?? "");
    //     if (!isNaN(appId)) {
    //         const app = ui.windows[appId];

    //         // Typisierung über Type Assertion (as any oder spezieller)
    //         const sheet = app as any;

    //         // a) Direkt Actor
    //         if (sheet?.document instanceof SR5Actor) return sheet.document;

    //         // b) Oder Item → Actor
    //         if (sheet?.document instanceof SR5Item && sheet.document.actorOwner) {
    //             return sheet.document.actorOwner;
    //         }
    //     }

    //     // 3. Fallback: Item direkt vom DOM-Element
    //     const itemEntry = itemElement as any;
    //     const item = itemEntry?.item;
    //     if (item instanceof SR5Item && item.actorOwner) return item.actorOwner;

    //     return undefined;
    // }
}
