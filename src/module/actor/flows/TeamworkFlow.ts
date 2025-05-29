import { ParserSelector } from './../../apps/importer/actorImport/itemImporter/importHelper/ParserSelector';
import { SR5Actor } from '../SR5Actor';
import { FLAGS, SYSTEM_NAME } from '../../constants';
import { SocketMessage } from "../../sockets";
import { SuccessTest } from '../../tests/SuccessTest';
import { Helpers } from '../../helpers'
import { Translation } from '../../utils/strings';
import { TeamWorkDialog } from '../../apps/dialogs/TeamworkDialog';
import { JournalEnrichers, TestAttributes } from '../../journal/enricher';
import { DataDefaults } from '../../data/DataDefaults';
import { TestCreator } from '../../tests/TestCreator';
import { SR5Roll } from '../../rolls/SR5Roll';
import { SR5 } from '../../config';

export type AttributeKey = keyof typeof SR5.attributes;
export type LimitKey = keyof typeof SR5.limits;

export interface TeamworkMessageData {
    /** Liste aller wählbaren Akteure */
    actor: SR5Actor;
    /** Aktuell ausgewählter Skill */
    skill: SkillEntry;
    /** Aktuell ausgewähltes Attribut */
    attribute?: AttributeKey;
    /** Vorgeschlagener Schwellenwert */
    threshold?: number;
    limit?: string;
    /** Checkbox: auch andere Skills erlauben */
    allowOtherSkills: boolean;
    /** Soll die Checkbox angezeigt werden? */
    showAllowOtherSkills: boolean;
    additionalDice: Shadowrun.ValueMaxPair<number>;
    additionalLimit: number;
    criticalGlitched: boolean;
    specialization: boolean;
    participants: ParticipantEntry[];
}

interface ParticipantEntry {
    actor: SR5Actor;
    netHits: number;
    glitched: boolean;
    criticalGlitched: boolean;
    differentSkill: Shadowrun.SkillField | undefined,
    differentAttribute: AttributeEntry | undefined,
    differentLimit: LimitEntry | undefined
}

export interface SkillEntry {
    id: string;
    label: string;
    attribute: AttributeKey;   
    limit: LimitKey;                    
}

export interface AttributeEntry {
    name: AttributeKey;
    label: string;
}

export interface LimitEntry {
    name: LimitKey;
    label: string;
    base?: number;
}

export interface SkillGroup {
    group: string;
    skills: SkillEntry[];
}

export class TeamworkFlow {

    /** Gruppierte und sortierte Skill‐Listen für den Dialog und die Flows */
    static buildSkillGroups(actor?: SR5Actor): SkillGroup[] {
        if (!actor) return [];
        const { active, language, knowledge } = actor.getSkills();
        const attrs = actor.getAttributes();
        const sortBy = (a: SkillEntry, b: SkillEntry) =>
            a.label.localeCompare(b.label);

        const groups: SkillGroup[] = [];

        // Active
        const activeSkills = Object.entries(active)
            .map(([id, s]) => ({
                id,
                label: game.i18n.localize(s.label as Translation) ?? s.name,
                attribute: s.attribute as AttributeKey,
                limit: attrs[s.attribute]?.limit as LimitKey ?? ""
            }))
            .sort(sortBy);
        if (activeSkills.length) groups.push({ group: "Active Skills", skills: activeSkills });

        // Language
        // Language Skills
        const languageSkills: SkillEntry[] = Object.entries(language.value ?? {})
            .map(([id, skill]) => ({
                id,
                label: game.i18n.localize(skill.label as Translation) ?? skill.name,
                attribute: skill.attribute as AttributeKey,
                limit: attrs[skill.attribute]?.limit as LimitKey ?? ""
            }))
            .sort(sortBy);

        if (languageSkills.length) {
            groups.push({ group: "Language Skills", skills: languageSkills });
        }


        // Knowledge‐Gruppen
        for (const [catKey, catList] of Object.entries(knowledge) as [keyof Shadowrun.KnowledgeSkills, Shadowrun.KnowledgeSkillList][]) {
            const entries = catList.value ?? {};
            const list = Object.entries(entries)
                .map(([id, s]) => ({
                    id,
                    label: game.i18n.localize(s.label as Translation) ?? s.name,
                    attribute: s.attribute as AttributeKey,
                    limit: attrs[s.attribute]?.limit as LimitKey ?? ""
                }))
                .sort(sortBy);
            if (list.length) groups.push({ group: `Knowledge (${catKey})`, skills: list });
        }

        return groups;
    }

    /** Flache Liste aller Attribute für den Dialog */
    static buildAttributeList(actor: SR5Actor): { name: AttributeKey; label: string }[] {
        return Object.entries(actor.getAttributes())
            .map(([key, field]) => ({
                name: key as AttributeKey,
                label: game.i18n.localize(field.label as Translation)
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    static async chatLogListeners(chatLog: ChatLog, html) {
        // setup chat listener messages for each message as some need the message context instead of chatlog context.
        html.find('.chat-message').each(async (index, element) => {
            element = $(element);
            const id = element.data('messageId');
            const message = game.messages?.get(id);
            if (!message) return;

            await this.chatMessageListeners(message, element)
        });
    }

    static async chatMessageListeners(message: ChatMessage, html) {
        if (!html.find('.sr5-teamwork-addparticipant'))
            return;

        html.find('.sr5-teamwork-addparticipant').on('click', _ => this.addParticipant(message));
        html.find('.sr5-teamwork-start').on('click', _ => this.rollTeamworkTest(message));
    }



    static async initiateTeamworkTest(testAttributes: TestAttributes) {
        const user = game.user;
        if (!user || !game.actors || !testAttributes) return;

        const selectedActor = await JournalEnrichers.findActor();
        const actors: SR5Actor[] = game.actors.filter(actor =>
            actor.testUserPermission(user, "OWNER")
        ) ?? [selectedActor];

        const dialogData = await new TeamWorkDialog({
            actors,
            selectedActor,
            selectedSkill: testAttributes.skill,
            selectedAttribute: testAttributes.attribute,
            threshold: Number(testAttributes.threshold) || undefined,
            allowOtherSkills: Boolean(testAttributes.allowOtherSkills) ?? false,
            limit: testAttributes.limit,
            request: true,
            lockedSkill: false
        }).select();

        if (dialogData.cancelled) return;

        // Setze initiales Flag-Objekt
        const teamworkData = {
            actor: dialogData.actor,
            skill: dialogData.skill,
            attribute: dialogData.attribute,
            threshold: dialogData.threshold,
            limit: dialogData.limit,
            allowOtherSkills: dialogData.allowOtherSkills,
            showAllowOtherSkills: dialogData.showAllowOtherSkills,
            participants: [],
            criticalGlitched: false,
            additionalDice: {
                value: 0,
                max: dialogData.actor.getSkill(dialogData.skill.id).base ?? 0
            },
            additionalLimit: 0,
            specialization: dialogData.specialization
        };

        const templateContext = {
            ...teamworkData,
            limit: (SR5.limits as Record<string, string>)[dialogData.limit] ?? undefined,
            attribute: (SR5.attributes as Record<string, string>)[dialogData.attribute] ?? undefined
        };

        // Rendern und ChatMessage anlegen
        const content = await renderTemplate("systems/shadowrun5e/dist/templates/chat/teamworkRequest.html", templateContext);
        const msg = await ChatMessage.create({
            user: user.id,
            speaker: ChatMessage.getSpeaker(),
            content
        });

        if (!msg) {
            return ui.notifications?.error("Teamwork-Nachricht nicht gefunden");
        }

        await msg.setFlag(SYSTEM_NAME, FLAGS.Test, teamworkData);
    }

    /**
     * This method prompts the user to roll the skill chosen in the teamwork test from a chosen actor @see Helpers.chooseFromAvailableActors
     * The result is forwarded to @see addResultsToMessage to add text and flag data to the original message
     * 
     * @param message 
     * @returns 
     */
    static async addParticipant(message: ChatMessage) {
        const user = game.user;
        if (!user || !game.actors || !message) return;

        const teamworkData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as TeamworkMessageData;

        const selectedActor = await JournalEnrichers.findActor();
        const actors: SR5Actor[] = game.actors.filter(actor =>
            actor.testUserPermission(user, "OWNER")
        ) ?? [selectedActor];

        const selection = await new TeamWorkDialog({
            actors,
            selectedActor,
            selectedSkill: teamworkData.skill.id,
            selectedAttribute: teamworkData.attribute,
            threshold: teamworkData.threshold,
            allowOtherSkills: teamworkData.allowOtherSkills,
            limit: teamworkData.limit,
            request: false,
            lockedSkill: !teamworkData.allowOtherSkills
        }).select();

        if (!selection) return;

        const actor: SR5Actor = selection.actor;

        // 1) Basis-ActionData holen
        const skillAction: Shadowrun.ActionRollData | undefined = actor.skillActionData(selection.skill.id, { specialization: selection.specialization });
        if (!skillAction) {
            return;
        }

        // 2) Attribut überschreiben, falls der User ein anderes gewählt hat
        const attribute = JournalEnrichers.getAttributeKeyByLabel(selection.attribute ?? "");
        if (attribute !== '') {
            skillAction.attribute = attribute;
        }

        // 3) Threshold eintragen
        const threshold = selection.threshold ?? 0;
        skillAction.threshold = { value: threshold, base: threshold };


        // 4) Limit setzen: Zahl vs. Attribut-Limit
        const limit = selection.limit;
        if (typeof limit === "number") {
            // fester Wert: nur value/base anpassen, attribute bleibt wie in skillActionData
            skillAction.limit.value = limit;
            skillAction.limit.base = limit;
        } else if (typeof limit === "string" && limit !== "") {
            // Attribut‐Limit
            const actual = actor.getLimit(limit).base ?? 0;
            skillAction.limit.value = actual;
            skillAction.limit.base = actual;
            skillAction.limit.attribute = limit as Shadowrun.LimitAttribute;
        }

        // 5) Test erstellen & ausführen
        try {
            const test = await TestCreator.fromAction(skillAction, actor);
            if (!test) return;
            test.data.title = teamworkData.skill.label;
            const results = await test.execute() as SuccessTest;

            // 6) Ergebnis in die ursprüngliche Message einhängen
            await TeamworkFlow.addResultsToMessage(
                message,
                actor,
                results
            );
        } catch (err) {
            //TODO: Lokalisierung
            console.error("Fehler im Teilnehmer-Wurf:", err);
            ui.notifications?.error("Fehler im Teilnehmer-Wurf:", err);
        }
    }


    /**
     * This method analyses the roll result and adds the text and flag data to the original message
     * @param message to add text too
     * @param actor that made the roll
     * @param results of the roll
     */
    static async addResultsToMessage(message: ChatMessage, actor: SR5Actor, results: SuccessTest) {

        // 1.) Flag auslesen
        const teamworkData = (await message.getFlag(SYSTEM_NAME, FLAGS.Test)) as TeamworkMessageData;

        console.log(teamworkData, results);

        // 2.) Neue Teilnehmer-Info anhängen
        const netHits = results.data.values.netHits.value;
        teamworkData.participants.push({
            actor: actor,
            netHits,
            glitched: results.rolls[0].glitched,
            criticalGlitched: teamworkData.criticalGlitched,
            differentSkill: results.data.action.skill !== teamworkData.skill.id ? actor.getSkill(results.data.action.skill) : undefined,
            differentAttribute: results.data.action.attribute !== teamworkData.attribute ? (SR5.attributes as Record<AttributeKey, string>)[results.data.action.attribute] : undefined,
            differentLimit: typeof teamworkData.limit === "string"
                ? (results.data.action.limit.attribute !== teamworkData.limit
                    ? (SR5.limits as Record<LimitKey, string>)[results.data.action.limit.attribute]
                    : undefined)
                : (typeof teamworkData.limit === "number" && results.data.action.limit.base !== teamworkData.limit
                    ? `${results.data.action.limit.base}`
                    : undefined)
        });

        // 3.) Content komplett neu rendern
        const content = await renderTemplate(
            "systems/shadowrun5e/dist/templates/chat/teamworkRequest.html",
            teamworkData
        );

        // 5. Aktualisiere teamworkData
        teamworkData.additionalDice.value = (teamworkData.additionalDice.value ?? 0) + netHits;
        teamworkData.additionalLimit = (teamworkData.additionalLimit ?? 0) + (results.rolls[0].total > 0 && !results.rolls[0].glitched ? 1 : 0);
        teamworkData.criticalGlitched = teamworkData.criticalGlitched || (results.rolls[0].criticalGlitched);

        // 4.) ChatMessage updaten — Content + Flag
        try {
            if (game.user?.isGM) {
                await message.setFlag(SYSTEM_NAME, FLAGS.Test, teamworkData);
                await message.update({ content });
            }
            else {
                await this._sendUpdateSocketMessage(message, content, teamworkData)
            }
        } catch (err) {
            ui.notifications?.error(`Teamwork: ${err}`);
        }

    }

    /**
     * This method prompts the roll of the final teamwork test of the leader
     * @param message 
     */
    static async rollTeamworkTest(message: ChatMessage) {
        const teamworkData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as TeamworkMessageData;

        const actor = game.actors?.get((teamworkData.actor as any)._id);

        if (!actor) return;

        await actor.rollTeamworkTest(teamworkData);
    }

    /**
     * Send out a socket message to a connected GM to update the message.
     * @param actor The actor to create the effects on.
     * @param effectsData The effects data to be applied;
     */
    static async _sendUpdateSocketMessage(message: ChatMessage, content: String, teamworkData: TeamworkMessageData) {
        await SocketMessage.emitForGM(FLAGS.TeamworkTestFlow, { messageUuid: message.uuid, content: content, teamworkData: teamworkData });
    }

    /**
     * Handle a sent socket message to update the content and flags of a message.
     * @param {string} message.actorUuid Must contain the uuid of the actor to create the effects on.
     * @param {ActiveEffectData[]} message.effectsData Must contain a list of effects data to be applied.
     * @returns 
     */
    static async _handleUpdateSocketMessage(socketMessage: Shadowrun.SocketMessageData) {
        if (!socketMessage.data.hasOwnProperty('messageUuid') || !socketMessage.data.hasOwnProperty('content') || !socketMessage.data.hasOwnProperty('teamworkData')) {
            console.error(`Shadowrun 5e | Teamwork Socket Message is missing necessary properties`, socketMessage);
            return;
        }

        const message = fromUuidSync(socketMessage.data.messageUuid);

        message?.setFlag(SYSTEM_NAME, FLAGS.Test, socketMessage.data.teamworkData)
        message?.update({ content: socketMessage.data.content })
    }

    /**
 * Baut die flache Skill-Liste für einen Actor im gewünschten Format.
 */
    // static buildSkillsList(actor?: SR5Actor): SkillGroup[] {

    //     if (!actor) return [];

    //     const { active, language, knowledge } = actor.getSkills();
    //     const sortBy = (a: SkillEntry, b: SkillEntry) => a.label.localeCompare(b.label);

    //     const groups: SkillGroup[] = [];

    //     const activeSkills: SkillGroup = {
    //         group: "Active Skills",
    //         skills: Object.entries(active)
    //             .map(([id, skill]) => {
    //                 const attribute = skill.attribute as Shadowrun.ActorAttribute;
    //                 const limit = actor.getAttributes()[attribute]?.limit ?? '';
    //                 return {
    //                     id,
    //                     label: skill.label ?? skill.name,
    //                     attribute: attribute,
    //                     defaultLimit: limit
    //                 };
    //             })
    //             .sort(sortBy)
    //     };
    //     if (activeSkills.skills.length) groups.push(activeSkills);

    //     const languageSkills: SkillGroup = {
    //         group: "Language Skills",
    //         skills: Object.entries(language.value)
    //             .map(([id, skill]) => {
    //                 const attribute = skill.attribute as Shadowrun.ActorAttribute;
    //                 const limit = actor.getAttributes()[attribute]?.limit ?? '';
    //                 return {
    //                     id,
    //                     label: skill.label ?? skill.name,
    //                     attribute: attribute,
    //                     defaultLimit: limit
    //                 };
    //             })
    //             .sort(sortBy)
    //     };
    //     if (languageSkills.skills.length) groups.push(languageSkills);

    //     // Knowledge Skills per category
    //     const streetSkills: SkillGroup = {
    //         group: "Knowledge (Street) Skills",
    //         skills: Object.entries(knowledge.street.value)
    //             .map(([id, skill]) => {
    //                 const attribute = skill.attribute as Shadowrun.ActorAttribute;
    //                 const limit = actor.getAttributes()[attribute]?.limit ?? '';
    //                 return {
    //                     id,
    //                     label: skill.label ?? skill.name,
    //                     attribute: attribute,
    //                     defaultLimit: limit
    //                 };
    //             })
    //             .sort(sortBy)
    //     };
    //     if (streetSkills.skills.length) groups.push(streetSkills);

    //     const academicSkills: SkillGroup = {
    //         group: "Knowledge (Academic) Skills",
    //         skills: Object.entries(knowledge.academic.value)
    //             .map(([id, skill]) => {
    //                 const attribute = skill.attribute as Shadowrun.ActorAttribute;
    //                 const limit = actor.getAttributes()[attribute]?.limit ?? '';
    //                 return {
    //                     id,
    //                     label: skill.label ?? skill.name,
    //                     attribute: attribute,
    //                     defaultLimit: limit
    //                 };
    //             })
    //             .sort(sortBy)
    //     };
    //     if (academicSkills.skills.length) groups.push(academicSkills);

    //     const professionalSkills: SkillGroup = {
    //         group: "Knowledge (Professional) Skills",
    //         skills: Object.entries(knowledge.professional.value)
    //             .map(([id, skill]) => {
    //                 const attribute = skill.attribute as Shadowrun.ActorAttribute;
    //                 const limit = actor.getAttributes()[attribute]?.limit ?? '';
    //                 return {
    //                     id,
    //                     label: skill.label ?? skill.name,
    //                     attribute: attribute,
    //                     defaultLimit: limit
    //                 };
    //             })
    //             .sort(sortBy)
    //     };
    //     if (professionalSkills.skills.length) groups.push(professionalSkills);

    //     const interestsSkills: SkillGroup = {
    //         group: "Knowledge (Interests) Skills",
    //         skills: Object.entries(knowledge.interests.value)
    //             .map(([id, skill]) => {
    //                 const attribute = skill.attribute as Shadowrun.ActorAttribute;
    //                 const limit = actor.getAttributes()[attribute]?.limit ?? '';
    //                 return {
    //                     id,
    //                     label: skill.label ?? skill.name,
    //                     attribute: attribute,
    //                     defaultLimit: limit
    //                 };
    //             })
    //             .sort(sortBy)
    //     };
    //     if (interestsSkills.skills.length) groups.push(interestsSkills);

    //     // Combine all lists into one sorted array
    //     return groups;
    // }

    // static buildAttributesList(actor: SR5Actor): { name: Shadowrun.ActorAttribute; label: string }[] {
    //     const attrs = actor.getAttributes(); // Shadowrun.Attributes
    //     return Object.entries(attrs)
    //         .map(([attrName, attrField]) => ({
    //             name: attrName as Shadowrun.ActorAttribute,
    //             label: game.i18n.localize(attrField.label as Translation)
    //         }));
    // }

}
