/*
 * Interface to interact with Dice So Nice module.
 * https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/blob/master/module/Dice3D.js
 */
export interface DiceSoNice {
    /**
     * Show the 3D Dice animation for the Roll made by the User.
     *
     * @param roll an instance of Roll class to show 3D dice animation.
     * @param user the user who made the roll (game.user by default).
     * @param synchronize if the animation needs to be sent and played for each players (true/false).
     * @param users list of users or userId who can see the roll, leave it empty if everyone can see.
     * @param blind if the roll is blind for the current user
     * @param messageID ChatMessage related to this roll (default: null)
     * @param speaker Object based on the ChatSpeakerData data schema related to this roll. Useful to fully support DsN settings like "hide npc rolls". (Default: null)
     * @param options Object with 2 booleans: ghost (default: false) and secret (default: false)
     * @returns {Promise<boolean>} when resolved true if the animation was displayed, false if not.
     */
    showForRoll: (
        roll: Roll,
        user: User,
        synchronize: boolean,
        users: User[] | null,
        blind: boolean,
        messageID?: string,
        speaker?: foundry.documents.ChatMessage.SpeakerData | null,
        options?: { ghost?: boolean, secret?: boolean }
    ) => Promise<boolean>;
}
