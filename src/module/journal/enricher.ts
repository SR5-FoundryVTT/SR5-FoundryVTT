import { Helpers } from "../helpers";

export class JournalEnrichers {

    static get skillKeywords() {
        return ["Teamwork", "RollSkill"]
    };
    static get attributeKeywords() {
        return ["RollAttribute"];
    } 
    static get actorKeywords() {
        return this.skillKeywords.concat(this.attributeKeywords)
    }

    static setEnrichers() {
        const opening = "(\\[|\\()";
        const closing = "(\\]|\\))";
        const threshold = "\\s*(\\d*)"; 

        CONFIG.TextEditor.enrichers.push(
            {
                pattern: new RegExp(`\\@(${JournalEnrichers.actorKeywords.join("|")})${opening}([a-z]+)${threshold}${closing}`, "g"),
                enricher: (match, options) => {
                    const type = match[1]
                    const rollEntity = match[3] as string
                    const threshold = match[4]
                    let rollEntityName = JournalEnrichers.getRollEntityTranslation(type, rollEntity);
                    
                    return $(`<a class="sr5-roll-request" data-request="${type}" data-skill="${rollEntity}" data-threshold=${threshold}><em class="fas fa-dice"></em>${rollEntityName} ${threshold}</a>`)[0]
                }
            },
        )
    }    

    /**
     * This hook listens to roll-request clicks, extracts the data and forwards it to create a chat message
     * @param journal The journal where the roll is triggered
     * @param html the triggering html
     * @param data 
     */
    static async setEnricherHooks(journal, html, data) {
        const rolls = { 
            "Teamwork": "startTeamworkTest",
            "RollSkill": "rollSkill", 
            "RollAttribute": "rollAttribute" 
        } 

        html.on("click", ".sr5-roll-request", (ev) => {
            const element = ev.currentTarget

            const rollType = element.dataset.request
            const rollTypeName = "SR5.GMRequest." + rollType;
            const rollEntity = element.dataset.skill
            let rollEntityName = JournalEnrichers.getRollEntityTranslation(rollType, rollEntity);
            const threshold = element.dataset.threshold

            const templateData = {
                rollType: rolls[rollType],
                rollTypeName: rollTypeName,
                rollEntity: rollEntity,
                rollEntityName: rollEntityName,
                threshold: threshold
            }

            JournalEnrichers.createChatMessage(templateData);
        })
    }

    /**
     * This method provides translations respecting the rollType
     * @param type what rollType is requestd
     * @param rollEntity what should be rolled
     * @returns the translation or rollEntity when the keyword is unknown
     */
    static getRollEntityTranslation(type: string, rollEntity: string) {
        if(JournalEnrichers.skillKeywords.includes(type)) {
           return Helpers.getSkillTranslation(rollEntity)
        }

        if(JournalEnrichers.attributeKeywords.includes(type)) {
            return Helpers.getAttributeTranslation(rollEntity)
         }

        return rollEntity;
    }

    static async chatlogRequestHooks(html: JQuery<HTMLElement>) {
        const elements = html.find('.chat-message').toArray();

        for (const element of elements) {
            const id = $(element).data('messageId');
            const message = game.messages?.get(id);
            if (!message) continue;

            await this.messageRequestHooks(element);
        }
    }

    static async messageRequestHooks(html) {
        $(html).find('.sr5-requestAnswer').on('click', async (ev) => {
            const element = ev.currentTarget

            const rollType = element.dataset.request!;
            const rollEntity = element.dataset.rollentity;
            const threshold = parseInt(element.dataset.threshold!);

            const actor = await Helpers.chooseFromAvailableActors();

            if (actor) {
                //in a normal running game this should not happen
                actor[rollType](rollEntity, {threshold: {base: threshold, value: threshold} })
            } else {
                ui.notifications?.error('SR5.Errors.NoAvailableActorFound', {localize: true});
            }
        })
    }

    static async createChatMessage (templateData) {
        const html = await renderTemplate('systems/shadowrun5e/dist/templates/chat/rollRequest.html', templateData);
    
        const chatData = {
            user: game.user?.id,
            speaker:ChatMessage.getSpeaker(),
            content: html
        };

        await ChatMessage.create(chatData)
    };
}
