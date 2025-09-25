import { SR5Actor } from '../SR5Actor';
import {FLAGS, SYSTEM_NAME} from '../../constants';
import { SocketMessage } from "../../sockets";
import { SuccessTest } from '../../tests/SuccessTest';
import { Helpers } from '../../helpers'

export interface TeamworkMessageData {
    skill: string,
    additionalDice: number,
    additionalLimit: number,
    criticalGlitch: boolean
}
 
export class TeamworkTest {
    
    static async chatLogListeners(chatLog: ChatLog, html) {
        const elements = $(html).find('.chat-message').toArray();

        for (const element of elements) {
            const id = $(element).data('messageId');
            const message = game.messages?.get(id);
            if (!message) continue;

            await this.chatMessageListeners(message, element);
        }
    }

    static async chatMessageListeners(message: ChatMessage, html) {
        html = $(html);
        if( !html?.find('.sr5-teamwork-addparticipant') ) return;

        $(html).find('.sr5-teamwork-addparticipant').on('click', async _ => await this.addParticipant(message));
        $(html).find('.sr5-teamwork-start').on('click', async _ => await this.rollTeamworkTest(message));
    }

    /**
     * This method prompts the user to roll the skill chosen in the teamwork test from a chosen actor @see Helpers.chooseFromAvailableActors
     * The result is forwarded to @see addResultsToMessage to add text and flag data to the original message
     * 
     * @param message 
     * @returns 
     */
    static async addParticipant(message: ChatMessage) {
        const actor = await Helpers.chooseFromAvailableActors() as SR5Actor;

        if (!actor) {
            //in a normal running game this should not happen
            ui.notifications?.error('SR5.Errors.NoAvailableActorFound', {localize: true});
            return
        }

        const teamworkData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as TeamworkMessageData
        const results = await actor?.rollSkill(teamworkData.skill) as SuccessTest;
        if(results.rolls.length > 0) {
            void this.addResultsToMessage(message, actor, results, teamworkData)
        }
    }

    /**
     * This method analyses the roll result and adds the text and flag data to the original message
     * @param message to add text too
     * @param actor that made the roll
     * @param results of the roll
     * @param teamworkData flag data to add too
     */
    static async addResultsToMessage(message: ChatMessage, actor: SR5Actor, results: SuccessTest, teamworkData: TeamworkMessageData) {
        //wrap the old content to presever it, this is necessary for pre-render hooks
        const wrapper = document.createElement("dív");
        wrapper.innerHTML = message.content;

        const participantsRoot = wrapper.getElementsByClassName("sr5-teamwork-participants")[0];

        const roll = results.rolls[0];
        const netHits = results.data.values.netHits.value
        console.log(results)
        const participant = document.createElement('div');
        participant.innerHTML += actor.name + ": " + netHits;

        if (roll.glitched) {
            participant.innerHTML += " " + game.i18n.localize('SR5.Skill.Teamwork.Glitched')
        }

        teamworkData.additionalDice = (teamworkData.additionalDice ?? 0) + netHits;
        if(roll.total !== 0 && !roll.glitched) {
            teamworkData.additionalLimit = (teamworkData.additionalLimit ?? 0) + 1;
        }

        if(roll.total === 0 && roll.glitched) {
            teamworkData.criticalGlitch = true;
        }

        participantsRoot.appendChild(participant)

        if(game.user?.isGM) {
            void message.setFlag(SYSTEM_NAME, FLAGS.Test, teamworkData)
            void message.update({content: wrapper.innerHTML})
        }
        else {
            void this._sendUpdateSocketMessage(message, wrapper.innerHTML, teamworkData)
        }

    }

    /**
     * This method prompts the roll of the final teamwork test of the leader
     * @param message 
     */
    static async rollTeamworkTest(message: ChatMessage) {
        const teamworkData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as TeamworkMessageData
        const actor = game.actors?.get(message.speaker.actor!) as SR5Actor;
        
        void actor?.rollTeamworkTest(teamworkData.skill, teamworkData)
    }

    /**
     * Send out a socket message to a connected GM to update the message.
     * @param actor The actor to create the effects on.
     * @param effectsData The effects data to be applied;
     */
    static async _sendUpdateSocketMessage(message: ChatMessage, content: string, teamworkData: TeamworkMessageData) {
        return SocketMessage.emitForGM(FLAGS.TeamworkTestFlow, { messageUuid: message.uuid, content, teamworkData });
    }

    /**
     * Handle a sent socket message to update the content and flags of a message.
     * @param {string} message.actorUuid Must contain the uuid of the actor to create the effects on.
     * @param {ActiveEffectData[]} message.effectsData Must contain a list of effects data to be applied.
     * @returns 
     */
    static async _handleUpdateSocketMessage(socketMessage: Shadowrun.SocketMessageData) {
        if (!Object.hasOwn(socketMessage.data, 'messageUuid') || !Object.hasOwn(socketMessage.data, 'content') || !Object.hasOwn(socketMessage.data, 'teamworkData')) {
            console.error(`Shadowrun 5e | Teamwork Socket Message is missing necessary properties`, socketMessage);
            return;
        }

        // todo type this properly
        const message = fromUuidSync(socketMessage.data.messageUuid) as any;

        await message?.setFlag(SYSTEM_NAME, FLAGS.Test, socketMessage.data.teamworkData);
        await message?.update({content: socketMessage.data.content});
    }
}
