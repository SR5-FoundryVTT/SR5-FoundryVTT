declare namespace Shadowrun {
   /**
     * Types around the concept of results following up cast actions.
     * 
     * This would happen if the original action is meant to result in some kind of follow up that should be triggered by user input.
     * NOTE: This approach is currently not widely used and might be removed in the future.
     */

   /**
     * The set of results that are known.
     */
   export type ResultActions =
      'forceReboot' | 'modifyCombatantInit';

   /**
      * Describes resulting actions to be displayed on a success test message as a
      * result of this test.
      * 
      * These designed to be manually applicable in a way depending on the action handler.
      */
   export interface ResultActionData {
      action: ResultActions,
      label: string,
      value: string
   }
}