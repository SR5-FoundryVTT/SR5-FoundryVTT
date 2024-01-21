import { SR5Actor } from '../SR5Actor';
import {FLAGS, SYSTEM_NAME} from '../../constants';
import { SocketMessage } from "../../sockets";
import { SuccessTest } from '../../tests/SuccessTest';

export interface TeamworkMessageData {
    skill: string,
    additionalDice: number,
    additionalLimit: number,
    criticalGlitch: boolean
}
 
export class TeamworkTest {
    
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
        if( !html.find('.sr5-teamwork-addparticipant'))
            return;

        html.find('.sr5-teamwork-addparticipant').on('click', _ => this.addParticipant(message));
        html.find('.sr5-teamwork-start').on('click', _ => this.rollTeamworkTest(message));
    }

    static async addParticipant(message: ChatMessage) {
        let availableActors =  game.actors?.filter( e => e.isOwner && e.hasPlayerOwner) ?? [];
        let teamworkData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as TeamworkMessageData

        let actor: SR5Actor;

        if(availableActors.length == 0) {
            return
        }

        if(availableActors.length == 1) {
            actor = availableActors[0]
        }
        else {
            let allKeys = ''
            game.actors?.filter( e => e.isOwner && e.hasPlayerOwner).forEach(t => {
                    allKeys = allKeys.concat(`
                            <option value="${t.id}">${t.name}</option>`);
                });
            const  dialog_content = `  
                <select name ="actor">
                ${allKeys}
                </select>`;
    
            let choosenActor = await Dialog.prompt({
                title: game.i18n.localize('SR5.Skill.Teamwork.ParticipantActor'),
                content: dialog_content,
                callback: (html) => html.find('select').val()
            }) as string;
    
            actor = game.actors?.get(choosenActor) as SR5Actor;
        }

        let results = await actor?.rollSkill(teamworkData.skill) as SuccessTest;
        this.addResultsToMessage(message, actor, results, teamworkData)
    }

    static async addResultsToMessage(message: ChatMessage, actor: SR5Actor, results: SuccessTest, teamworkData: TeamworkMessageData) {
        //wrap the old content to presever it, this is necessary for pre-render hooks
        const wrapper = document.createElement("dív");
        //@ts-expect-error v11 type
        wrapper.innerHTML = message.content;

        let participantsRoot = wrapper.getElementsByClassName("sr5-teamwork-participants")[0];

        let roll = results.rolls[0];
        let netHits = results.data.values.netHits.value
        console.log(results)
        let participant = document.createElement('div');
        participant.innerHTML += actor.name + ": " + netHits;

        if(roll.glitched == true) {
            participant.innerHTML += " " + game.i18n.localize('SR5.Skill.Teamwork.Glitched')
        }

        teamworkData.additionalDice = (teamworkData.additionalDice ?? 0) + netHits;
        if(roll.total != 0 && roll.glitched != true) {
            teamworkData.additionalLimit = (teamworkData.additionalLimit ?? 0) + 1;
        }

        if(roll.total === 0 && roll.glitched) {
            teamworkData.criticalGlitch = true;
        }

        participantsRoot.appendChild(participant)

        if(game.user?.isGM) {
            message.setFlag(SYSTEM_NAME, FLAGS.Test, teamworkData)
            message.update({content: wrapper.innerHTML})
        }
        else {
            this._sendUpdateSocketMessage(message, wrapper.innerHTML, teamworkData)
        }

    }

    static async rollTeamworkTest(message: ChatMessage) {
        let teamworkData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as TeamworkMessageData
        //@ts-expect-error v11 type
        let actor = game.actors?.get(message.speaker.actor)
        
        actor?.rollTeamworktest(teamworkData.skill, teamworkData)
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
        message?.update({content: socketMessage.data.content})
    }

}
