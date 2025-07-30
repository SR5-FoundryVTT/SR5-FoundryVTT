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
import { isNumberObject } from 'util/types';
type ActorAttribute = Shadowrun.ActorAttribute;

export type LimitKey = keyof typeof SR5.limits | '';

export interface TeamworkData {
    actor: SR5Actor;
    skill: SkillEntry;
    attribute?: AttributeEntry;
    threshold?: number;
    limit?: LimitEntry;
    allowOtherSkills: boolean;
}

export interface TeamworkMessageData extends TeamworkData {
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
    attribute: ActorAttribute;
    limit: LimitKey;
}

export interface AttributeEntry {
    name: ActorAttribute;
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

export interface TeamworkFlagData {
    actorId: string;
    skill: string;
    attribute?: ActorAttribute;
    threshold?: number;
    limit?: LimitKey | number | undefined;
    allowOtherSkills: boolean;
    additionalDice: Shadowrun.ValueMaxPair<number>;
    additionalLimit: number;
    criticalGlitched: boolean;
    specialization: boolean;
    participants: {
        actorId: string;
        netHits: number;
        glitched: boolean;
        criticalGlitched: boolean;
        differentSkill: string | undefined;
        differentAttribute: ActorAttribute | undefined;
        differentLimit: LimitKey | undefined;
    }[];
}

/**
 * Orchestrates the complete teamwork test workflow.
 *
 * This class handles:
 *  - Grouping and sorting available skills and attributes for the dialog.
 *  - Building and parsing message flags to persist state between interactions.
 *  - Rendering and updating the teamwork dialog in the chat log.
 *  - Adding, deleting, and managing participants (including leader logic).
 *  - Aggregating individual participant rolls and applying teamwork modifiers.
 *  - Executing the final combined roll with limits, dice-pool adjustments, and specialization.
 *  - Synchronizing updates across clients via socket messages for non-GM users.
 */
export class TeamworkFlow {

/**
 * Builds grouped and sorted skill lists for the teamwork dialog.
 *
 * @param actor Optional {@link SR5Actor} whose skills will be grouped. If omitted or null, returns an empty array.
 * @returns An array of {@link SkillGroup} objects, each containing a `group` label and its sorted `skills` array.
 *
 * This method:
 *  - Filters the actor’s skills into three categories: active, language, and knowledge.
 *  - Sorts each category alphabetically by skill label.
 *  - Converts each skill entry into the format required by the dialog dropdown.
 *  - Returns a structure mapping category names to their respective sorted skill arrays.
 */
    static buildSkillGroups(actor?: SR5Actor): SkillGroup[] {
        if (!actor) return [];
        const { active, language, knowledge } = actor.getSkills();
        const attrs = actor.getAttributes();
        const sortBy = (a: SkillEntry, b: SkillEntry) =>
            a.label.localeCompare(b.label);

        const groups: SkillGroup[] = [];

        // Active Skills
        const activeSkills = Object.keys(active)
            .map((id) => this.constructSkillEntry({ id }, actor))
            .filter((entry): entry is SkillEntry => Boolean(entry?.id))
            .sort(sortBy);
        if (activeSkills.length) groups.push({ group: "Active Skills", skills: activeSkills });

        // Language Skills
        const languageSkills: SkillEntry[] = Object.keys(language.value ?? {})
            .map((id) => this.constructSkillEntry({ id }, actor))
            .filter((entry): entry is SkillEntry => Boolean(entry?.id))
            .sort(sortBy);

        if (languageSkills.length) {
            groups.push({ group: "Language Skills", skills: languageSkills });
        }


        // Knowledge‐Groups
        for (const [catKey, catList] of Object.entries(knowledge) as [keyof Shadowrun.KnowledgeSkills, Shadowrun.KnowledgeSkillList][]) {
            const list: SkillEntry[] = Object.keys(catList.value ?? {})
                .map((id) => this.constructSkillEntry({ id }, actor))
                .filter((entry): entry is SkillEntry => Boolean(entry?.id))
                .sort(sortBy);
            if (list.length) groups.push({ group: `Knowledge (${catKey})`, skills: list });
        }

        return groups;
    }

    /**
 * Constructs a flat, alphabetically sorted list of actor attributes for the dialog.
 *
 * @param actor The {@link SR5Actor} whose attributes will be listed.
 * @returns An array of objects each containing:
 *   - `name`: the attribute key ({@link ActorAttribute})
 *   - `label`: the localized display label (string)
 */
    static buildAttributeList(actor: SR5Actor): { name: ActorAttribute; label: string }[] {
        return Object.entries(actor.getAttributes())
            .map(([key, field]) => ({
                name: key as ActorAttribute,
                label: game.i18n.localize(field.label as Translation)
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

/**
 * Normalizes a raw limit input into a consistent {@link LimitEntry} object.
 *
 * @param data Optional raw limit value:
 *   - If a numeric string or number, returns a `LimitEntry` with `base` set to that value.
 *   - If a string matching a known limit key (in {@link SR5.limits}), returns a named `LimitEntry` with associated label.
 *   - Otherwise returns an empty `LimitEntry` (`name` and `label` empty).
 * @returns A {@link LimitEntry} object with either:
 *   - `base` populated for numeric inputs, or
 *   - `name` and `label` populated for named limits.
 */
    static constructLimitEntry(data?: string | number): LimitEntry {
        if (data && !isNaN(+data!)) {
            return {
                name: "",
                label: "",
                base: +data
            } as LimitEntry;
        } else if (typeof data === "string" && data in SR5.limits) {
            return {
                name: data as LimitKey,
                label: SR5.limits[data]
            }
        }

        return { name: "", label: "" };
    }

/**
 * Normalizes an attribute key into an {@link AttributeEntry}.
 *
 * @param data Optional attribute key ({@link ActorAttribute}).
 *   - If `data` matches a key in {@link SR5.attributes}, returns an entry with `name` and localized `label`.
 *   - Otherwise returns `undefined`.
 * @returns An {@link AttributeEntry} object or `undefined` if `data` is invalid.
 */
    static constructAttributeEntry(data?: ActorAttribute): AttributeEntry | undefined {
        if (typeof data === "string" && data in SR5.attributes) {
            return {
                name: data as ActorAttribute,
                label: SR5.attributes[data]
            }
        }

        return;
    }

    /**
 * Constructs a full {@link SkillEntry} from a raw skill ID, enriching with actor-specific data if available.
 *
 * @param data  An object containing the `id` of the skill to construct.
 * @param actor Optional {@link SR5Actor} whose skill definitions provide label, attribute, and limit information.
 * @returns A {@link SkillEntry} with:
 *   - `id`: the provided skill identifier.
 *   - `label`: localized skill label (falls back to `skill.name` or `SR5.activeSkills[id]`).
 *   - `attribute`: primary attribute key for the skill, or empty string if unavailable.
 *   - `limit`: associated limit key for the skill’s attribute, or empty string if unavailable.
 */
    static constructSkillEntry(data: Pick<SkillEntry, "id">, actor?: SR5Actor): SkillEntry {
        const id = data.id;
        if (actor && id) {
            const skill = actor.getSkill(id);
            if (skill) return {
                id: id,
                label: (game.i18n.localize(skill.label as Translation) ?? "").trim() || skill.name,
                attribute: skill.attribute as ActorAttribute,
                limit: actor.getAttributes()[skill.attribute]?.limit as LimitKey ?? ""
            }
        }

        return {
            id,
            label:
                id && id in SR5.activeSkills
                    ? game.i18n.localize(SR5.activeSkills[id] as Translation)
                    : "",
            attribute: "",
            limit: ""
        }
    }

    /**
 * Persists the teamwork test state by attaching all relevant data as flags on the ChatMessage.
 *
 * @param message    The {@link ChatMessage} to update with teamwork flags.
 * @param data       The {@link TeamworkMessageData}  
 * @throws Error    If `data.actor.id` or `data.skill.id` is missing, or if any participant actor ID is absent.
 * @returns          A Promise that resolves once the flag has been set.
 */
    static async setTeamworkMessageFlag(message: ChatMessage, data: TeamworkMessageData): Promise<void> {

        if (!data.actor?.id) throw new Error("TeamworkData: actor.id fehlt");
        if (!data.skill?.id) throw new Error("TeamworkData: skill.id fehlt");

        const flagData: TeamworkFlagData = {
            actorId: data.actor.id,
            skill: data.skill.id,
            attribute: data.attribute?.name,
            threshold: data.threshold,
            limit: typeof data.limit?.base === "number" ? data.limit.base :
                data.limit?.name ?? undefined,
            allowOtherSkills: data.allowOtherSkills,
            additionalDice: data.additionalDice,
            additionalLimit: data.additionalLimit,
            criticalGlitched: data.criticalGlitched,
            specialization: data.specialization,
            participants: data.participants.map(p => {
                if (!p.actor?.id) {
                    throw new Error("TeamworkFlagData: participant.actor.id is missing");
                }
                return {
                    actorId: p.actor.id,
                    netHits: p.netHits,
                    glitched: p.glitched,
                    criticalGlitched: p.criticalGlitched,
                    differentSkill: p.differentSkill?.id,
                    differentAttribute: p.differentAttribute?.name,
                    differentLimit: p.differentLimit?.name,
                };
            }),
        };

        await message.setFlag(SYSTEM_NAME, FLAGS.Test, flagData);
    }

    /**
 * Reads and normalizes teamwork data from a ChatMessage’s flags into a typed `TeamworkMessageData` object.
 *
 * @param message The {@link ChatMessage} that contains the teamwork flags under the system namespace.
 * @returns A Promise resolving to a fully reconstructed `TeamworkMessageData`  
 * @throws Error if:
 *   - no teamwork flag is found on the message  
 *   - the main actor or any participant actor cannot be retrieved by ID  
 */
    static async getTeamworkMessageData(message: ChatMessage): Promise<TeamworkMessageData> {
        const flag = await message.getFlag(SYSTEM_NAME, FLAGS.Test) as TeamworkFlagData;
        if (!flag) throw new Error("Kein Teamwork-Daten-Flag an der Nachricht gefunden");

        console.log("getTeamworkMessageData flag", flag);

        const actor = game.actors?.get(flag.actorId) as SR5Actor;
        if (!actor) {
            throw new Error(`Actor with ID ${flag.actorId} not found`);
        }

        const skill: SkillEntry = this.constructSkillEntry({ id: flag.skill }, actor);

        const attribute: AttributeEntry | undefined = this.constructAttributeEntry(flag.attribute);

        const limit: LimitEntry = this.constructLimitEntry(flag.limit);

        const participants: ParticipantEntry[] = flag.participants.map(p => {
            const participantActor: SR5Actor | undefined = game.actors?.get(p.actorId);
            if (!participantActor) {
                throw new Error(`Participant Actor with ID ${flag.actorId} not found`);
            }
            return {
                actor: participantActor,
                netHits: p.netHits,
                glitched: p.glitched,
                criticalGlitched: p.criticalGlitched,
                differentSkill: p.differentSkill ? participantActor.getSkill(p.differentSkill) : undefined,
                differentAttribute: this.constructAttributeEntry(p.differentAttribute),
                differentLimit: this.constructLimitEntry(p.differentLimit)
            };
        });

        return {
            actor,
            skill,
            attribute,
            threshold: flag.threshold,
            limit,
            allowOtherSkills: flag.allowOtherSkills,
            additionalDice: flag.additionalDice,
            additionalLimit: flag.additionalLimit,
            criticalGlitched: flag.criticalGlitched,
            specialization: flag.specialization,
            participants,
        };
    }

/**
 * Provides a localized, alphabetically sorted list of all limit options.
 *
 * @returns An array of objects each containing:
 *   - `name`: the limit key ({@link LimitKey})
 *   - `label`: the localized display label (string)
 */
    static get limitList(): { name: LimitKey; label: string }[] {
        return Object.entries(SR5.limits)
            .map(([key, label]) => ({
                name: key as LimitKey,
                label: game.i18n.localize(label as Translation)
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    /**
 * Retrieves all actors the current user owns.
 *
 * @returns An array of {@link SR5Actor} instances for which the user has “OWNER” permission,
 *          or `undefined` if the game user or actor collection is unavailable.
 */
    static get actorList(): SR5Actor[] | undefined {
        const user = game.user;
        if (!user || !game.actors) return;
        return game.actors?.filter(actor =>
            actor.testUserPermission(user, "OWNER")
        )
    }

    /**
 * Initializes per-message listeners for teamwork controls within the chat log.
 *
 * Iterates over each rendered chat message element and delegates to
 * `chatMessageListeners` to bind specific handlers in the context of that message.
 *
 * @param chatLog  The {@link ChatLog} instance containing messages.
 * @param html     The root HTML element (or jQuery object) of the chat log content.
 * @returns        A Promise that resolves once all message listeners have been attached.
 */
    static async chatLogListeners(chatLog: ChatLog, html) {
        // @ts-expect-error TODO: querySelectorAll?
        $(html).find('.chat-message').each(async (index, element) => {
            const id = $(element).data('messageId');
            const message = game.messages?.get(id);
            if (!message) return;

            await this.chatMessageListeners(message, element)
        });
    }

    /**
 * Binds teamwork-specific event handlers to controls within a single chat message element.
 *
 * For a given `ChatMessage` and its rendered HTML:
 *  - Toggles participant detail visibility on clicking the details header.
 *  - Handles removal of a participant via the delete control.
 *  - Hooks up “add participant” and “start teamwork test” actions.
 *
 * @param message The {@link ChatMessage} instance to which these listeners apply.
 * @param html    The root HTML element (or jQuery object) of the specific chat message.
 * @returns       A Promise that resolves once handlers are attached.
 */
    static async chatMessageListeners(message: ChatMessage, html) {
        html = $(html);
        if (!html?.find('.sr5-teamwork-addparticipant')) return;

        html.find(".show-participant-details").on("click", (event) => {
            if ($(event.target).closest("a, button, .roll").length > 0) return;

            const card = $(event.currentTarget).closest(".teamwork-participant");
            const details = card.find(".participant-details");
            details.slideToggle(200);
        });

        html.find('.delete-participant').on('click', async (event) => {
            event.preventDefault();
            event.stopPropagation(); 

            const actorId = $(event.currentTarget).data("actorId");
            if (!actorId) return;

            await this.deleteParticipant(message, actorId);
        });

        $(html).find('.sr5-teamwork-addparticipant').on('click', _ => this.addParticipant(message));
        $(html).find('.sr5-teamwork-start').on('click', _ => this.rollTeamworkTest(message));
    }

    /**
 * Displays the TeamworkDialog and returns the user’s selections.
 *
 * @param data  Initial parameters for the dialog:
 *   - `actors`: list of eligible {@link SR5Actor} options
 *   - `actor?`: pre-selected actor (if any)
 *   - `skill?`, `attribute?`, `threshold?`, `allowOtherSkills?`, `limit?`: pre-filled values
 *   - `request?`: if true, forces a request-only mode (no immediate roll)
 * @returns      A promise resolving to:
 *   - Partial {@link TeamworkData} with selected fields
 *   - `specialization?`: whether specialization was toggled
 *   - `cancelled?`: true if the dialog was closed without selection
 */
    static async showTeamworkDialog(data: {
        actors: SR5Actor[];
        actor?: SR5Actor;
        skill?: SkillEntry;
        attribute?: AttributeEntry;
        threshold?: number;
        allowOtherSkills?: boolean;
        limit?: LimitEntry;
        request?: boolean;
    }): Promise<Partial<TeamworkData> & { specialization?: boolean, cancelled?: boolean }> {
        if (!data.actors.length) return { cancelled: true };
        const dialogData = await new TeamWorkDialog(data).select();

        if (!dialogData.actor) return { cancelled: true };

        console.log("showTeamworkDialog data", dialogData)

        return dialogData ?? { cancelled: true };
    }
    
    /**
 * Initiates the teamwork test by displaying the selection dialog and posting the initial chat message.
 *
 * This method:
 *  1. Ensures a valid actor is available (uses `data.actor` or prompts via {@link JournalEnrichers.findActor}).
 *  2. Opens the teamwork dialog with pre-filled or default values.
 *  3. Aborts if the dialog is cancelled or missing required selections.
 *  4. Builds the initial {@link TeamworkMessageData} object with defaults for dice, limit, and participants.
 *  5. Renders the teamwork request template into chat.
 *  6. Attaches the teamwork data as flags on the created message.
 *
 * @param data Partial initial parameters for the teamwork test:
 *   - `actor?`: pre-selected {@link SR5Actor}
 *   - `skill?`, `attribute?`, `threshold?`, `limit?`, `allowOtherSkills?`
 * @returns A Promise that resolves once the teamwork chat message has been created and flagged,
 *          or returns early (void) if cancelled or on error.
 */
    static async initiateTeamworkTest(data: Partial<TeamworkData>) {
        const user = game.user;
        if (!user || !game.actors) return;

        let actor = data.actor;
        if (!actor) {
            actor = await JournalEnrichers.findActor();
            if (!actor) {
                return ui.notifications?.error("Kein valider Akteur gefunden.");
            }
        }

        const skill = data.skill ? data.skill : undefined

        const dialogData = await this.showTeamworkDialog({
            actors: this.actorList ?? [actor],
            actor,
            skill,
            attribute: data.attribute ? data.attribute : this.constructAttributeEntry(skill?.attribute),
            threshold: data.threshold ?? undefined,
            allowOtherSkills: data.allowOtherSkills ?? false,
            limit: data.limit ?? this.constructLimitEntry(),
            request: true
        });

        console.log("initiateTeamworkTest data", dialogData)

        if (dialogData.cancelled || !dialogData.actor || !dialogData.skill || !dialogData.attribute) return;

        const teamworkData: TeamworkMessageData = {
            actor: dialogData.actor,
            skill: dialogData.skill,
            attribute: dialogData.attribute,
            threshold: dialogData.threshold,
            limit: dialogData.limit,
            allowOtherSkills: dialogData.allowOtherSkills!,
            participants: [],
            criticalGlitched: false,
            additionalDice: {
                value: 0,
                max: actor.getSkill(dialogData.skill!.id)?.base ?? 0

            },
            additionalLimit: 0,
            specialization: dialogData.specialization!
        };

        console.log("initiateTeamworkTest teamworkData", teamworkData)

        const content = await renderTemplate("systems/shadowrun5e/dist/templates/chat/teamworkRequest.html", teamworkData);
        const msg = await ChatMessage.create({
            user: user.id,
            speaker: ChatMessage.getSpeaker(),
            content
        });

        if (!msg) {
            return ui.notifications?.error("Teamwork-Nachricht nicht gefunden");
        }

        await this.setTeamworkMessageFlag(msg, teamworkData);
    }

    /**
 * Handles adding a new participant to an ongoing teamwork test.
 *
 * This method:
 *  1. Retrieves the existing teamwork state from the message flags.
 *  2. Calculates which actors are still eligible (excludes duplicates and, by setting, the leader).
 *  3. Prompts the user to select an actor and test parameters via the teamwork dialog.
 *  4. Builds a `SkillActionData` for the selected actor, applying attribute, threshold, and limit overrides.
 *  5. Executes the individual participant’s skill test.
 *  6. Appends the result to the teamwork flags and updates the chat message display.
 *
 * @param message The {@link ChatMessage} containing the current teamwork test flags.
 * @returns       A Promise that resolves once the participant has been rolled and the message updated,
 *                or returns early (void) if cancelled or on error.
 */
    static async addParticipant(message: ChatMessage) {
        const user = game.user;
        if (!user || !game.actors || !message) return;

        const teamworkData = await this.getTeamworkMessageData(message);



        console.log("addParticipants contributingActorIds: ", teamworkData);

        const contributingActorIds = [
            (!game.settings.get(SYSTEM_NAME, FLAGS.AllowLeaderAsParticipantForTeamworkTests) as boolean)
                ? teamworkData.actor?.id
                : undefined,
            ...(teamworkData.participants?.map(p => p.actor.id) ?? [])
        ].filter(Boolean);

        console.log("addParticipants contributingActorIds: ", contributingActorIds)

        const baseActor = await JournalEnrichers.findActor();

        const actorList = (this.actorList ?? []).filter(a => !contributingActorIds.includes(a.id));

        const preselectedActor = actorList.some(a => a.id === baseActor?.id) ? baseActor : undefined;

        const skill = teamworkData.skill ? this.constructSkillEntry({ id: teamworkData.skill.id ?? teamworkData.skill.label ?? "" }, baseActor) : undefined

        console.log("addParticipants actorlist: ", actorList)

        // TODO: Fehlerbehandlung
        if (actorList.length === 0) return;

        const dialogData = await this.showTeamworkDialog({
            actors: actorList,
            actor: preselectedActor,
            skill,
            attribute: teamworkData.attribute ? teamworkData.attribute : this.constructAttributeEntry(skill?.attribute),
            threshold: teamworkData.threshold ?? undefined,
            allowOtherSkills: teamworkData.allowOtherSkills ?? false,
            limit: teamworkData.limit ?? this.constructLimitEntry(),
            request: true
        });

        if (!dialogData || dialogData.cancelled || !dialogData.actor || !dialogData.skill || !dialogData.attribute) return;

        console.log(dialogData)

        const skillAction: Shadowrun.ActionRollData | undefined = dialogData.actor.skillActionData(dialogData.skill!.id, { specialization: dialogData.specialization });
        if (!skillAction) {
            return;
        }
     
        skillAction.attribute = dialogData.attribute!.name;

        const threshold = dialogData.threshold ?? 0;
        skillAction.threshold = { value: threshold, base: threshold };

        const limit = dialogData.limit;
        if (limit?.base != null && !isNaN(limit.base)) {
            skillAction.limit.value = limit.base;
            skillAction.limit.base = limit.base;
        } else if (limit?.name) {
            const actual = dialogData.actor.getLimit(limit.name).base ?? 0;
            skillAction.limit.value = actual;
            skillAction.limit.base = actual;
            skillAction.limit.attribute = limit.name as Shadowrun.LimitAttribute;
        }

        console.log("addParticipant: ", dialogData.actor)

        try {
            console.log("addParticipant SkillAction: ", skillAction)

            const test = await TestCreator.fromAction(skillAction, dialogData.actor);
            if (!test) return;
            test.data.title = teamworkData.skill.label;
            const results = await test.execute() as SuccessTest;

            await TeamworkFlow.addResultsToMessage(
                message,
                dialogData.actor,
                results
            );
        } catch (err) {
            //TODO: Lokalisierung
            console.error("Fehler im Teilnehmer-Wurf:", err);
            ui.notifications?.error("Fehler im Teilnehmer-Wurf:", err);
        }
    }

/**
 * Removes a participant from an ongoing teamwork test and updates the chat message.
 *
 * This method:
 *  - Loads the current {@link TeamworkMessageData} from the message flags.
 *  - Finds and validates the target participant.
 *    • Only GMs can remove a critical-glitched participant.
 *    • Non-GMs must be the owner of the participant actor.
 *  - Filters out the specified participant and clears the overall `criticalGlitched` flag
 *    if no participants remain critical-glitched.
 *  - Renders the updated teamwork request template.
 *  - If the current user is GM, updates the message content and flags directly;
 *    otherwise sends the update via socket synchronization.
 *
 * @param message The {@link ChatMessage} containing the teamwork test.
 * @param actorId The actor ID of the participant to remove.
 * @returns A Promise that resolves once the message and flags have been updated.
 */
    static async deleteParticipant(message: ChatMessage, actorId: string) {
        const teamworkData = await this.getTeamworkMessageData(message);

        const participant = teamworkData.participants.find(p => p.actor.id === actorId);
        if (!participant) return;

        const user = game.user;

        if (!user) return;
        const isOwner = participant.actor.testUserPermission(user, "OWNER");

        if (participant.criticalGlitched && !user.isGM) {
            ui.notifications?.warn("SR5.Warning.OnlyGMCanRemoveCritical");
            return;
        }

        if (!user?.isGM && !isOwner) {
            ui.notifications?.warn("SR5.Warning.NotAuthorized");
            return;
        }

        teamworkData.participants = teamworkData.participants.filter(p => p.actor.id !== actorId);

        if (participant.criticalGlitched) {
            const stillCritical = teamworkData.participants.some(p => p.criticalGlitched);
            if (!stillCritical) {
                teamworkData.criticalGlitched = false;
            }
        }

        const content = await renderTemplate(
            "systems/shadowrun5e/dist/templates/chat/teamworkRequest.html",
            teamworkData
        );

        if (user?.isGM) {
            await this.setTeamworkMessageFlag(message, teamworkData);
            await message.update({ content });
        } else {
            await this._sendUpdateSocketMessage(message, content, teamworkData);
        }
    }


    /**
 * Appends a participant’s test results to the teamwork message and updates the chat content.
 *
 * This method:
 *  1. Retrieves existing teamwork state from the message flags.
 *  2. Computes net hits, glitch, and critical glitch status from the provided `SuccessTest`.
 *  3. Determines any overrides for skill, attribute, or limit compared to the original test.
 *  4. Updates the teamwork data: adds the participant entry, increments additional dice and limit values, and updates the overall glitch flag.
 *  5. Renders the updated teamwork request template.
 *  6. Persists the new state and content: directly for GMs or via socket synchronization for non-GMs.
 *
 * @param message The {@link ChatMessage} to update.
 * @param actor   The {@link SR5Actor} who just performed the test.
 * @param results A {@link SuccessTest} containing the roll outcome and metadata.
 * @returns       A Promise that resolves once the chat message and flags are updated.
 */
    static async addResultsToMessage(message: ChatMessage, actor: SR5Actor, results: SuccessTest) {

        const teamworkData = await this.getTeamworkMessageData(message);

        const netHits = results.data.values.netHits.value;
        teamworkData.participants.push({
            actor: actor,
            netHits,
            glitched: results.rolls[0].glitched,
            criticalGlitched: results.rolls[0].criticalGlitched,
            differentSkill: results.data.action.skill !== teamworkData.skill.id ? actor.getSkill(results.data.action.skill) : undefined,
            differentAttribute: results.data.action.attribute !== teamworkData.attribute?.name
                ? this.constructAttributeEntry(results.data.action.attribute)
                : undefined,
            differentLimit:
                teamworkData.limit?.base !== undefined
                    ? (
                        results.data.action.limit.base !== teamworkData.limit.base
                            ? { name: '', label: '', base: results.data.action.limit.base }
                            : undefined
                    )
                    : (
                        results.data.action.limit.attribute !== teamworkData.limit?.name
                            ? {
                                name: results.data.action.limit.attribute as LimitKey,
                                label: SR5.limits[results.data.action.limit.attribute],
                            }
                            : undefined
                    )
        });

        const content = await renderTemplate(
            "systems/shadowrun5e/dist/templates/chat/teamworkRequest.html",
            teamworkData
        );

        teamworkData.additionalDice.value = (teamworkData.additionalDice.value ?? 0) + netHits;
        teamworkData.additionalLimit = (teamworkData.additionalLimit ?? 0) + (results.rolls[0].total > 0 && !results.rolls[0].glitched ? 1 : 0);
        teamworkData.criticalGlitched = teamworkData.criticalGlitched || (results.rolls[0].criticalGlitched);

        try {
            if (game.user?.isGM) {
                await this.setTeamworkMessageFlag(message, teamworkData);
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
 * Executes the final teamwork roll if the user has permission.
 *
 * This method:
 *  1. Retrieves the current teamwork state from the message flags.
 *  2. Checks that the current user is either GM or the owner of the initiating actor.
 *  3. Delegates to the actor’s `rollTeamworkTest` method with the accumulated teamwork data.
 *
 * @param message The {@link ChatMessage} containing the teamwork test data.
 * @returns       A Promise that resolves once the teamwork roll is initiated, or returns early if unauthorized or data is missing.
 */
    static async rollTeamworkTest(message: ChatMessage) {
        const teamworkData = await this.getTeamworkMessageData(message);
        const actor = teamworkData.actor;
        const user = game.user;

        if (!actor || !user) return;

        const isOwner = actor.testUserPermission(user, "OWNER");
        if (!user?.isGM && !isOwner) {
            ui.notifications?.warn("SR5.Warning.NotAuthorized");
            return;
        }

        await teamworkData.actor.rollTeamworkTest(teamworkData);
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

        const message = fromUuidSync(socketMessage.data.messageUuid) as ChatMessage;

        //TODO: Fehlerbehandlung
        if (!message) return;

        await this.setTeamworkMessageFlag(message, socketMessage.data.teamworkData);

        message?.update({ content: socketMessage.data.content })
    }
}
