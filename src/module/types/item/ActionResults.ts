declare namespace Shadowrun {
    /**
     * Types around the concept of results following up cast actions.
     * 
     */

    /**
     * The set of results that are known
     */
     export type ResultActions = 
        'modifyCombatantInit' |
        'placeMarks';

     /**
      * Describes resulting actions to be displayed on a success test message as a
      * result of this test.
      * 
      * These designed to be manually applyable in a way depending on the action handler.
      */
      export interface ResultActionData {
         action: ResultActions, 
         label: string,
         value: string
     }
}